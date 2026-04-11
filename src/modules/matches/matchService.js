const matches = [];
let idCounter = 1;

exports.createMatch = async (data) => {
    const id = String(idCounter++);
    const now = new Date().toISOString();
    const match = {
        id,
        ...data,
        homeTeam: { id: data.homeTeamId, name: 'Man City', logoUrl: 'https://...' },
        awayTeam: { id: data.awayTeamId, name: 'Real Madrid', logoUrl: 'https://...' },
        score: { home: 0, away: 0 },
        createdAt: now,
        updatedAt: now
    };
    matches.push(match);
    return {
        id: match.id,
        tournamentId: match.tournamentId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        startTime: match.startTime,
        venue: match.venue,
        round: match.round,
        refereeName: match.refereeName,
        status: match.status,
        score: match.score,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
    };
};

exports.getMatchDetail = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    return {
        id: match.id,
        tournament: match.tournamentId ? { id: match.tournamentId, name: 'Demo Tournament' } : null,
        homeTeam: { ...match.homeTeam, shortName: 'MAN' },
        awayTeam: { ...match.awayTeam, shortName: 'RMA' },
        score: match.score,
        status: match.status,
        liveMinute: match.liveMinute,
        startTime: match.startTime,
        venue: match.venue,
        attendance: match.attendance,
        refereeName: match.refereeName,
        timeline: match.events,
        lineups: match.lineups,
        stats: match.stats,
        tracking: match.tracking,
        result: match.result,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
    };
};

exports.updateMatchStatus = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    match.status = payload.status;
    match.liveMinute = payload.liveMinute;
    match.updatedAt = new Date().toISOString();
    return {
        id: match.id,
        status: match.status,
        liveMinute: match.liveMinute,
        updatedAt: match.updatedAt
    };
};

exports.getMatchLineups = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    return { matchId: match.id, ...match.lineups };
};

exports.setMatchLineups = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    match.lineups = payload;
    match.updatedAt = new Date().toISOString();
    return { matchId: match.id, ...match.lineups };
};

exports.addMatchEvent = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    const event = {
        id: String(Date.now()),
        ...payload,
        createdAt: new Date().toISOString(),
        matchId: match.id
    };
    match.events.push(event);
    match.updatedAt = new Date().toISOString();
    // Nếu là GOAL thì cập nhật tỉ số
    if (payload.type === 'GOAL') {
        if (payload.teamId === match.homeTeam.id) match.score.home++;
        if (payload.teamId === match.awayTeam.id) match.score.away++;
    }
    return event;
};

exports.updateMatchStats = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    match.stats = payload;
    match.updatedAt = new Date().toISOString();
    return { success: true };
};

exports.addMatchTracking = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    const tracking = { ...payload, createdAt: new Date().toISOString() };
    match.tracking.push(tracking);
    match.updatedAt = new Date().toISOString();
    return tracking;
};

exports.setMatchResult = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    match.result = {
        matchId: match.id,
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
        winnerTeamId: payload.winnerTeamId,
        isFinal: true,
        approved: true,
        updatedAt: new Date().toISOString()
    };
    match.score = { home: payload.homeScore, away: payload.awayScore };
    match.updatedAt = match.result.updatedAt;
    return match.result;
};
