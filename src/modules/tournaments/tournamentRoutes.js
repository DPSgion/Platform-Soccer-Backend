const express = require("express");
const router = express.Router();

const controller = require("./tournamentController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

// Get all tournaments
router.get("/", authMiddleware(["ORGANIZER"]), controller.getAllTournaments);

// Create tournament
router.post("/create", authMiddleware(["ORGANIZER"]), controller.createTournament);

// Update tournament
router.put("/:id/update", authMiddleware(["ORGANIZER"]), controller.updateTournament);

// Delete tournament
router.delete("/:id/delete", authMiddleware(["ORGANIZER"]), controller.deleteTournament);

// Tournament details
router.get("/:id/details", controller.getTournamentDetails);

// Register team
router.post("/:id/register-team", controller.registerTeam);

// Tournament profile
router.get("/:id/profile", controller.getTournamentProfile);

module.exports = router;