const teamService = require("./teamService");
const { AppError } = require("../../middlewares/errorMiddleware");
const { uploadFileToOCI } = require('../../utils/ociUpload');

// CREATE
const createTeam = async (req, res, next) => {
  try {
    const {
      name,
      country = "",
      description = "",
      logo_url = "",
      kit_url = ""
    } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError("Name is required", 400, "VALIDATION_ERROR"));
    }

  const team = await teamService.createTeam({
    name: name.trim(),
    country,
    description,
    logo_url,
    kit_url: JSON.stringify(Array.isArray(kit_url) ? kit_url : []),
    manager_id: req.user.id
  });

    return res.status(201).json({
      success: true,
      message: "Create team successfully",
      data: team
    });
  } catch (error) {
    return next(error);
  }
};

// GET ALL
const getAllTeams = async (req, res, next) => {
  const teams = await teamService.getTeamsByManager(req.user.id);
  return res.status(200).json({ success: true, data: teams });
};

// GET ONE
const getTeamById = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await teamService.getTeamById(teamId);

    if (!team) {
      return next(new AppError("Team not found", 404, "TEAM_NOT_FOUND"));
    }

    return res.status(200).json({
      success: true,
      message: "Get team successfully",
      data: team
    });
  } catch (error) {
    return next(error);
  }
};

// UPDATE
const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const {
      name,
      country = "",
      description = "",
      logo_url = "",
      kit_url = ""
    } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError("Name is required", 400, "VALIDATION_ERROR"));
    }

    const affectedRows = await teamService.updateTeam(teamId, {
      name: name.trim(),
      country,
      description,
      logo_url,
      kit_url: JSON.stringify(Array.isArray(kit_url) ? kit_url : []),
      manager_id: req.user.id
    });

    if (!affectedRows) {
      return next(
        new AppError(
          "Team not found or you are not the manager",
          404,
          "TEAM_NOT_FOUND_OR_FORBIDDEN"
        )
      );
    }

    const updatedTeam = await teamService.getTeamById(teamId);

    return res.status(200).json({
      success: true,
      message: "Update team successfully",
      data: updatedTeam
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE
const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const affectedRows = await teamService.deleteTeam(teamId, req.user.id);

    if (!affectedRows) {
      return next(new AppError(
        "Team not found or you are not the manager",
        404,
        "TEAM_NOT_FOUND_OR_FORBIDDEN"
      ));
    }

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully"
    });
  } catch (error) {
    if (error.code === "TEAM_IN_ACTIVE_TOURNAMENT") {
      return res.status(409).json({
        success: false,
        code: "TEAM_IN_ACTIVE_TOURNAMENT",
        message: error.message,
        data: { tournaments: error.tournaments }
      });
    }
    if (error.code === "TEAM_HAS_MEMBERS") {
      return res.status(409).json({
        success: false,
        code: "TEAM_HAS_MEMBERS",
        message: error.message
      });
    }
    return next(error);
  }
};

//MEMBERS
const getTeamMembers = (req, res) => {
  const { teamId } = req.params;
  const members = teamService.getTeamMembers(teamId); 
  if (members.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No members found for this team",
      data: null
    });
  }
  return res.status(200).json({
    success: true,
    message: "Get team members successfully",
    data: members
  });
}
const getTeamMemberById = async (req, res, next) => {
  try {
    const { teamId, playerId } = req.params;
    const member = await teamService.getTeamMemberById(teamId, playerId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy cầu thủ với ID "${playerId}" trong đội "${teamId}"`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get team member successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error in getTeamMemberById:", error);
    next(error);
  }
};

// uploadLogo
const uploadLogo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const logoUrl = await uploadFileToOCI(req.file);
    await teamService.updateTeam(teamId, { logo_url: logoUrl, manager_id: req.user.id });
    return res.status(200).json({ success: true, message: "Logo uploaded", data: { logo_url: logoUrl } });
  } catch (error) { return next(error); }
};

// uploadKit
const uploadKit = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const kitUrls = await Promise.all(req.files.map(f => uploadFileToOCI(f)));
    const existingTeam = await teamService.getTeamById(teamId);
    const existingKits = existingTeam.kit_url || [];
    const newKits = [...existingKits, ...kitUrls];
    await teamService.updateTeam(teamId, { kit_url: JSON.stringify(newKits), manager_id: req.user.id });
    return res.status(200).json({ success: true, message: "Kit uploaded", data: { kit_url: newKits } });
  } catch (error) { return next(error); }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  getTeamMemberById
};