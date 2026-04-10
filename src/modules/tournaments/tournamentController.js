const tournamentService = require("./tournamentService");

exports.getAllTournaments = (req, res) => {
    const data = tournamentService.getAll();
    res.json(data);
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
    const data = tournamentService.delete(id);
    res.json(data);
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