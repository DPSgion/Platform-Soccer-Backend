import http from 'k6/http';
import { check, sleep, fail } from 'k6';

// ================= CONFIGURATION =================
export let options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.10'],
    },
};

const BASE_URL = 'https://backend.cupzone.fun';

function getParams() {
    let token = __ENV.TOKEN;
    if (token && !token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
    }
    return {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
    };
}

// ================= MAIN LOGIC =================
export default function () {
    // 1. Kiểm tra xem ní đã truyền Token vào lệnh chạy chưa
    if (!__ENV.TOKEN) {
        fail('LỖI: Thiếu TOKEN. Hãy chạy: k6 run -e TOKEN="your_token" match-load-test.js');
    }

    // 2. Lấy danh sách trận đấu
    const resList = http.get(`${BASE_URL}/matches`, getParams());

    check(resList, {
        '1. Get list matches OK': (r) => r.status === 200,
    });

    const resJson = resList.json();
    const matches = resJson.data || [];

    if (matches.length === 0) {
        console.warn('Tài khoản này chưa có trận đấu nào để test.');
        return;
    }

    // 3. Chọn ngẫu nhiên 1 trận và lấy ID chuẩn (tránh lỗi undefined)
    const activeMatches = matches.filter(m => m.status === 'IN_PROGRESS' || m.status === 'STARTED');

    if (activeMatches.length === 0) {
        console.warn('Không tìm thấy trận nào đang diễn ra để cập nhật kết quả!');
        return;
    }

    const randomMatch = activeMatches[Math.floor(Math.random() * activeMatches.length)];
    const matchId = randomMatch.id || randomMatch.ID || randomMatch._id;
    const homeTeamId = randomMatch.home_team_id || randomMatch.homeTeamId;

    if (!matchId) {
        console.error('Không tìm thấy ID trận đấu trong dữ liệu trả về!');
        return;
    }

    // 4. Xem chi tiết trận đấu
    const resDetail = http.get(`${BASE_URL}/matches/${matchId}`, getParams());
    check(resDetail, {
        '2. Xem chi tiết OK': (r) => r.status === 200,
    });

    // 5. TEST CẬP NHẬT KẾT QUẢ (API này ní đã test thông trên Postman)
    const resultPayload = JSON.stringify({
        action: "UPDATE",
        homeScore: Math.floor(Math.random() * 10), // Giả lập tỉ số ngẫu nhiên
        awayScore: Math.floor(Math.random() * 10)
    });

    const resResult = http.post(`${BASE_URL}/matches/${matchId}/result`, resultPayload, getParams());

    // Nếu lỗi, in ra để ní biết Backend báo gì (Thường là 400 - Match not started)
    if (resResult.status !== 200) {
        console.warn(`Match ${matchId} tạch: ${resResult.status} - ${resResult.body}`);
    }

    check(resResult, {
        '3. Cập nhật kết quả thành công': (r) => r.status === 200,
    });

    // Nghỉ 1 giây trước khi người dùng ảo thực hiện lượt tiếp theo
    sleep(1);
}