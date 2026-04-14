const express = require("express");
const router = express.Router();

const teamController = require("./teamController");

router.get("/", teamController.getAllTeams);
router.get("/:teamId", teamController.getTeamById);
router.get("/:teamId/members", teamController.getTeamMembers);
module.exports = router;