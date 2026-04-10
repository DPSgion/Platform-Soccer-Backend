
const express = require("express");
const router = express.Router();

const controller = require("./tournamentController");
router.get("/", controller.getAllTournaments);
// Create tournament
router.post("/create", controller.createTournament);

// Update tournament
router.put("/:id/update", controller.updateTournament);

// Delete tournament
router.delete("/:id/delete", controller.deleteTournament);

// Tournament details
router.get("/:id/details", controller.getTournamentDetails);

// Register team
router.post("/:id/register-team", controller.registerTeam);

// Tournament profile
router.get("/:id/profile", controller.getTournamentProfile);

module.exports = router;