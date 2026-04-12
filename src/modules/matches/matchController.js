const matchService = require('./matchService');

const createMatch = async (req, res) => {
    try {
        const match = await matchService.createMatch(req.body);
        res.status(201).json({ success: true, data: match });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMatchDetail = async (req, res) => {
    try {
        const match = await matchService.getMatchDetail(req.params.matchId);
        res.status(200).json({ success: true, data: match });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
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

const setMatchResult = async (req, res) => {
    try {
        const result = await matchService.setMatchResult(req.params.matchId, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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
    setMatchResult
};
