import http from 'k6/http';
import { check, sleep } from 'k6';

// ================= CONFIG =================
export let options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<8000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'https://backend.cupzone.fun';
const binFile = open('../api-test/test-avatar.png', 'b');

// ================= MAIN TEST =================
export default function () {
    const token = __ENV.TOKEN;
    if (!token) {
        console.error("Thiếu TOKEN rồi ní ơi!");
        return;
    }

    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    // 1. XEM PROFILE (GET /users)
    let resGet = http.get(`${BASE_URL}/users`, params);
    check(resGet, {
        '1. Lấy profile OK': (r) => r.status === 200,
        'Profile có data': (r) => r.json().data !== undefined,
    });

    sleep(1);

    // 2. CẬP NHẬT THÔNG TIN (PUT /users/me)
    const updatePayload = JSON.stringify({
        full_name: `User Test ${Math.floor(Math.random() * 1000)}`,
        phone: '0909123456'
    });

    let resUpdate = http.put(`${BASE_URL}/users/me`, updatePayload, params);
    check(resUpdate, {
        '2. Update info OK': (r) => r.status === 200,
    });

    sleep(1);

    // 3. UPLOAD AVATAR (POST /users/me/avatar) - Case nặng đô nhất
    const fd = {
        avatar: http.file(binFile, 'test-avatar.png', 'image/png'),
    };

    let resAvatar = http.post(`${BASE_URL}/users/me/avatar`, fd, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    check(resAvatar, {
        '3. Upload avatar OK': (r) => r.status === 200,
    });

    sleep(2);
}