const tournamentService = require("./tournamentService");

exports.getAllTournaments = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const data = await tournamentService.getAllTournaments(organizerId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return next(error);
    }
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

exports.deleteTournament = async (req, res, next) => {
    try {
        const { id } = req.params;
        const organizerId = req.user.id;
        await tournamentService.deleteTournament(id, organizerId);
        return res.status(200).json({ success: true, message: "Tournament deleted successfully" });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, code: error.code, message: error.message });
    }
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