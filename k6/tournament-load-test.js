import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 10,
    duration: '30s',
};

const BASE_URL = __ENV.BASE_URL || 'https://backend.cupzone.fun';
const TOKEN = __ENV.TOKEN || '';

const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
};

export default function () {
    let tournamentId = null;

    // ================= CREATE =================
    let res = http.post(`${BASE_URL}/tournaments/create`, JSON.stringify({
        name: `Tournament_${Date.now()}`,
        format: 'LEAGUE',
        start_date: '2026-07-01',
        end_date: '2026-07-10'
    }), { headers });

    check(res, {
        'create tournament ok': (r) => r.status === 201 || r.status === 200,
    });

    if (res.status === 200 || res.status === 201) {
        try {
            const body = JSON.parse(res.body);
            tournamentId = body?.data?.id;
        } catch (e) {
            tournamentId = null;
        }
    }

    sleep(1);

    // ================= GET LIST =================
    res = http.get(`${BASE_URL}/tournaments`, { headers });

    check(res, {
        'get tournaments ok': (r) => r.status === 200,
    });

    sleep(1);

    // ================= UPDATE =================
    if (tournamentId) {
        res = http.put(
            `${BASE_URL}/tournaments/${tournamentId}/update`,
            JSON.stringify({
                name: 'Updated Tournament'
            }),
            { headers }
        );

        check(res, {
            'update tournament ok': (r) => r.status === 200,
        });
    }

    sleep(1);

    // ================= DELETE =================
    if (tournamentId) {
        res = http.del(`${BASE_URL}/tournaments/${tournamentId}/delete`, null, { headers });

        check(res, {
            'delete tournament ok': (r) => r.status === 200 || r.status === 404,
        });
    }

    sleep(1);
}