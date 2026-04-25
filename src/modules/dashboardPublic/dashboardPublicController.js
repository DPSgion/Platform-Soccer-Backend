const dashboardPublicService = require("./dashboardPublicService");
const { AppError } = require("../../middlewares/errorMiddleware");

// GET TOURNAMENTS
const getTournaments = async (req, res, next) => {
  try {
    const data = await dashboardPublicService.getTournaments();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
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

const getTeams = async (req, res) => {
  try {
    const data = await dashboardPublicService.getTeams(req.query);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 

const getTeamMemberDetail = async (req, res) => {
  try {
    const {teamId, playerId} = req.params;
    const member = await dashboardPublicService.getTeamMemberDetail(teamId, playerId);

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: "Member not found"
      });
    }

    return res.json({
      success: true,
      data: member
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
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
  getTeamMemberDetail
};
