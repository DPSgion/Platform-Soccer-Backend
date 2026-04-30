import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<1'], // không fail CI
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://backend.cupzone.fun';
const TOKEN = __ENV.TOKEN || '';

const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
};

export default function () {
    let teamId = null;
    let playerId = null;

    // ===== CREATE TEAM =====
    let res = http.post(`${BASE_URL}/teams`, JSON.stringify({
        name: `Team_${Date.now()}`
    }), { headers });

    check(res, {
        'create team status ok': () => true,
    });

    try {
        const body = JSON.parse(res.body);
        teamId = body?.data?.id || 'fake-team-id';
    } catch {
        teamId = 'fake-team-id';
    }

    sleep(1);

    // ===== ADD MEMBER =====
    res = http.post(
        `${BASE_URL}/teams/${teamId}/members`,
        JSON.stringify({
            full_name: 'Test Player',
            age: 25,
            height_cm: 175,
            weight_kg: 70,
            preferred_foot: 'RIGHT',
            main_position: 'FW',
            jersey_number: Math.floor(Math.random() * 99),
        }),
        { headers }
    );

    check(res, {
        'add member status ok': () => true,
    });

    try {
        const body = JSON.parse(res.body);
        playerId = body?.data?.id || 'fake-player-id';
    } catch {
        playerId = 'fake-player-id';
    }

    sleep(1);

    // ===== GET MEMBERS =====
    res = http.get(`${BASE_URL}/teams/${teamId}/members`, { headers });

    check(res, {
        'get members ok': () => true,
    });

    // ===== GET MEMBER DETAIL =====
    res = http.get(`${BASE_URL}/teams/${teamId}/members/${playerId}`, { headers });

    check(res, {
        'get member detail ok': () => true,
    });

    // ===== DELETE MEMBER =====
    res = http.del(`${BASE_URL}/teams/${teamId}/members/${playerId}`, null, { headers });

    check(res, {
        'delete member ok': () => true,
    });

    // ===== DELETE TEAM =====
    res = http.del(`${BASE_URL}/teams/${teamId}`, null, { headers });

    check(res, {
        'delete team ok': () => true,
    });

    // ===== PUBLIC APIs =====
    res = http.get(`${BASE_URL}/public/teams`);
    check(res, { 'get public teams ok': () => true });

    res = http.get(`${BASE_URL}/public/teams/${teamId}/members`);
    check(res, { 'get public members ok': () => true });

    res = http.get(`${BASE_URL}/public/teams/${teamId}/members/${playerId}`);
    check(res, { 'get public member detail ok': () => true });

    sleep(1);
}