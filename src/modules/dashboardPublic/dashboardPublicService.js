const db = require("../../dbConfig");

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
  const tournament = tournaments.find((t) => t.id == tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const tournamentMatches = matches
    .filter((m) => m.tournament_id === tournamentId)
    .map((m) => ({
      ...m,
      home_team: {
        id: m.home_team_id,
        name: teams[m.home_team_id]?.name,
        logo: teams[m.home_team_id].logo,
      },
      away_team: {
        id: m.away_team_id,
        name: teams[m.away_team_id].name,
        logo: teams[m.away_team_id].logo,
      },
    }));

  return {
    tournament,
    matches: tournamentMatches,
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
