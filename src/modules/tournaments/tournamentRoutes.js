const express = require("express");
const router = express.Router();

const controller = require("./tournamentController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

// Danh sách các giải đấu
router.get("/", authMiddleware(["ORGANIZER"]), controller.getAllTournaments);

// Tạo giải đấu mới
router.post("/create", authMiddleware(["ORGANIZER"]), controller.createTournament);

// Sửa giải đấu
router.put("/:id/update", authMiddleware(["ORGANIZER"]), controller.updateTournament);

// Xóa giải đấu
router.delete("/:id/delete", authMiddleware(["ORGANIZER"]), controller.deleteTournament);

// Xem chi tiết giải đấu
router.get("/:id/details", controller.getTournamentDetails);

// Đăng ký đội bóng tham gia giải
router.post("/:id/register-team", controller.registerTeam);

// Cập nhật hồ sơ thi đấu
router.post("/:id/profile", controller.getTournamentProfile);

module.exports = router;