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
exports.createTournament = (req, res) => {
    const { name, description, format, start_date, end_date, organizer_id } = req.body;

    // Validate cơ bản
    if (!name || !format || !start_date || !end_date) {
        return res.status(400).json({
            message: "Thiếu thông tin bắt buộc"
        });
    }

    const data = tournamentService.create({
        name,
        description,
        format,
        start_date,
        end_date,
        organizer_id,
        logo_url: req.body.logo_url || ""
    });

    res.status(201).json(data);
};
exports.createTournament = async (req, res) => {
    const data = await tournamentService.create(req.body);
    res.json(data);
};