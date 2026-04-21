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

exports.getAll = (organizerId) => {
    return tournaments.filter(t => t.organizer_id === organizerId);
};

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

exports.delete = (id, organizerId) => {
    const index = tournaments.findIndex(t => t.id === id);

    if (index === -1) {
        return {
            success: false,
            statusCode: 404,
            message: "Tournament not found"
        };
    }

    const tournament = tournaments[index];

    // Chỉ organizer của giải mới được xóa
    if (tournament.organizer_id !== organizerId) {
        return {
            success: false,
            statusCode: 403,
            message: "You are not allowed to delete this tournament"
        };
    }

    // Chỉ cho xóa khi giải chưa diễn ra
    if (tournament.status !== "UPCOMING") {
        return {
            success: false,
            statusCode: 409,
            message: "Only UPCOMING tournaments can be deleted"
        };
    }

    tournaments.splice(index, 1);

    return {
        success: true,
        message: "Tournament deleted successfully"
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