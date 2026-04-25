const db = require("../../dbConfig");
// Lay danh sach giai dau
const getTournaments = async () => {
  const [rows] = await db.query(`
    SELECT 
      id,
      name,
      logo_url,
      description,
      format,
      start_date,
      end_date,
      status
    FROM tournaments
    ORDER BY created_at DESC
  `);

  return rows;
};


//Chi tiết giải đấu và các trận đấu liên quan
const getTournamentMatches = async (tournamentId) => {
  // 1. Lấy tournament
  const [tournamentRows] = await db.query(
    `SELECT * FROM tournaments WHERE id = ?`,
    [tournamentId],
  );

  if (tournamentRows.length === 0) {
    throw new AppError("Tournament not found", 404, "TOURNAMENT_NOT_FOUND");
  }

  const tournament = tournamentRows[0];

  // 2. Lấy matches + team info
  const [matches] = await db.query(
    `
    SELECT 
      m.id,
      m.tournament_id,
      m.home_team_id,
      m.away_team_id,
      m.home_score,
      m.away_score,
      m.stadium,
      m.start_time,

      ht.name AS home_team_name,
      ht.logo_url AS home_team_logo,

      at.name AS away_team_name,
      at.logo_url AS away_team_logo

    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id

    WHERE m.tournament_id = ?
    ORDER BY m.start_time ASC
    `,
    [tournamentId],
  );

  // 3. Format lại giống mock data cũ
  const formattedMatches = matches.map((m) => ({
    id: m.id,
    tournament_id: m.tournament_id,
    home_score: m.home_score,
    away_score: m.away_score,
    stadium: m.stadium,
    start_time: m.start_time,

    home_team: {
      id: m.home_team_id,
      name: m.home_team_name,
      logo: m.home_team_logo,
    },

    away_team: {
      id: m.away_team_id,
      name: m.away_team_name,
      logo: m.away_team_logo,
    },
  }));

  return {
    tournament,
    matches: formattedMatches,
  };
};


const getTeamMemberDetail = async (teamId, playerId) => {
  const [rows] = await db.execute(
    `SELECT id, team_id, full_name, image_url, age, height_cm, weight_kg, preferred_foot, main_position, jersey_number, joined_at
      FROM team_members tm
      WHERE tm.team_id = ? AND tm.id = ?`,
    [teamId, playerId],
  );

  if (rows.length === 0) {
    throw new Error("Team member not found");
  }

  return rows[0];
};

function safeParseArrayJson(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

const getTeams = async (query) => {
  const keyword = (query.name || "").trim();
  const country = (query.country || "").trim();

  const whereClauses = [];
  const whereParams = [];

  if (keyword) {
    whereClauses.push("(t.name LIKE ? OR t.country LIKE ?)");
    whereParams.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (country) {
    whereClauses.push("t.country LIKE ?");
    whereParams.push(`%${country}%`);
  }

  const whereSql = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  const [rows] = await db.execute(
    `
    SELECT
      t.id,
      t.name,
      t.country,
      t.description,
      t.logo_url,
      t.kit_url,
      t.manager_id,
      t.created_at,
      t.updated_at,
      COALESCE(mc.total_players, 0) AS total_players
    FROM teams t
    LEFT JOIN (
      SELECT team_id, COUNT(*) AS total_players
      FROM team_members
      GROUP BY team_id
    ) mc ON mc.team_id = t.id
    ${whereSql}
    ORDER BY t.created_at DESC
    `,
    whereParams,
  );

  return rows.map((team) => ({
    ...team,
    kit_url: safeParseArrayJson(team.kit_url),
  }));
};
//Xem danh sách thành viên trong đội bóng
const getTeamMembers = async (teamId) => {
  const sql = `
    SELECT
      id,
      team_id,
      full_name,
      image_url,
      age,
      height_cm,
      weight_kg,
      preferred_foot,
      main_position,
      jersey_number,
      joined_at
    FROM team_members
    WHERE team_id = ?
    ORDER BY jersey_number ASC
  `;

  const [rows] = await db.query(sql, [teamId]);

  return rows;
};

module.exports = {
  getTournaments,
  getTournamentMatches,
  getTeams,
  getTeamMembers,
  getTeamMemberDetail,
};
