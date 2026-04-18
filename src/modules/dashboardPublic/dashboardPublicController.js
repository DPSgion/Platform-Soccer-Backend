const dashboardPublicService = require("./dashboardPublicService");

/* exports.getTournaments = async (req, res) => {
  try {
    const data = await dashboardPublicService.getTournaments();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getTournamentMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await dashboardPublicService.getTournamentMatches(id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; */

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

module.exports = {
  getTeamMemberDetail
};