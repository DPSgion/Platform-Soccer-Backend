import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'https://backend.cupzone.fun';
const PASSWORD = '12345678';

// ================= OPTIONS =================
export const options = {
    scenarios: {
        register_test: {
            executor: 'ramping-vus',
            exec: 'registerFlow',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 5 },
                { duration: '20s', target: 10 },
                { duration: '10s', target: 0 },
            ],
        },
        login_test: {
            executor: 'ramping-vus',
            exec: 'loginFlow',
            startTime: '5s', // chạy sau register
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },
                { duration: '20s', target: 30 },
                { duration: '10s', target: 0 },
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<20000'],
        http_req_failed: ['rate<0.05'],
    },
};

// ================= HELPERS =================
function getHeaders(token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return { headers };
}

function safeParse(body) {
    try {
        return JSON.parse(body);
    } catch (e) {
        return null;
    }
}

// ================= REGISTER FLOW =================
export function registerFlow() {
    group('REGISTER FLOW', () => {
        const email = `user_${Date.now()}_${Math.random()}@test.com`;

        const res = http.post(
            `${BASE_URL}/auth/register`,
            JSON.stringify({
                email,
                password: PASSWORD,
                full_name: 'Load Test User',
            }),
            getHeaders()
        );

        check(res, {
            'register status 201': (r) => {
                if (r.status !== 201) {
                    console.log('Register error:', r.status, r.body);
                    return false;
                }
                return true;
            },
        });

        sleep(Math.random() * 2 + 1);
    });
}

// ================= LOGIN FLOW =================
export function loginFlow() {
    group('LOGIN FLOW', () => {
        // mỗi VU tự tạo account riêng trước khi login
        const email = `login_${Date.now()}_${Math.random()}@test.com`;

        // register trước
        const registerRes = http.post(
            `${BASE_URL}/auth/register`,
            JSON.stringify({
                email,
                password: PASSWORD,
                full_name: 'Login User',
            }),
            getHeaders()
        );

        if (registerRes.status !== 201) {
            console.log('Pre-login register failed:', registerRes.status, registerRes.body);
        }

        // login
        const res = http.post(
            `${BASE_URL}/auth/login`,
            JSON.stringify({
                email,
                password: PASSWORD,
            }),
            getHeaders()
        );

        let token = null;

        check(res, {
            'login status 200': (r) => {
                if (r.status !== 200) {
                    console.log('Login error:', r.status, r.body);
                    return false;
                }
                return true;
            },
            'token exists': (r) => {
                const body = safeParse(r.body);
                token = body?.data?.token;
                return !!token;
            },
        });

        sleep(Math.random() * 2 + 1);
    });
}