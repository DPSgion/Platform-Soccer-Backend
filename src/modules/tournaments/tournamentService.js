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
        organizer_id: "user_1"
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
        organizer_id: "user_2"
    }
];

// GET ALL
async function getAllTournaments(organizerId) {
    const [rows] = await pool.execute(
        `SELECT id, organizer_id, name, logo_url, description, format, 
                start_date, end_date, status, created_at, updated_at
         FROM tournaments 
         WHERE organizer_id = ? 
         ORDER BY created_at DESC`,
        [organizerId]
    );
    return rows;
}

// DELETE 
async function deleteTournament(id, organizerId) {
    // 1. Kiểm tra tồn tại
    const [rows] = await pool.execute(
        `SELECT id, organizer_id, status FROM tournaments WHERE id = ?`,
        [id]
    );
    
    if (rows.length === 0) {
        const error = new Error("Tournament not found");
        error.code = "NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }
    
    const tournament = rows[0];
    
    // 2. Kiểm tra quyền sở hữu
    if (tournament.organizer_id !== organizerId) {
        const error = new Error("You are not allowed to delete this tournament");
        error.code = "FORBIDDEN";
        error.statusCode = 403;
        throw error;
    }
    
    // 3. Kiểm tra status
    if (tournament.status !== "UPCOMING") {
        const error = new Error("Only UPCOMING tournaments can be deleted");
        error.code = "INVALID_STATUS";
        error.statusCode = 409;
        throw error;
    }
    
    // 4. Kiểm tra có team đăng ký
    const [teamRows] = await pool.execute(
        `SELECT COUNT(*) as count FROM tournament_teams WHERE tournament_id = ?`,
        [id]
    );
    if (teamRows[0].count > 0) {
        const error = new Error(`Cannot delete. This tournament has ${teamRows[0].count} team(s) registered`);
        error.code = "TEAM_REGISTERED";
        error.statusCode = 409;
        throw error;
    }
    
    // 5. Kiểm tra có trận đấu
    const [matchRows] = await pool.execute(
        `SELECT COUNT(*) as count FROM matches WHERE tournament_id = ?`,
        [id]
    );
    if (matchRows[0].count > 0) {
        const error = new Error(`Cannot delete. This tournament has ${matchRows[0].count} match(es)`);
        error.code = "MATCH_EXISTS";
        error.statusCode = 409;
        throw error;
    }
    
    // 6. Xóa
    await pool.execute(`DELETE FROM tournaments WHERE id = ?`, [id]);
    return { success: true };
}

const { v4: uuidv4 } = require("uuid");

const createTournament = async (data) => {
    const { name, description, format, start_date, end_date, organizer_id, logo_url } = data;

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
            logo_url || "",
            description || "",
            format,
            start_date,
            end_date,
            "UPCOMING"
        ]
    );

    return {
        message: "Tạo tournament thành công",
        data: {
            id,
            name,
            description,
            format,
            start_date,
            end_date,
            organizer_id,
            logo_url,
            status: "UPCOMING"
        }
    };
};

const updateTournament = async (id, data) => {
    const [rows] = await pool.query(
        "SELECT * FROM tournaments WHERE id = ?",
        [id]
    );

    const tournament = rows[0];

    if (tournament.length === 0) {
        throw new Error("Tournament not found");
    }

    const fields = {};

    if (data.name !== undefined) {
        if (data.name.trim() === "") {
            throw new Error("Name cannot be empty");
        }
        fields.name = data.name;
    }

    if (data.logo_url !== undefined) {
        fields.logo_url = data.logo_url;
    }

    if (data.description !== undefined) {
        fields.description = data.description;
    }

    if (data.format !== undefined) {
        if ( data.status !== "UPCOMING") {
            throw new Error("Format cannot be updated after tournament starts");
        }
        fields.format = data.format;
    }

    if (data.start_date !== undefined || data.end_date !== undefined) {
        if (data.status !== "UPCOMING") {
            throw new Error("Start date and end date cannot be updated after tournament starts");
        }
        
        const startDate = data.start_date || tournament.start_date;
        const endDate = data.end_date || tournament.end_date;

        if (new Date(startDate) >= new Date(endDate)) {
            throw new Error("Start date must be before end date");
        }

        if (data.start_date !== undefined) {
            fields.start_date = startDate;
        }
        if (data.end_date !== undefined) {
            fields.end_date = endDate;
        }
    }
    
    if (data.status !== undefined) {
        const validTransitions = {
            UPCOMING: ["ONGOING", "CANCELLED"],
            ONGOING: ["COMPLETED"],
            COMPLETED: [],
            CANCELLED: []
        }

        if (!validTransitions[tournament.status].includes(data.status)) {
            throw new Error("Invalid status transition", 400 );
        }
        fields.status = data.status;   
    }

    if (Object.keys(fields).length === 0) {
        throw new Error("No data to update");
    }

    fields.updated_at = new Date();

    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(", ");

    const updateValues = [...Object.values(fields), id];

    await pool.query(
        `UPDATE tournaments SET ${setClause} WHERE id = ?`,
        updateValues
    );

    const [updatedRows] = await pool.query(
        "SELECT * FROM tournaments WHERE id = ?",
        [id]
    );

    return updatedRows[0];
};

const getDetails = (id) => {
    const tournament = tournaments.find(t => t.id === id);

    return {
        ...tournament,
        teams: []
    };
};

const registerTeam = (id, data) => {
    return {
        message: "Team registered",
        tournamentId: id,
        team: data
    };
};

const getProfile = (id) => {
    const tournament = tournaments.find(t => t.id === id);

    return {
        ...tournament,
        owner: "Admin"
    };
};

module.exports = {
    getAllTournaments,
    deleteTournament,
    createTournament,
    updateTournament,
    getDetails,
    registerTeam,
    getProfile

};