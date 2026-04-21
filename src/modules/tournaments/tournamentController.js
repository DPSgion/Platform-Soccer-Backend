const tournamentService = require("./tournamentService");

exports.getAllTournaments = (req, res) => {
    const organizerId = req.user.id;
    const data = tournamentService.getAll(organizerId);

    return res.status(200).json({
        success: true,
        data
    });
};

exports.createTournament = (req, res) => {
    const data = tournamentService.create(req.body);
    res.json(data);
};

exports.updateTournament = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.update(id, req.body);
    res.json(data);
};

exports.deleteTournament = (req, res) => {
    const { id } = req.params;
    const organizerId = req.user.id;

    const data = tournamentService.delete(id, organizerId);

    if (!data.success) {
        return res.status(data.statusCode || 400).json(data);
    }

    return res.status(200).json(data);
};

exports.getTournamentDetails = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.getDetails(id);
    res.json(data);
};

exports.registerTeam = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.registerTeam(id, req.body);
    res.json(data);
};

exports.getTournamentProfile = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.getProfile(id);
    res.json(data);
};