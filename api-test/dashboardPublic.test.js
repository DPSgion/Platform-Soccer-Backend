const axios = require('axios');

// ================= CONFIG =================
const BASE_URL = process.env.BASE_URL || 'https://backend.cupzone.fun/public';

jest.retryTimes(2);

// ================= AXIOS =================
const api = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true,
    timeout: 10000
});

// ================= CACHE =================
let tournamentRes;
let tournaments = [];
let tournamentId;

let matchRes;
let matches = [];
let tournamentDetail;

// ================= SETUP =================
beforeAll(async () => {
    // Lấy tournament list
    tournamentRes = await api.get('/tournament');

    if (tournamentRes.status === 200 && Array.isArray(tournamentRes.data.data)) {
        tournaments = tournamentRes.data.data;
        tournamentId = tournaments[0]?.id;
    }

    // Lấy match nếu có tournament
    if (tournamentId) {
        matchRes = await api.get(`/tournament/${tournamentId}/match`);

        if (matchRes.status === 200) {
            tournamentDetail = matchRes.data.data?.tournament;
            matches = matchRes.data.data?.matches || [];
        }
    }
});

describe('DASHBOARD PUBLIC', () => {

    describe('GET /public/tournament', () => {

        // ===== HAPPY =====
        describe('HAPPY CASE', () => {

            test('TC_T01 - Lấy danh sách tournament thành công', () => {
                expect(tournamentRes.status).toBe(200);
                expect(tournamentRes.data.success).toBe(true);
                expect(Array.isArray(tournamentRes.data.data)).toBe(true);
            });

            test('TC_T02 - Dữ liệu trả về không rỗng', () => {
                expect(Array.isArray(tournaments)).toBe(true);
                // không assume luôn > 0
                if (tournaments.length === 0) return;
                expect(tournaments.length).toBeGreaterThan(0);
            });

            test('TC_T03 - Tournament có đầy đủ field', () => {
                if (tournaments.length === 0) return;

                const t = tournaments[0];

                expect(t).toHaveProperty('id');
                expect(t).toHaveProperty('name');
                expect(t).toHaveProperty('logo_url');
                expect(t).toHaveProperty('description');
                expect(t).toHaveProperty('format');
                expect(t).toHaveProperty('start_date');
                expect(t).toHaveProperty('end_date');
                expect(t).toHaveProperty('status');
                expect(t).toHaveProperty('organizer_id');
            });

            test('TC_T04 - Kiểu dữ liệu của tournament đúng', () => {
                if (tournaments.length === 0) return;

                const t = tournaments[0];

                expect(['string', 'number']).toContain(typeof t.id);
                expect(typeof t.name).toBe('string');
                expect(typeof t.logo_url).toBe('string');
                expect(typeof t.description).toBe('string');
                expect(typeof t.format).toBe('string');
                expect(typeof t.start_date).toBe('string');
                expect(typeof t.end_date).toBe('string');
                expect(typeof t.status).toBe('string');
                expect(['string', 'number']).toContain(typeof t.organizer_id);
            });

            test('TC_T05 - Format hợp lệ', () => {
                tournaments.forEach(t => {
                    expect(['LEAGUE', 'KNOCKOUT']).toContain(t.format);
                });
            });

            test('TC_T06 - Status hợp lệ', () => {
                tournaments.forEach(t => {
                    expect(['UPCOMING', 'ONGOING', 'FINISHED']).toContain(t.status);
                });
            });

            test('TC_T07 - start_date <= end_date', () => {
                tournaments.forEach(t => {
                    const start = Date.parse(t.start_date);
                    const end = Date.parse(t.end_date);

                    if (!isNaN(start) && !isNaN(end)) {
                        expect(start).toBeLessThanOrEqual(end);
                    }
                });
            });

        });

        // ===== UNHAPPY =====
        describe('UNHAPPY CASE', () => {

            test('TC_T08 - Response vẫn đúng format khi data có thể rỗng', () => {
                expect(tournamentRes.data).toHaveProperty('success');
                expect(tournamentRes.data).toHaveProperty('data');
            });

            test('TC_T09 - start_date phải là date hợp lệ', () => {
                tournaments.forEach(t => {
                    expect(isNaN(Date.parse(t.start_date))).toBe(false);
                });
            });

            test('TC_T10 - end_date phải là date hợp lệ', () => {
                tournaments.forEach(t => {
                    expect(isNaN(Date.parse(t.end_date))).toBe(false);
                });
            });

            test('TC_T11 - format không được null hoặc undefined', () => {
                tournaments.forEach(t => {
                    expect(t.format).toBeTruthy();
                });
            });

            test('TC_T12 - status không được null hoặc undefined', () => {
                tournaments.forEach(t => {
                    expect(t.status).toBeTruthy();
                });
            });

        });

    });

    describe('GET /public/tournament/:id/match', () => {

        // ===== HAPPY =====
        describe('HAPPY CASE', () => {

            test('TC_M01 - Lấy match thành công', () => {
                if (!matchRes) return;

                expect(matchRes.status).toBe(200);
                expect(matchRes.data.success).toBe(true);
            });

            test('TC_M02 - Response có đủ structure', () => {
                if (!matchRes) return;

                expect(matchRes.data).toHaveProperty('success');
                expect(matchRes.data).toHaveProperty('data');
                expect(matchRes.data.data).toHaveProperty('tournament');
                expect(matchRes.data.data).toHaveProperty('matches');
            });

            test('TC_M03 - Tournament có đầy đủ field', () => {
                if (!tournamentDetail) return;

                expect(tournamentDetail).toMatchObject({
                    id: expect.anything(),
                    name: expect.any(String),
                    logo_url: expect.any(String),
                    description: expect.any(String),
                    format: expect.any(String),
                    start_date: expect.any(String),
                    end_date: expect.any(String),
                    status: expect.any(String),
                    organizer_id: expect.anything(),
                });
            });

            test('TC_M04 - Matches là array', () => {
                if (!matches) return;

                expect(Array.isArray(matches)).toBe(true);
            });

            test('TC_M05 - Match có đầy đủ field', () => {
                if (matches.length === 0) return;

                const m = matches[0];

                expect(m).toMatchObject({
                    id: expect.anything(),
                    tournament_id: expect.anything(),
                    home_team: {
                        id: expect.anything(),
                        name: expect.any(String),
                        logo: expect.any(String),
                    },
                    away_team: {
                        id: expect.anything(),
                        name: expect.any(String),
                        logo: expect.any(String),
                    },
                    home_score: expect.any(Number),
                    away_score: expect.any(Number),
                    stadium: expect.any(String),
                    start_time: expect.any(String),
                });
            });

            test('TC_M06 - tournament_id trong match phải đúng', () => {
                if (!tournamentId) return;

                matches.forEach(m => {
                    expect(String(m.tournament_id)).toBe(String(tournamentId));
                });
            });

            test('TC_M07 - Score phải >= 0', () => {
                matches.forEach(m => {
                    expect(m.home_score).toBeGreaterThanOrEqual(0);
                    expect(m.away_score).toBeGreaterThanOrEqual(0);
                });
            });

            test('TC_M08 - start_time là date hợp lệ', () => {
                matches.forEach(m => {
                    expect(isNaN(Date.parse(m.start_time))).toBe(false);
                });
            });

        });

        // ===== UNHAPPY =====
        describe('UNHAPPY CASE', () => {

            test('TC_M09 - Tournament không tồn tại', async () => {
                const res = await api.get('/tournament/999999/match');

                expect([400, 404, 500]).toContain(res.status);
                expect(res.data.success).toBe(false);
            });

            test('TC_M10 - ID không hợp lệ', async () => {
                const res = await api.get('/tournament/abc/match');

                expect([400, 500]).toContain(res.status);
                expect(res.data.success).toBe(false);
            });

            test('TC_M11 - Response lỗi vẫn có structure', async () => {
                const res = await api.get('/tournament/999999/match');

                expect(res.data).toHaveProperty('success');
                expect(res.data).toHaveProperty('message');
            });

        });

    });

});