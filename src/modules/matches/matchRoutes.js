const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

// Tạo trận đấu
router.post('/', matchController.createMatch);
// Xem chi tiết trận đấu
router.get('/:matchId', matchController.getMatchDetail);
// Cập nhật trạng thái trận đấu
router.put('/:matchId/status', matchController.updateMatchStatus);
// Xem đội hình
router.get('/:matchId/lineups', matchController.getMatchLineups);
// Thiết lập đội hình
router.put('/:matchId/lineups', matchController.setMatchLineups);
// Ghi nhận sự kiện
router.post('/:matchId/events', matchController.addMatchEvent);
// Cập nhật chỉ số trận đấu
router.put('/:matchId/stats', matchController.updateMatchStats);
// Gửi tracking
router.post('/:matchId/tracking', matchController.addMatchTracking);
// Nhập kết quả trận đấu
router.post('/:matchId/result', matchController.setMatchResult);

module.exports = router;
