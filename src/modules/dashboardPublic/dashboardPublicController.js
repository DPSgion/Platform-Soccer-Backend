const dashboardPublicService = require("./dashboardPublicService");
const { AppError } = require("../../middlewares/errorMiddleware");

// GET TOURNAMENTS
const getTournaments = async (req, res) => {
  try {
    const data = await dashboardPublicService.getTournaments();

    return res.status(200).json({
      success: true,
      message: "Get tournaments successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};

// GET TOURNAMENT MATCHES
const getTournamentMatches = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Tournament id is required", 400, "VALIDATION_ERROR");
    }

    const data = await dashboardPublicService.getTournamentMatches(id);

    return res.status(200).json({
      success: true,
      message: "Get tournament matches successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};
// GET /public/teams?q=...
const getTeams = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const data = await dashboardPublicService.getTeams(q);

    return res.status(200).json({
      success: true,
      message: "Get teams successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      throw new AppError("Team id is required", 400, "VALIDATION_ERROR");
    }

    const members = await dashboardPublicService.getTeamMembers(teamId);

    if (!members.length) {
      return res.status(404).json({
        success: false,
        code: "TEAM_MEMBERS_NOT_FOUND",
        message: "No members found for this team",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get team members successfully",
      data: members,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};
module.exports = {
  getTournaments,
  getTournamentMatches,
  getTeams,
  getTeamMembers,
};
