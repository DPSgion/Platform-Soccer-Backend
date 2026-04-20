import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 20,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

if (!__ENV.TOKEN) {
    throw new Error('TOKEN is required. Use: k6 run -e TOKEN=...');
}

function getParams() {
    return {
        headers: {
            Authorization: `Bearer ${__ENV.TOKEN}`,
            'Content-Type': 'application/json',
        },
    };
}

export default function () {

    // 1. CREATE TEAM
    let teamName = 'Team_' + Math.random().toString(36).substring(2);
    let res = http.post(
        `${BASE_URL}/teams`,
        JSON.stringify({ name: teamName }),
        getParams()
    );

    let ok = check(res, {
        'create team 201': (r) => r.status === 201,
    });

    if (!ok) {
        console.log('Create failed:', res.body);
        return;
    }

    let teamId = res.json().data?.id;
    if (!teamId) return;

    sleep(1);

    // 2. GET TEAMS
    res = http.get(`${BASE_URL}/teams`, getParams());
    check(res, { 'get teams 200': (r) => r.status === 200 });
    sleep(1);

    // 3. GET DETAIL
    res = http.get(`${BASE_URL}/teams/${teamId}`, getParams());
    check(res, { 'get detail 200': (r) => r.status === 200 });
    sleep(1);

    // 4. UPDATE
    res = http.put(
        `${BASE_URL}/teams/${teamId}`,
        JSON.stringify({ name: teamName + '_updated' }),
        getParams()
    );
    check(res, { 'update 200': (r) => r.status === 200 });
    sleep(1);

    // 5. ADD MEMBER
    res = http.post(
        `${BASE_URL}/teams/${teamId}/members`,
        JSON.stringify({
            full_name: 'Player_' + Math.random().toString(36).substring(2),
            age: 25,
            main_position: 'Forward',
        }),
        getParams()
    );

    let addOk = check(res, {
        'add member 201': (r) => r.status === 201,
    });

    let playerId = addOk ? res.json().data?.id : null;
    sleep(1);

    // 6. GET MEMBERS
    res = http.get(`${BASE_URL}/teams/${teamId}/members`, getParams());
    check(res, {
        'get members 200/404': (r) => r.status === 200 || r.status === 404,
    });
    sleep(1);

    if (playerId) {
        // 7. GET MEMBER DETAIL
        res = http.get(
            `${BASE_URL}/teams/${teamId}/members/${playerId}`,
            getParams()
        );
        check(res, {
            'get member 200/404': (r) => r.status === 200 || r.status === 404,
        });
        sleep(1);

        // 8. DELETE MEMBER
        res = http.del(
            `${BASE_URL}/teams/${teamId}/members/${playerId}`,
            null,
            getParams()
        );
        check(res, {
            'delete member 200/204': (r) => r.status === 200 || r.status === 204,
        });
        sleep(1);
    }

    // 9. DELETE TEAM
    res = http.del(`${BASE_URL}/teams/${teamId}`, null, getParams());
    check(res, {
        'delete team 200/204': (r) => r.status === 200 || r.status === 204,
    });
}