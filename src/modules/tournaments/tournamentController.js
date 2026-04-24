const tournamentService = require("./tournamentService");

const getAllTournaments = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const data = await tournamentService.getAllTournaments(organizerId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return next(error);
    }
};

const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await tournamentService.updateTournament(id, data);

    return res.status(200).json({
      success: true,
      message: "Update tournament successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteTournament = async (req, res, next) => {
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

const getTournamentDetails = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.getDetails(id);
    res.json(data);
};

const registerTeam = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.registerTeam(id, req.body);
    res.json(data);
};

const getTournamentProfile = (req, res) => {
    const { id } = req.params;
    const data = tournamentService.getProfile(id);
    res.json(data);
};
const createTournament = (req, res) => {
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

module.exports = {
    getAllTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getTournamentDetails,
    registerTeam,
    getTournamentProfile
};