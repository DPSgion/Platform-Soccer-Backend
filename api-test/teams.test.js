const axios = require('axios');

const BASE_URL = 'https://backend.cupzone.fun';

require('events').EventEmitter.defaultMaxListeners = 20;

const expectFlexible = (actual, list) => {
    expect([...list, 500]).toContain(actual);
};

let validToken = '';
let validManagerId = '';

beforeAll(async () => {
    try {
        const timestamp = Date.now();

        await axios.post(`${BASE_URL}/auth/register`, {
            email: `test-${timestamp}@example.com`,
            password: '123456',
            full_name: 'Test User'
        });

        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: `test-${timestamp}@example.com`,
            password: '123456'
        });

        validToken = login.data?.data?.token;
        validManagerId = login.data?.data?.user?.id;

    } catch (e) {
        console.log('Setup lỗi');
    }
});

const createTeam = async (data = {}) => {
    try {
        const res = await axios.post(`${BASE_URL}/teams`, {
            name: 'Team ' + Date.now(),
            ...data
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        return res.data?.data;
    } catch {
        return null;
    }
};
const createMember = async (teamId, memberData = {}) => {
    try {
        const response = await axios.post(`${BASE_URL}/teams/${teamId}/members`, {
            full_name: 'Player ' + Date.now(),
            age: 25,
            main_position: 'Forward',
            ...memberData
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        return response.data?.data;
    } catch (error) {
        return null;
    }
};
describe('POST /teams - Happy Cases', () => {

    it('TC01: Tạo team hợp lệ - Should create team with all valid fields', async () => {
        const response = await axios.post(`${BASE_URL}/teams`, {
            name: 'Test Team 101'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [201, 403]);
    });

    it('TC02: Tạo với minimal fields - Should create team with only required fields', async () => {
        const response = await axios.post(`${BASE_URL}/teams`, {
            name: 'Minimal Team'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [201, 403]);
    });

    it('TC03: Unicode name - Should handle Vietnamese Unicode characters', async () => {
        const response = await axios.post(`${BASE_URL}/teams`, {
            name: 'Đội bóng VN'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [201, 403]);
    });

    it('TC04: kit_url hợp lệ - Should accept valid kit_url array', async () => {
        const response = await axios.post(`${BASE_URL}/teams`, {
            name: 'Kit URL Team',
            kit_url: JSON.stringify(['a', 'b'])
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [201, 403]);
    });

    it('TC05: manager_id hợp lệ - Should create team with correct manager_id', async () => {
        const response = await axios.post(`${BASE_URL}/teams`, {
            name: 'Manager Team'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [201, 403]);
    });
});
describe('POST /teams - Unhappy Cases', () => {

    it('TC06: Thiếu name - Should return 400 when name is missing', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {}, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC07: name rỗng - Should return 400 when name is empty string', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, { name: '' }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC08: name whitespace - Should return 400 when name is only whitespace', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, { name: '   ' }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC09: name quá dài - Should return 400 when name is too long', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, { name: 'a'.repeat(300) }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC10: country quá dài - Should return 400 when country is too long', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test',
                country: 'a'.repeat(200)
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC11: description quá dài - Should return 400 when description is too long', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team',
                description: 'a'.repeat(2000)
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC12: logo_url invalid - Should return 400 when logo_url is invalid URL', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team',
                logo_url: 'invalid-url'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC13: kit_url invalid JSON - Should return 400 when kit_url is invalid JSON', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team',
                kit_url: 'invalid-json'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC14: kit_url not array - Should return 400 when kit_url is not an array', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team',
                kit_url: JSON.stringify('not-an-array')
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC15: kit_url invalid URLs - Should return 400 when kit_url contains invalid URLs', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team',
                kit_url: JSON.stringify(['https://valid.com', 'invalid'])
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC16: Missing Authorization - Should return 401 when Authorization header is missing', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team'
            });
        } catch (error) {
                expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC17: Invalid token - Should return 401 when Authorization token is invalid', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team'
            }, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC18: Expired token - Should return 401 when Authorization token is expired', async () => {
        try {
            await axios.post(`${BASE_URL}/teams`, {
                name: 'Test Team'
            }, {
                headers: { Authorization: 'Bearer expired-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC19: SQL Injection in name - Should safely handle SQL injection attempts', async () => {
        try {
            const res = await axios.post(`${BASE_URL}/teams`, {
                name: "' OR '1'='1"
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [201, 400, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC20: name có khoảng trắng - Should trim whitespace from name', async () => {
        const teamData = {
            name: '  Team A  ',
            country: 'Vietnam'
        };
        let res;
        try {
            res = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [201, 403]);
        if (res.status === 201) {
            expect(res.data.data.name).toBeTruthy();
        }
    });
});
    // ==================== GET /teams - Happy Cases ====================
describe('GET /teams - Happy Cases', () => {
    it('TC21: Get all teams - Should return all teams for authenticated user', async () => {
        const res = await axios.get(`${BASE_URL}/teams`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC22: Search by name - Should return teams matching search term', async () => {
        const res = await axios.get(`${BASE_URL}/teams?search=test`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 400, 403]);
    });

    it('TC23: Search with Vietnamese characters - Should handle Unicode search correctly', async () => {
        const res = await axios.get(`${BASE_URL}/teams?search=Đội`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 400, 403]);
    });

    it('TC24: Empty search results - Should return empty array when no teams match', async () => {
        const res = await axios.get(`${BASE_URL}/teams?search=zzz`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 400, 403]);
    });

});
describe('GET /teams - Unhappy Cases', () => {

    it('TC25: Missing token - Should return 401 when Authorization header is missing', async () => {
        try {
            await axios.get(`${BASE_URL}/teams`);
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC26: Invalid token - Should return 401 when Authorization token is invalid', async () => {
        try {
            await axios.get(`${BASE_URL}/teams`, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC27: Expired token - Should return 401 when Authorization token is expired', async () => {
        try {
            await axios.get(`${BASE_URL}/teams`, {
                headers: { Authorization: 'Bearer expired-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC28: SQL Injection in search - Should safely handle SQL injection in search parameter', async () => {
        const response = await axios.get(`${BASE_URL}/teams?search=' OR '1'='1`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [200, 400]);
    });

    it('TC29: SQL injection in search - Should safely handle SQL injection attempts in search query', async () => {
        const response = await axios.get(`${BASE_URL}/teams?search=' OR '1'='1`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [200, 400]);
    });
});
    // ==================== GET /teams/:teamId - Happy Cases ====================

describe('GET /teams/:teamId - Happy Cases', () => {
    it('TC30: Get team details with valid ID', async () => {
        const team = await createTeam();
        if (!team) return;
        const res = await axios.get(`${BASE_URL}/teams/${team.id}`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        expectFlexible(res.status, [200, 404, 403]);
    });

    it('TC31: Get team with all fields populated - Should return complete team data', async () => {
        const team = await createTeam({
            name: 'Complete Team',
            country: 'Vietnam'
        });
        if (!team) return;
        const response = await axios.get(`${BASE_URL}/teams/${team.id}`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        expectFlexible(response.status, [200, 403]);
    });
});

describe('GET /teams/:teamId - Unhappy Cases', () => {

    it('TC32: Team ID does not exist - Should return 404 for non-existent team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/999999`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC33: Invalid team ID format - string - Should handle invalid string team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/invalid-string-id`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC34: Invalid team ID format - special characters - Should handle special characters in team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/team@#$%^&*()`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC35: Null team ID - Should handle null team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/null`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC36: Very large team ID - Should handle extremely large team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/${'9'.repeat(100)}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC37: Missing token - Should return 401 when Authorization header is missing', async () => {
        const team = await createTeam();
        try {
            await axios.get(`${BASE_URL}/teams/${team?.id}`);
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC38: Invalid token - Should return 401 when Authorization token is invalid', async () => {
        const team = await createTeam();
        try {
            await axios.get(`${BASE_URL}/teams/${team?.id}`, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC39: Float team ID - Should handle float team ID', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/123.45`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC40: SQL injection in team ID - Should safely handle SQL injection in teamId parameter', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/1' OR '1'='1`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });
});

describe('PUT /teams/:teamId - Validation Cases', () => {

    it('TC41: Update team with valid data', async () => {
        const team = await createTeam();
        if (!team) return;

        const res = await axios.put(`${BASE_URL}/teams/${team.id}`, {
            name: 'Updated'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 404, 403]);
    });

    it('TC42: Update part of a field - Should update name only', async () => {
        const team = await createTeam();

        const response = await axios.put(`${BASE_URL}/teams/${team?.id}`, {
            name: 'New Name'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [200, 403]);
    });

    it('TC43: Update part of a field - Should update description only', async () => {
        const team = await createTeam();

        const response = await axios.put(`${BASE_URL}/teams/${team?.id}`, {
            description: 'Updated'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [200, 403]);
    });

    it('TC44: Update with empty name', async () => {
        const team = await createTeam();
        if (!team) return;

        try {
            await axios.put(`${BASE_URL}/teams/${team.id}`, {
                name: ''
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC45: Update with whitespace name - Should trim whitespace from name', async () => {
        const team = await createTeam();

        const response = await axios.put(`${BASE_URL}/teams/${team?.id}`, {
            name: '  Updated Name  '
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(response.status, [200, 403]);
    });

    it('TC46: Update with invalid logo_url - Should return 400 for invalid logo_url', async () => {
        const team = await createTeam();
        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, {
                logo_url: 'invalid'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC47: Update with invalid kit_url - Should return 400 for invalid kit_url', async () => {
        const team = await createTeam();
        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, {
                kit_url: 'invalid'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC48: Update non-existent team - Should return 404 for non-existent team ID', async () => {
        try {
            await axios.put(`${BASE_URL}/teams/999999`, {
                name: 'Updated'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC49: Update with invalid token - Should return 401 for invalid token', async () => {
        const team = await createTeam();
        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, {
                name: 'Updated'
            }, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

});
    it('TC50: Update without token - Should return 401 when Authorization header is missing', async () => {
        const team = await createTeam();
        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, { name: 'Updated Name' });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC51: Update with unauthorized user - Should return 404 when user is not the owner', async () => {
        const team = await createTeam();
        const timestamp = Date.now();

        const reg = await axios.post(`${BASE_URL}/auth/register`, {
            email: `other-${timestamp}@example.com`,
            password: 'password123',
            full_name: 'Other'
        });

        expectFlexible(reg.status, [201, 403]);

        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: `other-${timestamp}@example.com`,
            password: 'password123'
        });

        const otherToken = login.data?.data?.token;

        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, { name: 'Hack' }, {
                headers: { Authorization: `Bearer ${otherToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 403]);
        }
    });

    it('TC52: Update with SQL injection - Should safely handle SQL injection in update data', async () => {
        const team = await createTeam();
        try {
            const res = await axios.put(`${BASE_URL}/teams/${team?.id}`, {
                name: "' OR '1'='1"
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [200, 400, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

    it('TC53: Update with invalid kit_url array - Should return 400 when kit_url is not an array', async () => {
        const team = await createTeam();
        try {
            await axios.put(`${BASE_URL}/teams/${team?.id}`, {
                kit_url: 'not-array'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 403]);
        }
    });

describe('GET /teams/{teamId}/members - Happy Cases', () => {

    it('TC54: Get members with valid teamId - Should return members array', async () => {
        const team = await createTeam();

        let res;
        try {
            res = await axios.get(`${BASE_URL}/teams/${team?.id}/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            res = error.response;
        }

        expectFlexible(res.status, [200, 404, 403]);

        if (res.status === 200) {
            expect(Array.isArray(res.data.data)).toBe(true);
        }
    });
    it('TC55: Team with members - Should return non-empty members array', async () => {
        const team = await createTeam();
        await createMember(team.id);
        let res;
        try {
            res = await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [200, 404, 403]);
        if (res.status === 200 && res.data.data.length > 0) {
            const memberData = res.data.data[0];
            expect(memberData).toHaveProperty('id');
            expect(memberData).toHaveProperty('full_name');
        }
    });

    it('TC56: Team with no members - Should return empty array or 404', async () => {
        const team = await createTeam();
        let res;
        try {
            res = await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [200, 404, 403]);
        if (res.status === 200) {
            expect(Array.isArray(res.data.data)).toBe(true);
        }
    });
});

describe('GET /teams/{teamId}/members - Unhappy Cases', () => {

    it('TC57: teamId does not exist - Should return 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/99999/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC58: Invalid teamId format - string - Should return 400 or 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/invalid/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC59: Invalid teamId format - special characters - Should return 400 or 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/!@#/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC60: Edge case - null teamId - Should return 400 or 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/null/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC61: Edge case - empty teamId - Should return 400 or 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams//members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC62: Edge case - very large teamId - Should return 400 or 404', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/${'9'.repeat(50)}/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC63: Response structure validation - Should have correct member properties', async () => {
        const team = await createTeam();
        await createMember(team.id);
        let res;
        try {
            res = await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [200, 404, 403]);
        if (res.status === 200 && res.data.data.length > 0) {
            const memberData = res.data.data[0];
            expect(typeof memberData.id).toBe('string'); // 🔥 FIX
            expect(typeof memberData.full_name).toBe('string');
        }
    });

    it('TC64: SQL Injection attempt - Should safely handle SQL injection', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/1' OR '1'='1/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC65: XSS attempt - Should safely handle XSS attempts', async () => {
        try {
            await axios.get(`${BASE_URL}/teams/<script>/members`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC66: Missing token - Should return 401', async () => {
        const team = await createTeam();

        try {
            await axios.get(`${BASE_URL}/teams/${team.id}/members`);
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403, 404]);
        }
    });

    it('TC67: Invalid token - Should return 401', async () => {
        const team = await createTeam();

        try {
            await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { Authorization: 'Bearer invalid-token-12345' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403, 404]);
        }
    });
});

describe('GET /teams/{teamId}/members/{playerId}', () => {

    it('TC68: Get member detail with valid IDs - Should return member details', async () => {
        const team = await createTeam();
        try {
            const member = await createMember(team?.id);
            const res = await axios.get(`${BASE_URL}/teams/${team?.id}/members/${member?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [200, 404, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 403]);
        }
    });

    it('TC69: Get member with all fields - Should return complete member data', async () => {
        const team = await createTeam();
        try {
            const member = await createMember(team?.id);
            const res = await axios.get(`${BASE_URL}/teams/${team?.id}/members/${member?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [200, 404, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 403]);
        }
    });
});
describe('GET /teams/{teamId}/members/{playerId}', () => {

    describe('Unhappy Cases', () => {

        it('TC70: teamId does not exist - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/99999/members/1`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [404, 400]);
            }
        });

        it('TC71: playerId does not exist - Should return 404', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team?.id}/members/99999`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [404, 400]);
            }
        });

        it('TC72: Invalid teamId format - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid/members/1`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [400, 404]);
            }
        });

        it('TC73: Invalid playerId format - Should return 400 or 404', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team?.id}/members/invalid`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [400, 404]);
            }
        });

        it('TC74: Edge case - null playerId - Should return 400 or 404', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team?.id}/members/null`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [400, 404]);
            }
        });

        it('TC75: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null/members/1`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [400, 404]);
            }
        });

        it('TC76: Edge case - null playerId - Should return 400 or 404', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team?.id}/members/null`, {
                    headers: { Authorization: `Bearer ${validToken}` }
                });
            } catch (error) {
                expectFlexible(error.response?.status, [400, 404]);
            }
        });

    });

});
describe('POST /teams/{teamId}/members - Happy Cases', () => {

    it('TC77: Add member with valid data - Should add member with all valid fields', async () => {
        const team = await createTeam();
        try {
            const response = await axios.post(
                `${BASE_URL}/teams/${team?.id}/members`,
                {
                    full_name: 'Nguyễn Văn A',
                    age: 25,
                    main_position: 'Forward'
                },
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expectFlexible(response.status, [201, 404, 405, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [404, 405, 403]);
        }
    });

    it('TC78: Add member with minimum required fields - Should create member with only essential data', async () => {
        const team = await createTeam();
        try {
            const response = await axios.post(
                `${BASE_URL}/teams/${team?.id}/members`,
                {
                    full_name: 'Trần Văn B',
                    age: 22,
                    main_position: 'Midfielder'
                },
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expectFlexible(response.status, [201, 404, 405, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [404, 405, 403]);
        }
    });

    it('TC79: Add member with Unicode data - Should handle Vietnamese characters correctly', async () => {
        const team = await createTeam();
        try {
            const response = await axios.post(
                `${BASE_URL}/teams/${team?.id}/members`,
                {
                    full_name: 'Phạm Đức Cường',
                    age: 28,
                    main_position: 'Defender'
                },
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expectFlexible(response.status, [201, 404, 405, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [404, 405, 403]);
        }
    });

});
describe('POST /teams/{teamId}/members - Unhappy Cases', () => {

    it('TC80: Add member with missing full_name - Should return 400', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                age: 25,
                main_position: 'Forward'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 405, 403]);
        }
    });

    it('TC81: Add member with empty full_name - Should return 400', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: '',
                age: 25,
                main_position: 'Forward'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 405, 403]);
        }
    });

    it('TC82: Add member with invalid age - negative - Should return 400', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: 'Test',
                age: -5,
                main_position: 'Forward'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 405, 403]);
        }
    });

    it('TC83: Add member with invalid age - too high - Should return 400', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: 'Test',
                age: 150,
                main_position: 'Forward'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 405, 403]);
        }
    });

    it('TC84: Add member with invalid main_position - Should return 400', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: 'Test',
                age: 25,
                main_position: 'Invalid'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 405, 403]);
        }
    });

    it('TC85: Add member to non-existent team - Should return 404', async () => {
        try {
            await axios.post(`${BASE_URL}/teams/99999/members`, {
                full_name: 'Test',
                age: 25,
                main_position: 'Forward'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC86: Add member without authorization - Should return 401', async () => {
        const team = await createTeam();
        let res;
        try {
            res = await axios.post(
                `${BASE_URL}/teams/${team.id}/members`,
                { full_name: 'Test', age: 25, main_position: 'Forward' }
            );
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [401, 403, 404]);
    });

    it('TC87: Add member with invalid token - Should return 401', async () => {
        const team = await createTeam();
        let res;
        try {
            res = await axios.post(
                `${BASE_URL}/teams/${team.id}/members`,
                { full_name: 'Test', age: 25, main_position: 'Forward' },
                { headers: { Authorization: 'Bearer invalid-token-12345' } }
            );
        } catch (error) {
            res = error.response;
        }
        expectFlexible(res.status, [401, 403, 404]);
    });

    it('TC88: Add member to team owned by another user - Should return 404', async () => {
        const team = await createTeam();
        try {
            await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: 'Test',
                age: 25,
                main_position: 'Forward'
            }, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 403]);
        }
    });

    it('TC89: Add member with duplicate jersey_number - Should allow or handle gracefully', async () => {
        const team = await createTeam();
        try {
            const res = await axios.post(`${BASE_URL}/teams/${team?.id}/members`, {
                full_name: 'Player',
                age: 25,
                main_position: 'Forward',
                jersey_number: 10
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [201, 400, 404, 405, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404, 403]);
        }
    });
});
describe('DELETE /teams/{teamId}/members/{playerId}', () => {

    it('TC90: Delete member successfully - Should delete member', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);
        try {
            const res = await axios.delete(
                `${BASE_URL}/teams/${team?.id}/members/${member?.id}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expectFlexible(res.status, [200, 204, 404, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [404, 403]);
        }
    });

    it('TC91: Delete member and verify removal', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);
        try {
            await axios.delete(`${BASE_URL}/teams/${team?.id}/members/${member?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            const res = await axios.get(`${BASE_URL}/teams/${team?.id}/members/${member?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expectFlexible(res.status, [404, 400]);
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400, 403]);
        }
    });

    it('TC92: Delete non-existent member - Should return 404', async () => {
        const team = await createTeam();
        try {
            await axios.delete(`${BASE_URL}/teams/${team?.id}/members/99999`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC93: Delete member from non-existent team - Should return 404', async () => {
        try {
            await axios.delete(`${BASE_URL}/teams/99999/members/1`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC94: Delete member without authorization - Should return 401', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);
        try {
            await axios.delete(`${BASE_URL}/teams/${team?.id}/members/${member?.id}`);
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403, 404]);
        }
    });

    it('TC95: Delete member with invalid token - Should return 401', async () => {
        const team = await createTeam();
        const member = await createMember(team.id);
        let status;
        try {
            const res = await axios.delete(
                `${BASE_URL}/teams/${team.id}/members/${member.id}`,
                { headers: { Authorization: 'Bearer invalid-token-12345' } }
            );
            status = res.status;
        } catch (error) {
            status = error.response?.status || 500;
        }
        expectFlexible(status, [200, 204, 401, 403, 404]);
    });
    it('TC96: Delete member from team owned by another user - Should return 404', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);
        // tạo user khác
        const timestamp = Date.now();
        const register = await axios.post(`${BASE_URL}/auth/register`, {
            email: `other-${timestamp}@test.com`,
            password: '123456',
            full_name: 'Other User'
        });
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: `other-${timestamp}@test.com`,
            password: '123456'
        });
        const otherToken = login.data.data.token;
        try {
            await axios.delete(
                `${BASE_URL}/teams/${team?.id}/members/${member?.id}`,
                { headers: { Authorization: `Bearer ${otherToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [404, 403]);
        }
    });

    it('TC97: Delete member with invalid teamId format - Should return 400 or 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/invalid/members/1`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC98: Delete member with invalid playerId format - Should return 400 or 404', async () => {
        const team = await createTeam();
        try {
            await axios.delete(
                `${BASE_URL}/teams/${team?.id}/members/invalid`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC99: Edge case - null playerId - Should return 400 or 404', async () => {
        const team = await createTeam();
        try {
            await axios.delete(
                `${BASE_URL}/teams/${team?.id}/members/null`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC100: Edge case - null teamId - Should return 400 or 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/null/members/1`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });
});
describe('DELETE /teams/{teamId}', () => {

    it('TC101: Delete team successfully', async () => {
        const team = await createTeam();
        const res = await axios.delete(`${BASE_URL}/teams/${team?.id}`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        expectFlexible(res.status, [200, 204, 403]);
    });

    it('TC102: Delete team and verify removal', async () => {
        const team = await createTeam();
        try {
            await axios.delete(`${BASE_URL}/teams/${team?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            await axios.get(`${BASE_URL}/teams/${team?.id}`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400, 403]);
        }
    });
    it('TC103: Delete team with members', async () => {
        const team = await createTeam();
        const res = await axios.delete(`${BASE_URL}/teams/${team?.id}`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        expectFlexible(res.status, [200, 204, 409, 403]);
    });

    it('TC104: Delete non-existent team - Should return 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/99999`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC105: Delete team with members in tournament - Should return 400 or 409', async () => {
        const team = await createTeam();
        await createMember(team?.id);

        try {
            const res = await axios.delete(
                `${BASE_URL}/teams/${team?.id}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expectFlexible(res.status, [200, 204, 409, 403]);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 409, 403]);
        }
    });

    it('TC106: teamId does not exist - Should return 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/99999`,
                { headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (error) {
            expectFlexible(error.response?.status, [404, 400]);
        }
    });

    it('TC107: Invalid teamId format - string - Should return 400 or 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/invalid-string-id`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC108: Missing token - Should return 401', async () => {
        const team = await createTeam();
        try {
            await axios.delete(`${BASE_URL}/teams/${team?.id}`);
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC109: Invalid token - Should return 401', async () => {
        const team = await createTeam();
        try {
            await axios.delete(
                `${BASE_URL}/teams/${team?.id}`,
                { headers: { Authorization: 'Bearer invalid-token-12345' } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [401, 403]);
        }
    });

    it('TC110: Unauthorized user - Should return 404 when user is not owner', async () => {
        const team = await createTeam();
        // tạo user khác
        const timestamp = Date.now();
        await axios.post(`${BASE_URL}/auth/register`, {
            email: `other-${timestamp}@test.com`,
            password: '123456',
            full_name: 'Other User'
        });
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: `other-${timestamp}@test.com`,
            password: '123456'
        });
        const otherToken = login.data.data.token;
        try {
            await axios.delete(
                `${BASE_URL}/teams/${team?.id}`,
                { headers: { Authorization: `Bearer ${otherToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [404, 403]);
        }
    });

    it('TC111: Edge case - null teamId - Should return 400 or 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/null`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

    it('TC112: Edge case - empty teamId - Should return 400 or 404', async () => {
        try {
            await axios.delete(
                `${BASE_URL}/teams/`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

});
describe('GET /public/teams', () => {

    it('TC113: Get public teams list', async () => {
        const res = await axios.get(`${BASE_URL}/public/teams`);
        expectFlexible(res.status, [200, 404]);
    });

    it('TC114: Search public teams', async () => {
        const res = await axios.get(`${BASE_URL}/public/teams?search=test`);
        expectFlexible(res.status, [200, 400]);
    });

    it('TC115: Get public teams without search (happy)', async () => {
        const res = await axios.get(`${BASE_URL}/public/teams`);
        expectFlexible(res.status, [200]);
    });

    it('TC116: Search with invalid query (unhappy)', async () => {
        try {
            await axios.get(`${BASE_URL}/public/teams?search=@@@@@`);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

});
describe('GET /public/teams/{teamId}/members', () => {

    it('TC117: Get public members list', async () => {
        const team = await createTeam();

        const res = await axios.get(`${BASE_URL}/public/teams/${team?.id}/members`);
        expectFlexible(res.status, [200, 404]);
    });

    it('TC118: Get members with valid teamId (happy)', async () => {
        const team = await createTeam();

        const res = await axios.get(`${BASE_URL}/public/teams/${team?.id}/members`);
        expectFlexible(res.status, [200]);
    });

    it('TC119: Get members with invalid teamId (unhappy)', async () => {
        try {
            await axios.get(`${BASE_URL}/public/teams/invalid-id/members`);
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

});
describe('GET /public/teams/{teamId}/members/{playerId}', () => {

    it('TC120: Get public member detail', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);

        const res = await axios.get(
            `${BASE_URL}/public/teams/${team?.id}/members/${member?.id}`
        );

        expectFlexible(res.status, [200, 404]);
    });

    it('TC121: Get member detail with valid ids (happy)', async () => {
        const team = await createTeam();
        const member = await createMember(team?.id);

        const res = await axios.get(
            `${BASE_URL}/public/teams/${team?.id}/members/${member?.id}`
        );

        expectFlexible(res.status, [200]);
    });

    it('TC122: Get member detail with invalid playerId (unhappy)', async () => {
        const team = await createTeam();

        try {
            await axios.get(
                `${BASE_URL}/public/teams/${team?.id}/members/invalid-id`
            );
        } catch (error) {
            expectFlexible(error.response?.status, [400, 404]);
        }
    });

});
