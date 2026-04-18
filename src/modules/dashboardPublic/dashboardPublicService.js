const pool = require("../../dbConfig");

const tournaments = [
  {
    id: "1",
    name: "Cupzone Tournament 2026",
    logo_url: "https://picsum.photos/200/200",
    description: "Giải đấu bóng đá mùa hè 2026",
    format: "LEAGUE",
    start_date: "2026-07-01",
    end_date: "2026-07-20",
    status: "UPCOMING",
    organizer_id: "user_1",
  },
  {
    id: "2",
    name: "Champions Cup 2026",
    logo_url: "https://picsum.photos/200/201",
    description: "Giải đấu loại trực tiếp",
    format: "KNOCKOUT",
    start_date: "2026-08-10",
    end_date: "2026-08-30",
    status: "UPCOMING",
    organizer_id: "user_2",
  },
];

// fake matches data
const matches = [
  {
    id: "m1",
    tournament_id: "1",
    home_team: "Lions FC",
    away_team: "Tigers FC",
    home_score: 2,
    away_score: 1,
    stadium: "National Stadium",
    start_time: "2026-07-05 18:00:00",
  },
  {
    id: "m2",
    tournament_id: "1",
    home_team: "Eagles FC",
    away_team: "Lions FC",
    home_score: 0,
    away_score: 3,
    stadium: "Jalan Besar Stadium",
    start_time: "2026-07-10 20:00:00",
  },
  {
    id: "m3",
    tournament_id: "2",
    home_team: "Dragon FC",
    away_team: "Phoenix FC",
    home_score: 1,
    away_score: 1,
    stadium: "Sport Hub",
    start_time: "2026-08-12 19:30:00",
  },
];
// Danh sách giải đấu 
exports.getTournaments = async () => {
  return tournaments;
};
//Chi tiết giải đấu và các trận đấu liên quan
exports.getTournamentMatches = async (tournamentId) => {
  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const tournamentMatches = matches.filter(
    (m) => m.tournament_id === tournamentId,
  );

  return {
    tournament,
    matches: tournamentMatches,
  };
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

exports.getPublicTeams = async (query) => {
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

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const [rows] = await pool.execute(
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
