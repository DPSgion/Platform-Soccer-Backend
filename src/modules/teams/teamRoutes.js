const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload");

const teamController = require("./teamController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

//TEAM
router.post("/", authMiddleware(["ORGANIZER"]), teamController.createTeam);
router.get("/", authMiddleware(["ORGANIZER"]), teamController.getAllTeams);
router.get("/:teamId", teamController.getTeamById);
router.put("/:teamId", authMiddleware(["ORGANIZER"]), teamController.updateTeam);
router.delete("/:teamId", authMiddleware(["ORGANIZER"]), teamController.deleteTeam);

//TEAM MEMBERS
router.get("/:teamId/members", teamController.getTeamMembers);
router.get("/:teamId/members/:playerId", teamController.getTeamMemberById);

module.exports = router;