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

exports.create = (data) => {
    const newTournament = {
        id: Date.now().toString(),
        ...data,
        status: "UPCOMING"
    };

    tournaments.push(newTournament);

    return {
        message: "Tournament created",
        data: newTournament
    };
};

exports.update = (id, data) => {
    const index = tournaments.findIndex(t => t.id === id);

    if (index === -1) {
        return { message: "Tournament not found" };
    }

    tournaments[index] = {
        ...tournaments[index],
        ...data
    };

    return {
        message: "Tournament updated",
        data: tournaments[index]
    };
};

exports.getDetails = (id) => {
    const tournament = tournaments.find(t => t.id === id);

    return {
        ...tournament,
        teams: []
    };
};

exports.registerTeam = (id, data) => {
    return {
        message: "Team registered",
        tournamentId: id,
        team: data
    };
};

exports.getProfile = (id) => {
    const tournament = tournaments.find(t => t.id === id);

    return {
        ...tournament,
        owner: "Admin"
    };
};

module.exports = {
    getAllTournaments,
    deleteTournament
};