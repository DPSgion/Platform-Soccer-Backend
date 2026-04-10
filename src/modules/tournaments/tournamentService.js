exports.getAll = () => {
    return [
        {
            id: 1,
            name: "Cupzone Tournament 2026",
            status: "upcoming"
        }
    ];
};

exports.create = (data) => {
    return {
        message: "Tournament created",
        data
    };
};

exports.update = (id, data) => {
    return {
        message: "Tournament updated",
        id,
        data
    };
};

exports.delete = (id) => {
    return {
        message: "Tournament deleted",
        id
    };
};

exports.getDetails = (id) => {
    return {
        id,
        name: "Cupzone Tournament",
        status: "upcoming",
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
    return {
        id,
        name: "Cupzone Tournament",
        description: "Tournament profile",
        owner: "Admin"
    };
};