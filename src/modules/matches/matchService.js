const db = require("../../dbConfig");
const { AppError } = require("../../middlewares/errorMiddleware");
let idCounter = 3;
const matches = [
  {
    id: "1",
    tournamentId: "t1",
    title: "Neon Strike Cup - Match #042",
    homeTeamId: "team-1",
    awayTeamId: "team-2",
    homeTeam: { id: "team-1", name: "Man City", logoUrl: "https://..." },
    awayTeam: { id: "team-2", name: "Real Madrid", logoUrl: "https://..." },
    startTime: "2026-03-31T19:30:00+07:00",
    venue: { name: "Etihad Stadium", city: "Manchester", country: "England" },
    round: "Round 5",
    refereeName: "Szymon Marciniak",
    status: "SCHEDULED",
    score: { home: 0, away: 0 },
    createdAt: "2026-03-31T10:00:00Z",
    updatedAt: "2026-03-31T10:00:00Z",
    attendance: 53000,
    events: [
      {
        id: "e1",
        minute: 23,
        type: "GOAL",
        teamId: "team-1",
        playerId: "p1",
        playerName: "Kevin De Bruyne",
        assistPlayerId: "p2",
        assistPlayerName: "Erling Haaland",
        title: "GOAL",
        description: "Assist: Erling Haaland",
        createdAt: "2026-03-31T19:53:00+07:00",
      },
      {
        id: "e2",
        minute: 41,
        type: "YELLOW_CARD",
        teamId: "team-2",
        playerId: "p3",
        playerName: "Vinícius Júnior",
        title: "CAUTION",
        description: "Unsporting behavior",
      },
    ],
    lineups: {
      home: {
        teamId: "team-1",
        teamName: "Man City",
        formation: "4-3-3",
        startingXI: [
          {
            playerId: "p1",
            playerName: "Ederson",
            shirtNumber: 31,
            position: "GK",
            x: 50,
            y: 90,
          },
          {
            playerId: "p2",
            playerName: "Kyle Walker",
            shirtNumber: 2,
            position: "RB",
            x: 80,
            y: 70,
          },
          {
            playerId: "p3",
            playerName: "Ruben Dias",
            shirtNumber: 3,
            position: "CB",
            x: 60,
            y: 70,
          },
        ],
        substitutes: [
          {
            playerId: "p10",
            playerName: "Phil Foden",
            shirtNumber: 47,
            position: "CM",
          },
        ],
      },
      away: {
        teamId: "team-2",
        teamName: "Real Madrid",
        formation: "4-3-1-2",
        startingXI: [
          {
            playerId: "p20",
            playerName: "Courtois",
            shirtNumber: 1,
            position: "GK",
            x: 50,
            y: 10,
          },
        ],
        substitutes: [],
      },
    },
    stats: {
      home: {
        possessionPercent: 62,
        shots: 18,
        shotsOnTarget: 6,
        fouls: 11,
        corners: 8,
        passes: 512,
        passAccuracyPercent: 87.4,
      },
      away: {
        possessionPercent: 38,
        shots: 9,
        shotsOnTarget: 3,
        fouls: 14,
        corners: 4,
        passes: 331,
        passAccuracyPercent: 79.1,
      },
    },
    tracking: {
      home: {
        totalDistanceKm: 107.25,
        sprints: 132,
        topSpeedKmh: 34.8,
      },
      away: {
        totalDistanceKm: 103.4,
        sprints: 118,
        topSpeedKmh: 33.9,
      },
    },
    result: {
      isFinal: true,
      winnerTeamId: "team-1",
      homeScore: 2,
      awayScore: 1,
      approved: true,
    },
    positionalDominance: {
      dominantTeamId: "team-1",
      zone: "FINAL_THIRD",
      summary:
        "Manchester City maintaining 72% intensity in the final third over the last 15 minutes.",
    },
    liveMinute: 88,
  },
];

// Helper: default structure
function getDefaultMatch(data) {
  const now = new Date().toISOString();
  return {
    id: String(idCounter++),
    tournamentId: data.tournamentId,
    title: data.title || `Match ${idCounter}`,
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    startTime: data.startTime,
    venue: data.venue,
    round: data.round,
    refereeName: data.refereeName,
    status: data.status || "SCHEDULED",
    score: { home: 0, away: 0 },
    createdAt: now,
    updatedAt: now,
    attendance: data.attendance || null,
    events: [],
    lineups: {
      home: { formation: "", startingXI: [], substitutes: [] },
      away: { formation: "", startingXI: [], substitutes: [] },
    },
    stats: { home: {}, away: {} },
    tracking: { home: {}, away: {} },
    result: null,
    positionalDominance: null,
  };
}

exports.createMatch = async (data) => {
  const match = getDefaultMatch(data);
  // Fake team info
  match.homeTeam = {
    id: match.homeTeamId,
    name: "Man City",
    logoUrl: "https://...",
  };
  match.awayTeam = {
    id: match.awayTeamId,
    name: "Real Madrid",
    logoUrl: "https://...",
  };
  matches.push(match);
  return {
    id: match.id,
    tournamentId: match.tournamentId,
    title: match.title,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    startTime: match.startTime,
    venue: match.venue,
    round: match.round,
    refereeName: match.refereeName,
    status: match.status,
    score: match.score,
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
  };
};

exports.getMatchDetail = async (matchId) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  return {
    id: match.id,
    tournament: match.tournamentId
      ? { id: match.tournamentId, name: "Premier League" }
      : null,
    homeTeam: { ...match.homeTeam, shortName: "MAN" },
    awayTeam: { ...match.awayTeam, shortName: "RMA" },
    score: match.score,
    status: match.status,
    liveMinute: match.liveMinute || null,
    startTime: match.startTime,
    venue: match.venue,
    attendance: match.attendance,
    refereeName: match.refereeName,
    timeline: match.events || [],
    lineups: match.lineups || { home: {}, away: {} },
    stats: match.stats || { home: {}, away: {} },
    tracking: match.tracking || { home: {}, away: {} },
    result: match.result || null,
    positionalDominance: match.positionalDominance || null,
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
  };
};

exports.updateMatchStatus = async (matchId, payload) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  match.status = payload.status;
  match.liveMinute = payload.liveMinute;
  match.updatedAt = new Date().toISOString();
  return {
    id: match.id,
    status: match.status,
    liveMinute: match.liveMinute,
    updatedAt: match.updatedAt,
  };
};

exports.getMatchLineups = async (matchId) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  return {
    matchId: match.id,
    home: match.lineups.home,
    away: match.lineups.away,
  };
};

exports.setMatchLineups = async (matchId, payload) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  match.lineups = payload;
  match.updatedAt = new Date().toISOString();
  return {
    matchId: match.id,
    home: match.lineups.home,
    away: match.lineups.away,
  };
};

exports.addMatchEvent = async (matchId, payload) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  const event = {
    id: String(Date.now()),
    ...payload,
    createdAt: new Date().toISOString(),
    matchId: match.id,
  };
  match.events.push(event);
  match.updatedAt = new Date().toISOString();
  // Nếu là GOAL thì cập nhật tỉ số
  if (payload.type === "GOAL") {
    if (payload.teamId === match.homeTeam.id) match.score.home++;
    if (payload.teamId === match.awayTeam.id) match.score.away++;
  }
  return event;
};

exports.updateMatchStats = async (matchId, payload) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  match.stats = payload;
  match.updatedAt = new Date().toISOString();
  return {
    matchId: match.id,
    stats: match.stats,
    updatedAt: match.updatedAt,
  };
};

exports.addMatchTracking = async (matchId, payload) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("Match not found");
  // Phân loại tracking theo team
  const teamType = payload.teamId === match.homeTeamId ? "home" : "away";
  if (!match.tracking[teamType]) match.tracking[teamType] = {};
  match.tracking[teamType] = {
    ...payload,
    createdAt: new Date().toISOString(),
  };
  match.updatedAt = new Date().toISOString();
  return match.tracking[teamType];
};

// Nhập kết quả trận đấu
exports.setMatchResult = async (matchId, payload, userId) => {
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
  // check quyền người nhập kết quả phải là organizer của giải đấu
  if (match.organizer_id !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Bị huỷ
  if (match.is_cancelled) {
    throw new AppError("Match is cancelled", 400, "MATCH_CANCELLED");
  }

  //Đã có kết quả rồi
  if (match.ended_at) {
    throw new AppError(
      "Match result already set",
      400,
      "MATCH_ALREADY_FINISHED",
    );
  }

  //Chưa tới giờ đá
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
