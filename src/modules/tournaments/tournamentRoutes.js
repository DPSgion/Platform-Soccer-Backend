const express = require("express");
const router = express.Router();
const controller = require("./tournamentController");

router.get("/", controller.getAllTournaments);
router.post("/create", controller.createTournament);
router.put("/:id/update", controller.updateTournament);
router.delete("/:id/delete", controller.deleteTournament);
router.get("/:id/details", controller.getTournamentDetails);
router.post("/:id/register-team", controller.registerTeam);
router.get("/:id/profile", controller.getTournamentProfile);

module.exports = router;