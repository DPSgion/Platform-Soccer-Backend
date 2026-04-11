const express = require("express");
const router = express.Router();

const teamController = require("./teamController");

router.get("/", teamController.getAllTeams);
router.get("/:teamId", teamController.getTeamById);

module.exports = router;