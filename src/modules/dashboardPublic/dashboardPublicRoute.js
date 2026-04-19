const express = require("express");
const router = express.Router();
const controller = require("./dashboardPublicController");

router.get("/tournament", controller.getTournaments);
router.get("/tournament/:id/match", controller.getTournamentMatches);
router.get("/teams", controller.getTeams);
router.get("/teams/:teamId/members", controller.getTeamMembers);
router.get("/teams/:teamId/members/:playerId", controller.getTeamMemberDetail);

module.exports = router;
