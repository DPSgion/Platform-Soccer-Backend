const teamService = require("./teamService");

const getAllTeams = (req, res) => {
  const teams = teamService.getAllTeams();

  return res.status(200).json({
    success: true,
    message: "Get teams successfully",
    data: teams
  });
};

const getTeamById = (req, res) => {
  const { teamId } = req.params;
  const team = teamService.getTeamById(teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
      data: null
    });
  }

  return res.status(200).json({
    success: true,
    message: "Get team successfully",
    data: team
  });
};
const getTeamMembers = (req, res) => {
  const { teamId } = req.params;
  const members = teamService.getTeamMembers(teamId); 
  return res.status(200).json({
    success: true,
    message: "Get team members successfully",
    data: members
  });
}



module.exports = {
  getAllTeams,
  getTeamById,
  getTeamMembers
};