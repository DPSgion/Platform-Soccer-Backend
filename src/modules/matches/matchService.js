
const matches = [];
let idCounter = 1;

// Helper: default structure
function getDefaultMatch(data) {
    const now = new Date().toISOString();
    return {
        id: String(idCounter++),
        tournamentId: data.tournamentId,
        title: data.title || `Match ${idCounter}`,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        startTime: data.startTime,
        venue: data.venue,
        round: data.round,
        refereeName: data.refereeName,
        status: data.status || 'SCHEDULED',
        score: { home: 0, away: 0 },
        createdAt: now,
        updatedAt: now,
        attendance: data.attendance || null,
        events: [],
        lineups: { home: { formation: '', startingXI: [], substitutes: [] }, away: { formation: '', startingXI: [], substitutes: [] } },
        stats: { home: {}, away: {} },
        tracking: { home: {}, away: {} },
        result: null,
        positionalDominance: null
    };
}

exports.createMatch = async (data) => {
    const match = getDefaultMatch(data);
    // Fake team info
    match.homeTeam = { id: match.homeTeamId, name: 'Man City', logoUrl: 'https://...' };
    match.awayTeam = { id: match.awayTeamId, name: 'Real Madrid', logoUrl: 'https://...' };
    matches.push(match);
    return {
        id: match.id,
        tournamentId: match.tournamentId,
        title: match.title,
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
        tournament: match.tournamentId ? { id: match.tournamentId, name: 'Premier League' } : null,
        homeTeam: { ...match.homeTeam, shortName: 'MAN' },
        awayTeam: { ...match.awayTeam, shortName: 'RMA' },
        score: match.score,
        status: match.status,
        liveMinute: match.liveMinute || null,
        startTime: match.startTime,
        venue: match.venue,
        attendance: match.attendance,
        refereeName: match.refereeName,
        timeline: match.events || [],
        lineups: match.lineups || { home: {}, away: {} },
        stats: match.stats || { home: {}, away: {} },
        tracking: match.tracking || { home: {}, away: {} },
        result: match.result || null,
        positionalDominance: match.positionalDominance || null,
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
    return {
        matchId: match.id,
        home: match.lineups.home,
        away: match.lineups.away
    };
};

exports.setMatchLineups = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    match.lineups = payload;
    match.updatedAt = new Date().toISOString();
    return {
        matchId: match.id,
        home: match.lineups.home,
        away: match.lineups.away
    };
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
    return {
        matchId: match.id,
        stats: match.stats,
        updatedAt: match.updatedAt
    };
};

exports.addMatchTracking = async (matchId, payload) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    // Phân loại tracking theo team
    const teamType = (payload.teamId === match.homeTeamId) ? 'home' : 'away';
    if (!match.tracking[teamType]) match.tracking[teamType] = {};
    match.tracking[teamType] = {
        ...payload,
        createdAt: new Date().toISOString()
    };
    match.updatedAt = new Date().toISOString();
    return match.tracking[teamType];
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
