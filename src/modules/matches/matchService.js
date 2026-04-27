const db = require("../../dbConfig");
const { AppError } = require("../../middlewares/errorMiddleware");

function normalizeCreatePayload(data = {}) {
  const tournamentId = String(data.tournament_id ?? data.tournamentId ?? "").trim();
  const homeTeamId = String(data.home_team_id ?? data.homeTeamId ?? "").trim();
  const awayTeamId = String(data.away_team_id ?? data.awayTeamId ?? "").trim();
  const stadium = String(data.stadium ?? "").trim();
  const matchRound = String(data.match_round ?? data.matchRound ?? "").trim();
  const startTimeRaw = data.start_time ?? data.startTime;

  return {
    tournamentId,
    homeTeamId,
    awayTeamId,
    stadium,
    matchRound,
    startTimeRaw,
  };
}

function formatMySqlDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function toDateOnlyString(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  return "";
}

function validateCreateMatchPayload(payload) {
  const {
    tournamentId,
    homeTeamId,
    awayTeamId,
    stadium,
    matchRound,
    startTimeRaw,
  } = payload;

  if (!tournamentId) {
    throw new AppError("tournament_id is required", 400, "VALIDATION_ERROR");
  }

  if (!homeTeamId) {
    throw new AppError("home_team_id is required", 400, "VALIDATION_ERROR");
  }

  if (!awayTeamId) {
    throw new AppError("away_team_id is required", 400, "VALIDATION_ERROR");
  }

  if (homeTeamId === awayTeamId) {
    throw new AppError("Home team and away team must be different", 400, "SAME_TEAM_MATCH");
  }

  if (typeof startTimeRaw !== "string" && !(startTimeRaw instanceof Date)) {
    throw new AppError("start_time is required", 400, "VALIDATION_ERROR");
  }

  const startTime = formatMySqlDateTime(startTimeRaw);
  if (!startTime) {
    throw new AppError("Invalid start_time format", 400, "INVALID_START_TIME");
  }

  if (stadium.length > 150) {
    throw new AppError("stadium must be at most 150 characters", 400, "VALIDATION_ERROR");
  }

  if (matchRound.length > 50) {
    throw new AppError("match_round must be at most 50 characters", 400, "VALIDATION_ERROR");
  }

  return {
    tournamentId,
    homeTeamId,
    awayTeamId,
    stadium,
    matchRound,
    startTime,
  };
}

exports.createMatch = async (data, organizerId) => {
  const payload = validateCreateMatchPayload(normalizeCreatePayload(data));
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [tournamentRows] = await connection.query(
      `SELECT id, organizer_id, start_date, end_date, status
       FROM tournaments
       WHERE id = ?
       LIMIT 1`,
      [payload.tournamentId],
    );

    if (tournamentRows.length === 0) {
      throw new AppError("Tournament not found", 404, "TOURNAMENT_NOT_FOUND");
    }

    const tournament = tournamentRows[0];
    if (String(tournament.organizer_id) !== String(organizerId)) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    if (tournament.status === "COMPLETED") {
      throw new AppError("Tournament is completed", 400, "TOURNAMENT_COMPLETED");
    }

    const matchDate = payload.startTime.slice(0, 10);
    const tournamentStartDate = toDateOnlyString(tournament.start_date);
    const tournamentEndDate = toDateOnlyString(tournament.end_date);

    if (
      !tournamentStartDate
      || !tournamentEndDate
      || matchDate < tournamentStartDate
      || matchDate > tournamentEndDate
    ) {
      throw new AppError(
        "start_time must be within tournament date range",
        400,
        "INVALID_MATCH_TIME_RANGE",
      );
    }

    const [teamRows] = await connection.query(
      `SELECT id, name, logo_url
       FROM teams
       WHERE id IN (?, ?)`,
      [payload.homeTeamId, payload.awayTeamId],
    );

    if (teamRows.length !== 2) {
      throw new AppError("One or both teams not found", 404, "TEAM_NOT_FOUND");
    }

    await connection.query(
      `INSERT INTO tournament_teams (tournament_id, team_id, status)
       VALUES (?, ?, 'APPROVED'), (?, ?, 'APPROVED')
       ON DUPLICATE KEY UPDATE status = 'APPROVED'`,
      [
        payload.tournamentId, payload.homeTeamId,
        payload.tournamentId, payload.awayTeamId
      ]
    );

    const [duplicateRows] = await connection.query(
      `SELECT id
       FROM matches
       WHERE tournament_id = ?
         AND is_cancelled = 0
         AND start_time = ?
         AND (
              (home_team_id = ? AND away_team_id = ?)
              OR
              (home_team_id = ? AND away_team_id = ?)
         )
       LIMIT 1`,
      [
        payload.tournamentId,
        payload.startTime,
        payload.homeTeamId,
        payload.awayTeamId,
        payload.awayTeamId,
        payload.homeTeamId,
      ],
    );

    if (duplicateRows.length > 0) {
      throw new AppError(
        "A match with the same teams and start_time already exists",
        409,
        "DUPLICATE_MATCH",
      );
    }

    const [conflictRows] = await connection.query(
      `SELECT id
       FROM matches
       WHERE is_cancelled = 0
         AND start_time = ?
         AND (
              home_team_id IN (?, ?)
              OR away_team_id IN (?, ?)
         )
       LIMIT 1`,
      [
        payload.startTime,
        payload.homeTeamId,
        payload.awayTeamId,
        payload.homeTeamId,
        payload.awayTeamId,
      ],
    );

    if (conflictRows.length > 0) {
      throw new AppError(
        "One of these teams already has another match at this start_time",
        409,
        "TEAM_SCHEDULE_CONFLICT",
      );
    }

    const [[uuidRow]] = await connection.query("SELECT UUID() AS id");
    const matchId = uuidRow.id;

    await connection.query(
      `INSERT INTO matches (
          id,
          tournament_id,
          home_team_id,
          away_team_id,
          stadium,
          start_time,
          match_round
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        matchId,
        payload.tournamentId,
        payload.homeTeamId,
        payload.awayTeamId,
        payload.stadium,
        payload.startTime,
        payload.matchRound,
      ],
    );

    const [createdRows] = await connection.query(
      `SELECT
          m.id,
          m.tournament_id,
          t.name AS tournament_name,
          m.home_team_id,
          ht.name AS home_team_name,
          ht.logo_url AS home_team_logo,
          m.away_team_id,
          at.name AS away_team_name,
          at.logo_url AS away_team_logo,
          m.stadium,
          m.start_time,
          m.match_round,
          m.is_active,
          m.is_cancelled,
          m.home_score,
          m.away_score,
          m.created_at,
          m.updated_at
       FROM matches m
       JOIN tournaments t ON t.id = m.tournament_id
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       WHERE m.id = ?
       LIMIT 1`,
      [matchId],
    );

    await connection.commit();

    const created = createdRows[0];
    return {
      id: created.id,
      tournament: {
        id: created.tournament_id,
        name: created.tournament_name,
      },
      homeTeam: {
        id: created.home_team_id,
        name: created.home_team_name,
        logoUrl: created.home_team_logo,
      },
      awayTeam: {
        id: created.away_team_id,
        name: created.away_team_name,
        logoUrl: created.away_team_logo,
      },
      stadium: created.stadium,
      startTime: created.start_time,
      matchRound: created.match_round,
      isActive: Boolean(created.is_active),
      isCancelled: Boolean(created.is_cancelled),
      score: {
        home: created.home_score,
        away: created.away_score,
      },
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// matchService.js

exports.getMatchDetail = async (matchId, userId) => {
  // 1. Query lấy thông tin trận đấu kèm theo organizer_id của giải đấu
  const [rows] = await db.query(
    `SELECT m.*, t.organizer_id, 
                ht.name AS home_team_name, ht.logo_url AS home_team_logo,
                at.name AS away_team_name, at.logo_url AS away_team_logo,
                t.name AS tournament_name
         FROM matches m
         JOIN tournaments t ON m.tournament_id = t.id
         JOIN teams ht ON m.home_team_id = ht.id
         JOIN teams at ON m.away_team_id = at.id
         WHERE m.id = ?`,
    [matchId]
  );

  if (rows.length === 0) {
    throw new Error("Match not found");
  }

  const match = rows[0];

  // 2. Ép kiểu String cho cả 2 bên để chắc chắn so sánh khớp (1 vs '1')
  if (String(match.organizer_id) !== String(userId)) {
    // Nếu không khớp, ném lỗi 403
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  // 3. Nếu khớp, trả về dữ liệu đúng cấu trúc
  return {
    id: match.id,
    tournament: { id: match.tournament_id, name: match.tournament_name },
    homeTeam: { name: match.home_team_name, logoUrl: match.home_team_logo },
    awayTeam: { name: match.away_team_name, logoUrl: match.away_team_logo },
    score: { home: match.home_score, away: match.away_score },
    stadium: match.stadium,
    startTime: match.start_time,
    status: match.is_active ? "LIVE" : "SCHEDULED"
  };
};

exports.updateMatchStatus = async (matchId, payload) => {
  const [rows] = await db.query('SELECT id FROM matches WHERE id = ?', [matchId]);
  if (rows.length === 0) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  
  const status = payload.status;
  const isActive = status === 'LIVE' ? 1 : 0;
  await db.query('UPDATE matches SET is_active = ? WHERE id = ?', [isActive, matchId]);
  
  return { id: matchId, status, liveMinute: payload.liveMinute, updatedAt: new Date().toISOString() };
};

exports.getMatchLineups = async (matchId) => {
  const [matchRows] = await db.query('SELECT home_team_id, away_team_id FROM matches WHERE id = ?', [matchId]);
  if (matchRows.length === 0) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  const match = matchRows[0];

  const [lineups] = await db.query(
    'SELECT ml.*, tm.full_name, tm.jersey_number, tm.main_position, tm.image_url FROM match_lineups ml JOIN team_members tm ON ml.team_member_id = tm.id WHERE ml.match_id = ?',
    [matchId]
  );

  const home = { startingXI: [], substitutes: [] };
  const away = { startingXI: [], substitutes: [] };

  lineups.forEach(row => {
    const player = {
      playerId: row.team_member_id,
      playerName: row.full_name,
      shirtNumber: row.jersey_number,
      position: row.main_position,
      imageUrl: row.image_url
    };
    const team = row.team_id === match.home_team_id ? home : away;
    if (row.is_starting) team.startingXI.push(player);
    else team.substitutes.push(player);
  });

  return { matchId, home, away };
};

exports.setMatchLineups = async (matchId, payload) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [matchRows] = await connection.query('SELECT home_team_id, away_team_id FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    const match = matchRows[0];

    await connection.query('DELETE FROM match_lineups WHERE match_id = ?', [matchId]);

    const insertLineups = async (teamId, data) => {
      if (!data) return;
      const { startingXI = [], substitutes = [] } = data;
      for (const p of startingXI) {
        await connection.query(
          'INSERT INTO match_lineups (match_id, team_id, team_member_id, is_starting) VALUES (?, ?, ?, 1)',
          [matchId, teamId, p.playerId || p.id]
        );
      }
      for (const p of substitutes) {
        await connection.query(
          'INSERT INTO match_lineups (match_id, team_id, team_member_id, is_starting) VALUES (?, ?, ?, 0)',
          [matchId, teamId, p.playerId || p.id]
        );
      }
    };

    await insertLineups(match.home_team_id, payload.home);
    await insertLineups(match.away_team_id, payload.away);

    await connection.commit();
    return { matchId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.addMatchEvent = async (matchId, payload) => {
  const [matchRows] = await db.query('SELECT id FROM matches WHERE id = ?', [matchId]);
  if (matchRows.length === 0) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

  await db.query(
    'INSERT INTO match_events (match_id, team_id, team_member_id, event_type, minute, extra_data) VALUES (?, ?, ?, ?, ?, ?)',
    [matchId, payload.teamId, payload.playerId, payload.type, payload.minute, JSON.stringify(payload)]
  );
  
  if (payload.type === "GOAL") {
      const [match] = await db.query('SELECT home_team_id, away_team_id FROM matches WHERE id = ?', [matchId]);
      if(match.length > 0) {
          if (payload.teamId === match[0].home_team_id) await db.query('UPDATE matches SET home_score = home_score + 1 WHERE id = ?', [matchId]);
          if (payload.teamId === match[0].away_team_id) await db.query('UPDATE matches SET away_score = away_score + 1 WHERE id = ?', [matchId]);
      }
  }

  return { matchId, ...payload };
};

exports.updateMatchStats = async (matchId, payload) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [matchRows] = await connection.query('SELECT home_team_id, away_team_id FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    const match = matchRows[0];

    const upsertStats = async (teamId, stats) => {
      if (!stats) return;
      await connection.query(
        'INSERT INTO match_team_stats (match_id, team_id, ball_possession_percent, shots, shots_on_target, corners, fouls) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ball_possession_percent = VALUES(ball_possession_percent), shots = VALUES(shots), shots_on_target = VALUES(shots_on_target), corners = VALUES(corners), fouls = VALUES(fouls)',
        [matchId, teamId, stats.possessionPercent || 0, stats.shots || 0, stats.shotsOnTarget || 0, stats.corners || 0, stats.fouls || 0]
      );
    };

    await upsertStats(match.home_team_id, payload.home);
    await upsertStats(match.away_team_id, payload.away);

    await connection.commit();
    return { matchId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.addMatchTracking = async (matchId, payload) => {
  return { matchId, status: "Tracking data not persisted (no DB table)", ...payload };
};

// Nhập kết quả trận đấu
exports.updateMatchScore = async (matchId, payload, userId) => {
  const [rows] = await db.query(
    `SELECT m.*, t.organizer_id 
     FROM matches m
     JOIN tournaments t ON m.tournament_id = t.id
     WHERE m.id = ?`,
    [matchId],
  );

  if (rows.length === 0) {
    throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }

  const match = rows[0];

  // check quyền
  if (match.organizer_id !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  if (match.is_cancelled) {
    throw new AppError("Match is cancelled", 400, "MATCH_CANCELLED");
  }

  //Đã end rồi thì không cho sửa nữa
  if (match.ended_at) {
    throw new AppError("Match already ended", 400, "MATCH_ALREADY_FINISHED");
  }

  if (new Date(match.start_time) > new Date()) {
    throw new AppError("Match has not started yet", 400, "MATCH_NOT_STARTED");
  }

  const { homeScore, awayScore } = payload;

  if (
    homeScore === undefined ||
    awayScore === undefined ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    throw new AppError("Invalid score", 400, "INVALID_SCORE");
  }

  await db.query(
    `UPDATE matches 
     SET home_score = ?, 
         away_score = ?
     WHERE id = ?`,
    [homeScore, awayScore, matchId],
  );

  return {
    matchId,
    homeScore,
    awayScore,
    status: "IN_PROGRESS",
  };
};
exports.endMatch = async (matchId, payload, userId) => {
  const { homeScore, awayScore } = payload;

  await db.query(
    `UPDATE matches 
     SET home_score = ?, 
         away_score = ?, 
         is_active = 0,
         ended_at = NOW()
     WHERE id = ?`,
    [homeScore, awayScore, matchId],
  );

  return {
    matchId,
    homeScore,
    awayScore,
    status: "COMPLETED",
  };
};
// Xem danh sách trận đấu của organizer
exports.getOrganizerMatches = async (userId) => {
  const [rows] = await db.query(
    `
    SELECT 
        m.id,
        m.tournament_id,
        t.name AS tournament_name,
        m.home_team_id,
        ht.name AS home_team_name,
        ht.logo_url AS home_team_logo,
        m.away_team_id,
        at.name AS away_team_name,
        at.logo_url AS away_team_logo,
        m.home_score,
        m.away_score,
        m.stadium,
        m.start_time,
        m.is_active,
        m.is_cancelled
    FROM matches m
    JOIN tournaments t ON m.tournament_id = t.id
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE t.organizer_id = ?
    ORDER BY m.start_time DESC
    `,
    [userId],
  );

  return rows;
};