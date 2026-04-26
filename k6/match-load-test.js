import http from 'k6/http';
import { check, sleep } from 'k6';

// ================= CONFIG =================
export let options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.10'],
    },
};

const BASE_URL = 'https://backend.cupzone.fun';

// ================= VALIDATION =================
if (!__ENV.TOKEN) {
    throw new Error('THIẾU TOKEN: Hãy kiểm tra lại GitHub Secrets hoặc biến -e TOKEN trong lệnh chạy!');
}

// ================= HELPERS =================
function getParams() {
    let token = __ENV.TOKEN;
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return {
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
    };
}

// ================= MAIN TEST =================
export default function () {
    // 1. LẤY DANH SÁCH TRẬN ĐẤU
    const resList = http.get(`${BASE_URL}/matches`, getParams());

    const listOk = check(resList, {
        '1. Get list matches OK': (r) => r.status === 200,
    });

    if (!listOk) {
        console.error(`FAILED: Get list matches trả về ${resList.status}`);
        return;
    }

    const resJson = resList.json();
    const matches = resJson?.data || [];

    if (matches.length === 0) {
        // Chỉ log 1 lần để tránh spam log
        console.warn('⚠️ Tài khoản sạch bong, không có trận nào!');
        return;
    }

    // 2. LỌC TRẬN ĐANG DIỄN RA (IN_PROGRESS hoặc STARTED)
    const activeMatches = matches.filter(m =>
        m.status === 'IN_PROGRESS' || m.status === 'STARTED'
    );

    if (activeMatches.length === 0) {
        return;
    }

    const randomMatch = activeMatches[Math.floor(Math.random() * activeMatches.length)];
    const matchId = randomMatch.id || randomMatch._id;

    sleep(1);

    // 3. XEM CHI TIẾT TRẬN ĐẤU
    const resDetail = http.get(`${BASE_URL}/matches/${matchId}`, getParams());
    check(resDetail, {
        '2. Xem chi tiết trận OK': (r) => r.status === 200,
    });

    sleep(1);

    // 4. CẬP NHẬT KẾT QUẢ (PHẦN QUAN TRỌNG NHẤT)
    const payload = JSON.stringify({
        action: "UPDATE",
        homeScore: Math.floor(Math.random() * 5),
        awayScore: Math.floor(Math.random() * 5)
    });

    const resUpdate = http.post(`${BASE_URL}/matches/${matchId}/result`, payload, getParams());

    const updateOk = check(resUpdate, {
        '3. Cập nhật kết quả thành công': (r) => r.status === 200,
    });

    if (!updateOk) {
        console.warn(`Match ${matchId} tạch update: ${resUpdate.status} - ${resUpdate.body}`);
    }

    sleep(1);
}