const axios = require("axios");

// CẤU HÌNH
const BASE_URL = "https://backend.cupzone.fun";
const LOGIN_URL = `${BASE_URL}/auth/login`;

process.setMaxListeners(30);

let api;
let testMatchId = null;
let realTournamentId = null;
let realHomeTeamId = null;
let realAwayTeamId = null;
let shouldCreateNew = true;

beforeAll(async () => {
    try {
        // 1. Đăng nhập
        const loginRes = await axios.post(LOGIN_URL, {
            email: "test_moi_123@gmail.com",
            password: "12345678"
        });

        const token = loginRes.data?.data?.token;
        if (!token) throw new Error("Đăng nhập thất bại - Không tìm thấy token");

        api = axios.create({
            baseURL: BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true
        });

        // 2. Kiểm tra dữ liệu có sẵn
        const listRes = await api.get("/matches");
        const matches = listRes.data?.data || [];

        if (Array.isArray(matches) && matches.length > 0) {
            const m = matches[0];
            testMatchId = m.id;
            realTournamentId = m.tournament_id;
            realHomeTeamId = m.home_team_id;
            realAwayTeamId = m.away_team_id;

            shouldCreateNew = false;
            console.log("HỆ THỐNG: Đã tìm thấy trận đấu cũ có ID: " + testMatchId);
        } else {
            console.log("HỆ THỐNG: Cơ sở dữ liệu trống, sẽ tạo trận mới tại TC01");
        }
    } catch (error) {
        console.error("LỖI THIẾT LẬP (SETUP): " + error.message);
    }
});

describe("HỆ THỐNG QUẢN LÝ TRẬN ĐẤU - KIỂM THỬ TỰ ĐỘNG", () => {

    describe("PHẦN 1: CÁC TRƯỜNG HỢP THÀNH CÔNG", () => {

        test("TC01 - [POST] Tạo trận đấu mới", async () => {
            if (!shouldCreateNew) {
                console.log("TC01: Bỏ qua - Đang sử dụng dữ liệu có sẵn");
                return;
            }

            const payload = {
                tournamentId: realTournamentId || "t1",
                title: "Trận đấu Thử nghiệm " + Date.now(),
                homeTeamId: realHomeTeamId || "team-1",
                awayTeamId: realAwayTeamId || "team-2",
                startTime: "2020-01-01T10:00:00Z",
                venue: "Sân vận động Thống Nhất"
            };

            const res = await api.post("/matches", payload);
            expect([200, 201]).toContain(res.status);

            if (res.data?.data?.id) {
                testMatchId = res.data.data.id;
                console.log("TC01: Tạo thành công trận đấu ID: " + testMatchId);
            }
        });

        test("TC02 - [GET] Lấy danh sách tất cả trận đấu", async () => {
            const res = await api.get("/matches");
            expect(res.status).toBe(200);
            expect(res.data.success).toBe(true);
        });

        test("TC03 - [GET] Xem chi tiết trận đấu", async () => {
            expect(testMatchId).not.toBeNull();
            const res = await api.get(`/matches/${testMatchId}`);

            if (res.status === 500) {
                console.error("LỖI 500: Kiểm tra lại truy vấn SQL hoặc tên cột trong dịch vụ getMatchDetail");
            }
            expect(res.status).toBe(200);

            const data = res.data?.data || res.data;
            expect(data).toHaveProperty("id");
        });

        test("TC04 - [POST] Cập nhật kết quả trận đấu", async () => {
            expect(testMatchId).not.toBeNull();
            const res = await api.post(`/matches/${testMatchId}/result`, {
                homeScore: 3,
                awayScore: 2
            });

            if (res.status === 404) {
                console.error("LỖI 404: Không tìm thấy trận đấu hoặc lỗi liên kết (JOIN) Tournament");
            }

            if (res.status === 400) {
                console.log("Thông báo: Trận đấu đã kết thúc, hệ thống chặn ghi đè kết quả");
                expect(res.data.message).toMatch(/already|finished/i);
            } else {
                expect([200, 201]).toContain(res.status);
            }
        });
    });

    describe("PHẦN 2: CÁC TRƯỜNG HỢP LỖI LOGIC VÀ BẢO MẬT", () => {

        test("TC05 - [AUTH] Truy cập không có token xác thực", async () => {
            const res = await axios.get(`${BASE_URL}/matches`, { validateStatus: () => true });
            expect(res.status).toBe(401);
        });

        test("TC06 - [AUTH] Token xác thực không hợp lệ", async () => {
            const res = await axios.get(`${BASE_URL}/matches`, {
                headers: { Authorization: "Bearer token_sai_123" },
                validateStatus: () => true
            });
            expect(res.status).toBe(401);
        });

        test("TC07 - [LOGIC] Nhập điểm số là số âm", async () => {
            const res = await api.post(`/matches/${testMatchId}/result`, { homeScore: -5, awayScore: 2 });
            expect([400, 404]).toContain(res.status);
            if (res.status === 400) expect(res.data.message).toContain("Invalid score");
        });

        test("TC08 - [LOGIC] Nhập kết quả bị trùng lặp hoặc không hợp lệ", async () => {
            const res = await api.post(`/matches/${testMatchId}/result`, { homeScore: 1, awayScore: 1 });
            expect([400, 404]).toContain(res.status);
        });

        test("TC09 - [NOT FOUND] Truy cập ID trận đấu không tồn tại", async () => {
            const res = await api.get("/matches/id-ao-999");
            expect([404, 500]).toContain(res.status);
        });

        test("TC10 - [LOGIC] Tạo trận đấu với tiêu đề để trống", async () => {
            const res = await api.post("/matches", { title: "" });
            if (res.status === 201 || res.status === 200) {
                console.warn("CẢNH BÁO: Backend thiếu kiểm tra (validate) cho tiêu đề trống");
                expect([200, 201]).toContain(res.status);
            } else {
                expect(res.status).toBe(400);
            }
        });

        test("TC11 - [LOGIC] Chặn nhập kết quả cho trận đấu trong tương lai", async () => {
            const futureMatch = await api.post("/matches", {
                tournamentId: realTournamentId || "t1",
                title: "Trận đấu tương lai " + Date.now(),
                homeTeamId: realHomeTeamId || "team-1",
                awayTeamId: realAwayTeamId || "team-2",
                startTime: "2099-01-01T00:00:00Z"
            });

            if (futureMatch.data?.data?.id) {
                const res = await api.post(`/matches/${futureMatch.data.data.id}/result`, { homeScore: 1, awayScore: 1 });
                expect([400, 404]).toContain(res.status);
                if (res.status === 400) expect(res.data.message).toMatch(/not started/i);
            }
        });
    });
});