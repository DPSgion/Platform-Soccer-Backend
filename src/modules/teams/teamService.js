const pool = require("../../dbConfig");

const teamMembers = [
  {
    id: "tm1",
    team_id: "t1",
    full_name: "Bukayo Saka",
    image_url: "https://picsum.photos/200",
    age: 22,
    height_cm: 178,
    weight_kg: 70.5,
    preferred_foot: "LEFT",
    main_position: "RW",
    jersey_number: 7,
    joined_at: "2024-01-10",
  },
  {
    id: "tm2",
    team_id: "t1",
    full_name: "Martin Odegaard",
    image_url: "https://picsum.photos/201",
    age: 25,
    height_cm: 178,
    weight_kg: 68,
    preferred_foot: "LEFT",
    main_position: "CM",
    jersey_number: 8,
    joined_at: "2024-01-10",
  },
  {
    id: "tm3",
    team_id: "t2",
    full_name: "Bruno Fernandes",
    image_url: "https://picsum.photos/202",
    age: 29,
    height_cm: 179,
    weight_kg: 71,
    preferred_foot: "RIGHT",
    main_position: "CAM",
    jersey_number: 8,
    joined_at: "2024-01-10",
  },
];

async function createTeam(payload) {
  const {
    name,
    country = "",
    description = "",
    logo_url = "",
    kit_url = "",
    manager_id
  } = payload;

  await pool.execute(
    `
    INSERT INTO teams (
      id,
      name,
      country,
      description,
      logo_url,
      kit_url,
      manager_id,
      created_at,
      updated_at
    )
    VALUES (
      UUID(), ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    `,
    [name, country, description, logo_url, kit_url, manager_id]
  );

  const [rows] = await pool.execute(
    `
    SELECT
      id,
      name,
      country,
      description,
      logo_url,
      kit_url,
      manager_id,
      created_at,
      updated_at
    FROM teams
    WHERE manager_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [manager_id]
  );

  return rows[0];
}

async function getAllTeams() {
  const [rows] = await pool.execute(
    `
    SELECT
      id,
      name,
      country,
      description,
      logo_url,
      kit_url,
      manager_id,
      created_at,
      updated_at
    FROM teams
    ORDER BY created_at DESC
    `
  );

  return rows.map((team) => ({
    ...team,
    kit_url: team.kit_url ? JSON.parse(team.kit_url) : []
  }));
}

async function getTeamById(teamId) {
  const [rows] = await pool.execute(
    `
    SELECT
      id,
      name,
      country,
      description,
      logo_url,
      kit_url,
      manager_id,
      created_at,
      updated_at
    FROM teams
    WHERE id = ?
    LIMIT 1
    `,
    [teamId]
  );

  const team = rows[0] || null;

  if (!team) return null;

  return {
    ...team,
    kit_url: team.kit_url ? JSON.parse(team.kit_url) : []
  };
}

async function updateTeam(teamId, payload) {
  const {
    name,
    country = "",
    description = "",
    logo_url = "",
    kit_url = "",
    manager_id
  } = payload;

  const [result] = await pool.execute(
    `
    UPDATE teams
    SET
      name = ?,
      country = ?,
      description = ?,
      logo_url = ?,
      kit_url = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND manager_id = ?
    `,
    [name, country, description, logo_url, kit_url, teamId, manager_id]
  );

  return result.affectedRows;
}

async function deleteTeam(teamId, managerId) {
  // Kiểm tra team tồn tại
  const team = await getTeamById(teamId);
  if (!team) return null;

  // Kiểm tra ràng buộc 1: Giải đấu hiện tại
  const activeTournaments = await getTeamTournaments(teamId);
  if (activeTournaments.length > 0) {
    const error = new Error("Team is participating in active tournament(s)");
    error.code = "TEAM_IN_ACTIVE_TOURNAMENT";
    error.tournaments = activeTournaments;
    throw error;
  }

  // Kiểm tra ràng buộc 2: Còn thành viên
  const memberCount = await getTeamMembersFromDB(teamId);
  if (memberCount > 0) {
    const error = new Error(`Team still has ${memberCount} member(s)`);
    error.code = "TEAM_HAS_MEMBERS";
    throw error;
  }

  // Thực hiện xóa
  const [result] = await pool.execute(
    "DELETE FROM teams WHERE id = ? AND manager_id = ?",
    [teamId, managerId]
  );

  return result.affectedRows;
}

// Kiểm tra team có đang trong giải đấu không
async function getTeamTournaments(teamId) {
  const [rows] = await pool.execute(`
    SELECT t.id, t.name, t.status
    FROM tournaments t
    JOIN tournament_teams tt ON t.id = tt.tournament_id
    WHERE tt.team_id = ? AND t.status IN ('UPCOMING', 'ONGOING')
  `, [teamId]);
  return rows;
}

// Kiểm tra team còn thành viên không
async function getTeamMembersFromDB(teamId) {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as count FROM team_members WHERE team_id = ?",
    [teamId]
  );
  return rows[0].count;
}

async function getTeamsByManager(managerId) {
  const [rows] = await pool.execute(
    `SELECT id, name, country, description, logo_url, kit_url, manager_id
     FROM teams WHERE manager_id = ? ORDER BY created_at DESC`,
    [managerId]
  );
  return rows.map(team => ({
    ...team,
    kit_url: team.kit_url ? JSON.parse(team.kit_url) : []
  }));
}

// ===== TEAM MEMBERS =====
const getTeamMembers = (teamId) =>
  teamMembers.filter((member) => member.team_id === teamId);
const getTeamMemberById = async (teamId, playerId) => {
  const [rows] = await pool.execute(
    `
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
      joined_at,
      created_at,
      updated_at
    FROM team_members 
    WHERE team_id = ? AND id = ?
    LIMIT 1
    `,
    [teamId, playerId],
  );

  return rows[0] || null;
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  getTeamMemberById
};
