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

async function deleteTeam(teamId, manager_id) {
  const [result] = await pool.execute(
    `
    DELETE FROM teams
    WHERE id=? AND manager_id=?
    `,
    [teamId, manager_id]
  );

  return result.affectedRows;
}

// ===== TEAM MEMBERS =====
const getTeamMembers = (teamId) =>
  teamMembers.filter((member) => member.team_id === teamId);
const getTeamMemberById = (teamId, playerId) =>
  teamMembers.find(
    (member) => member.team_id === teamId && member.id === playerId,
  );

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  getTeamMemberById
};
