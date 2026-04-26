const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload");

const teamController = require("./teamController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

//TEAM
router.post("/", authMiddleware(["ORGANIZER"]), upload.any(), teamController.createTeam);
router.get("/", authMiddleware(["ORGANIZER"]), teamController.getAllTeams);
router.get("/:teamId", authMiddleware(["ORGANIZER"]), teamController.getTeamById);
router.put("/:teamId", authMiddleware(["ORGANIZER"]), upload.any(), teamController.updateTeam);
router.delete("/:teamId", authMiddleware(["ORGANIZER"]), teamController.deleteTeam);

//TEAM MEMBERS

router.get("/:teamId/members", authMiddleware(["ORGANIZER"]), teamController.getTeamMembers);
router.post("/:teamId/members", authMiddleware(["ORGANIZER"]), upload.single("image"), teamController.addTeamMember);
router.get("/:teamId/members/:playerId", authMiddleware(["ORGANIZER"]), teamController.getTeamMemberById);
router.delete("/:teamId/members/:playerId", authMiddleware(["ORGANIZER"]), teamController.deleteTeamMember);

module.exports = router;