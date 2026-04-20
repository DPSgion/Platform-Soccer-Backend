const matchService = require('./matchService');

const createMatch = async (req, res) => {
    try {
        const match = await matchService.createMatch(req.body);
        res.status(201).json({ success: true, data: match });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMatchDetail = async (req, res, next) => {
    try {

        // Lấy userId từ token đã được authMiddleware giải mã
        const userId = req.user.id;
        const matchId = req.params.matchId;

        const match = await matchService.getMatchDetail(matchId, userId);

        res.status(200).json({ success: true, data: match });
    } catch (error) {
        next(error); // Dùng next(error) để errorMiddleware xử lý cho đồng bộ
    }
};

const updateMatchStatus = async (req, res) => {
    try {
        const result = await matchService.updateMatchStatus(req.params.matchId, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMatchLineups = async (req, res) => {
    try {
        const lineups = await matchService.getMatchLineups(req.params.matchId);
        res.status(200).json({ success: true, data: lineups });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const setMatchLineups = async (req, res) => {
    try {
        const lineups = await matchService.setMatchLineups(req.params.matchId, req.body);
        res.status(200).json({ success: true, data: lineups });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const addMatchEvent = async (req, res) => {
    try {
        const event = await matchService.addMatchEvent(req.params.matchId, req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateMatchStats = async (req, res) => {
    try {
        const result = await matchService.updateMatchStats(req.params.matchId, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const addMatchTracking = async (req, res) => {
    try {
        const tracking = await matchService.addMatchTracking(req.params.matchId, req.body);
        res.status(201).json({ success: true, data: tracking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const setMatchResult = async (req, res, next) => {
    try {
        const result = await matchService.setMatchResult(
            req.params.matchId,
            req.body,
            req.user.id, // 🔥 QUAN TRỌNG
        );

        return res.status(200).json({
            success: true,
            message: "Set match result successfully",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
};
const getOrganizerMatches = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
        }

        const data = await matchService.getOrganizerMatches(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Get organizer matches successfully",
            data,
        });
    } catch (error) {
        return next(error);
    }
};
module.exports = {
    createMatch,
    getMatchDetail,
    updateMatchStatus,
    getMatchLineups,
    setMatchLineups,
    addMatchEvent,
    updateMatchStats,
    addMatchTracking,
    setMatchResult,
    getOrganizerMatches
};
