const tournamentService = require("./tournamentService");

// GET ALL
exports.getAllTournaments = async (req, res) => {
    try {
        const data = await tournamentService.getAllTournaments(req.query.organizer_id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// CREATE
exports.createTournament = async (req, res) => {
    try {
        const result = await tournamentService.createTournament(req.body);
        res.status(201).json({ success: true, data: result.data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// UPDATE
exports.updateTournament = async (req, res) => {
    try {
        const result = await tournamentService.updateTournament(
            req.params.id,
            req.body,
            req.body.organizer_id
        );
        res.json({ success: true, message: result.message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE
exports.deleteTournament = async (req, res) => {
    try {
        const result = await tournamentService.deleteTournament(
            req.params.id,
            req.body.organizer_id
        );
        res.json({ success: true, message: result.message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DETAILS
exports.getTournamentDetails = async (req, res) => {
    try {
        const data = await tournamentService.getTournamentDetails(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// REGISTER TEAM
exports.registerTeam = async (req, res) => {
    try {
        const result = await tournamentService.registerTeam(req.params.id, req.body);
        res.json({ success: true, message: result.message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// PROFILE
exports.getTournamentProfile = async (req, res) => {
    try {
        const data = await tournamentService.getTournamentProfile(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};