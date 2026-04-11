const dashboardPublicService = require("./dashboardPublic.service");
exports.getTournaments = async (req, res) => {
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
};
