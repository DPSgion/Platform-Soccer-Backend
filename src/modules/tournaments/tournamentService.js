const pool = require("../../dbConfig");
const { v4: uuidv4 } = require("uuid");

// ================= GET ALL =================
async function getAllTournaments(organizerId) {
    if (!organizerId) {
        const error = new Error("Thiếu organizer_id");
        error.statusCode = 400;
        throw error;
    }

    const [rows] = await pool.execute(
        `SELECT * FROM tournaments WHERE organizer_id = ? ORDER BY created_at DESC`,
        [organizerId]
    );

    return rows;
}

// ================= CREATE =================
async function createTournament(data) {
    const { name, format, start_date, end_date, organizer_id } = data;

    if (!name || !format || !start_date || !end_date || !organizer_id) {
        const error = new Error("Thiếu thông tin bắt buộc");
        error.statusCode = 400;
        throw error;
    }

    const id = uuidv4();

    await pool.execute(
        `INSERT INTO tournaments 
        (id, organizer_id, name, logo_url, description, format, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            organizer_id,
            name,
            data.logo_url || "",
            data.description || "",
            format,
            start_date,
            end_date,
            "UPCOMING"
        ]
    );

    return { message: "Tạo thành công", data: { id, ...data } };
}

// ================= UPDATE =================
async function updateTournament(id, data, organizerId) {
    const [rows] = await pool.execute(
        `SELECT * FROM tournaments WHERE id = ?`,
        [id]
    );

    if (rows.length === 0) {
        throw new Error("Tournament không tồn tại");
    }

    const t = rows[0];

    if (String(t.organizer_id) !== String(organizerId)) {
        throw new Error("Không có quyền");
    }

    await pool.execute(
        `UPDATE tournaments 
         SET name=?, description=?, logo_url=?, format=?, start_date=?, end_date=?, updated_at=NOW()
         WHERE id=?`,
        [
            data.name || t.name,
            data.description || t.description,
            data.logo_url || t.logo_url,
            data.format || t.format,
            data.start_date || t.start_date,
            data.end_date || t.end_date,
            id
        ]
    );

    return { message: "Cập nhật thành công" };
}

// ================= DELETE =================
async function deleteTournament(id, organizerId) {
    const [rows] = await pool.execute(
        `SELECT * FROM tournaments WHERE id = ?`,
        [id]
    );

    if (rows.length === 0) throw new Error("Không tìm thấy");

    const t = rows[0];

    if (String(t.organizer_id) !== String(organizerId)) {
        throw new Error("Không có quyền");
    }

    await pool.execute(`DELETE FROM tournaments WHERE id = ?`, [id]);

    return { message: "Xóa thành công" };
}

// ================= DETAILS =================
async function getTournamentDetails(id) {
    const [rows] = await pool.execute(
        `SELECT * FROM tournaments WHERE id = ?`,
        [id]
    );

    if (rows.length === 0) throw new Error("Không tìm thấy");

    return rows[0];
}

// ================= REGISTER TEAM =================
async function registerTeam(tournamentId, data) {
    if (!data.team_id) throw new Error("Thiếu team_id");

    await pool.execute(
        `INSERT INTO tournament_teams (id, tournament_id, team_id)
         VALUES (?, ?, ?)`,
        [uuidv4(), tournamentId, data.team_id]
    );

    return { message: "Đăng ký thành công" };
}

// ================= PROFILE =================
async function getTournamentProfile(id) {
    const [[tournament]] = await pool.execute(
        `SELECT * FROM tournaments WHERE id = ?`,
        [id]
    );

    const [teams] = await pool.execute(
        `SELECT t.* 
         FROM teams t
         JOIN tournament_teams tt ON t.id = tt.team_id
         WHERE tt.tournament_id = ?`,
        [id]
    );

    return { ...tournament, teams };
}

module.exports = {
    getAllTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getTournamentDetails,
    registerTeam,
    getTournamentProfile
};