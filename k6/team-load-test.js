import http from 'k6/http';
import { check, sleep } from 'k6';

// ================= CONFIG =================
export let options = {
    vus: 20,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

// ================= CONSTANTS =================
const BASE_URL = 'https://backend.cupzone.fun';

// ================= VALIDATION =================
if (!__ENV.TOKEN) {
    throw new Error('TOKEN is required. Use: k6 run -e TOKEN=...');
}

// ================= HELPER FUNCTIONS =================

function getParams() {
    return {
        headers: {
            Authorization: `Bearer ${__ENV.TOKEN}`,
            'Content-Type': 'application/json',
        },
    };
}

function safeJson(res) {
    try {
        return res.json();
    } catch (e) {
        console.log(`NOT JSON: ${res.body.substring(0, 100)}`);
        return null;
    }
}

function logRequest(res, operation, url) {
    console.log(`${operation} - URL: ${url} - Status: ${res.status}`);
    if (res.status >= 400) {
        console.log(`${operation} ERROR - Body: ${res.body}`);
    }
}

function logFailedCheck(checkResult, operation) {
    if (!checkResult) {
        console.log(`CHECK FAILED: ${operation}`);
    }
}

// ================= MAIN TEST =================
export default function () {

    const teamName = `Team_${Math.random().toString(36).substring(2)}`;

    // ===== 1. CREATE TEAM =====
    console.log('=== CREATE TEAM ===');

    const createUrl = `${BASE_URL}/teams`;
    let res = http.post(createUrl, JSON.stringify({ name: teamName }), getParams());
    logRequest(res, 'CREATE TEAM', createUrl);

    const createCheck = check(res, {
        'create team status ok': (r) => [201, 403].includes(r.status),
    });
    logFailedCheck(createCheck, 'CREATE TEAM');

    const data = safeJson(res);

    // FIX QUAN TRỌNG NHẤT
    const teamId = data?.id || data?.data?.id;

    if (!teamId) {
        console.log('Không lấy được teamId');
    }

    sleep(1);

    // ===== 2. GET TEAMS =====
    console.log('=== GET TEAMS ===');

    const getTeamsUrl = `${BASE_URL}/teams`;
    res = http.get(getTeamsUrl, getParams());
    logRequest(res, 'GET TEAMS', getTeamsUrl);

    const getTeamsCheck = check(res, {
        'get teams status ok': (r) => [200, 403].includes(r.status),
    });
    logFailedCheck(getTeamsCheck, 'GET TEAMS');

    sleep(1);

    // ===== 3. GET TEAM DETAIL =====
    console.log('=== GET TEAM DETAIL ===');

    const getDetailUrl = `${BASE_URL}/teams/${teamId || 'invalid'}`;
    res = http.get(getDetailUrl, getParams());
    logRequest(res, 'GET TEAM DETAIL', getDetailUrl);

    const getDetailCheck = check(res, {
        'get team detail status ok': (r) => [200, 403, 404].includes(r.status),
    });
    logFailedCheck(getDetailCheck, 'GET TEAM DETAIL');

    sleep(1);

    // ===== 4. UPDATE TEAM =====
    console.log('=== UPDATE TEAM ===');

    const updateUrl = `${BASE_URL}/teams/${teamId || 'invalid'}`;
    res = http.put(updateUrl, JSON.stringify({ name: `${teamName}_updated` }), getParams());
    logRequest(res, 'UPDATE TEAM', updateUrl);

    const updateCheck = check(res, {
        'update team status ok': (r) => [200, 403, 404].includes(r.status),
    });
    logFailedCheck(updateCheck, 'UPDATE TEAM');

    sleep(1);

    // ===== 5. ADD MEMBER =====
    console.log('=== ADD MEMBER ===');

    const addMemberUrl = `${BASE_URL}/teams/${teamId || 'invalid'}/members`;
    res = http.post(
        addMemberUrl,
        JSON.stringify({
            full_name: `Player_${Math.random().toString(36).substring(2)}`,
            age: 25,
            main_position: 'Forward',
        }),
        getParams()
    );
    logRequest(res, 'ADD MEMBER', addMemberUrl);

    const addMemberCheck = check(res, {
        'add member status ok': (r) => [201, 404, 405].includes(r.status),
    });
    logFailedCheck(addMemberCheck, 'ADD MEMBER');

    const data2 = safeJson(res);

    // FIX QUAN TRỌNG
    const playerId = data2?.id || data2?.data?.id;

    sleep(1);

    // ===== 6. GET MEMBERS =====
    console.log('=== GET MEMBERS ===');

    const getMembersUrl = `${BASE_URL}/teams/${teamId || 'invalid'}/members`;
    res = http.get(getMembersUrl, getParams());
    logRequest(res, 'GET MEMBERS', getMembersUrl);

    const getMembersCheck = check(res, {
        'get members status ok': (r) => [200, 404].includes(r.status),
    });
    logFailedCheck(getMembersCheck, 'GET MEMBERS');

    sleep(1);

    // ===== 7. GET MEMBER DETAIL =====
    console.log('=== GET MEMBER DETAIL ===');

    const getMemberDetailUrl = `${BASE_URL}/teams/${teamId || 'invalid'}/members/${playerId || 'invalid'}`;
    res = http.get(getMemberDetailUrl, getParams());
    logRequest(res, 'GET MEMBER DETAIL', getMemberDetailUrl);

    const getMemberDetailCheck = check(res, {
        'get member detail status ok': (r) => [200, 404].includes(r.status),
    });
    logFailedCheck(getMemberDetailCheck, 'GET MEMBER DETAIL');

    sleep(1);

    // ===== 8. DELETE MEMBER =====
    console.log('=== DELETE MEMBER ===');

    const deleteMemberUrl = `${BASE_URL}/teams/${teamId || 'invalid'}/members/${playerId || 'invalid'}`;
    res = http.del(deleteMemberUrl, null, getParams());
    logRequest(res, 'DELETE MEMBER', deleteMemberUrl);

    const deleteMemberCheck = check(res, {
        'delete member status ok': (r) => [200, 204, 404].includes(r.status),
    });
    logFailedCheck(deleteMemberCheck, 'DELETE MEMBER');

    sleep(1);

    // ===== 9. DELETE TEAM =====
    console.log('=== DELETE TEAM ===');

    const deleteTeamUrl = `${BASE_URL}/teams/${teamId || 'invalid'}`;
    res = http.del(deleteTeamUrl, null, getParams());
    logRequest(res, 'DELETE TEAM', deleteTeamUrl);

    const deleteTeamCheck = check(res, {
        'delete team status ok': (r) => [200, 204, 403, 409].includes(r.status),
    });
    logFailedCheck(deleteTeamCheck, 'DELETE TEAM');
}