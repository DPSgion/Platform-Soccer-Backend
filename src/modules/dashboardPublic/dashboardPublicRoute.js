const express = require("express");
const router = express.Router();
const controller = require("./dashboardPublicController");

router.get("/tournament", controller.getTournaments);
router.get("/tournament/:id/match", controller.getTournamentMatches);
module.exports = router;
