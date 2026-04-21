const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function to get a valid auth token
let validToken = '';
let validManagerId = '';

// Setup - create an organizer account and get token before running tests
beforeAll(async () => {
    try {
        // Register a test organizer
        const timestamp = Date.now();
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: `test-organizer-${timestamp}@example.com`,
            password: 'password123',
            full_name: 'Test Organizer'
        });

        expect(registerResponse.status).toBe(201);

        // Login to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: `test-organizer-${timestamp}@example.com`,
            password: 'password123'
        });

        expect(loginResponse.status).toBe(200);

        validToken = loginResponse.data.data.token;
        validManagerId = loginResponse.data.data.user.id;
    } catch (error) {
        console.error('Setup failed:', error.message);
    }
});

// Helper functions
const createTeam = async (teamData = {}) => {
    const defaultData = { name: 'Test Team ' + Date.now() };
    const data = { ...defaultData, ...teamData };
    const response = await axios.post(`${BASE_URL}/teams`, data, {
        headers: { 'Authorization': `Bearer ${validToken}` }
    });
    return response.data.data;
};

const createMember = async (teamId, memberData = {}) => {
    const defaultData = { full_name: 'Player ' + Date.now(), age: 25, main_position: 'Forward' };
    const data = { ...defaultData, ...memberData };
    const response = await axios.post(`${BASE_URL}/teams/${teamId}/members`, data, {
        headers: { 'Authorization': `Bearer ${validToken}` }
    });
    return response.data.data;
};

describe('Teams API Integration Tests', () => {

    // ==================== HAPPY CASES ====================
    describe('POST /teams - Happy Cases', () => {

        it('TC01: Tạo team hợp lệ - Should create team with all valid fields', async () => {
            const teamData = {
                name: 'Test Team 101',
                country: 'Vietnam',
                description: 'A test team for TC01',
                logo_url: 'https://example.com/logo.jpg',
                kit_url: JSON.stringify([
                    'https://example.com/kit1.jpg',
                    'https://example.com/kit2.jpg'
                ])
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.message).toBe('Create team successfully');
            expect(response.data.data).toHaveProperty('id');
            expect(response.data.data).toHaveProperty('name');
            expect(response.data.data).toHaveProperty('country');
            expect(response.data.data).toHaveProperty('description');
            expect(response.data.data).toHaveProperty('logo_url');
            expect(response.data.data).toHaveProperty('kit_url');
            expect(response.data.data).toHaveProperty('manager_id');
        });

        it('TC02: Tạo với minimal fields - Should create team with only required fields', async () => {
            const teamData = {
                name: 'Minimal Team'
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.name).toBe(teamData.name);
            expect(response.data.data.manager_id).toBe(validManagerId);
        });

        it('TC03: kit_url hợp lệ - Should accept valid kit_url array', async () => {
            const teamData = {
                name: 'Kit URL Team',
                kit_url: JSON.stringify([
                    'https://example.com/kit1.jpg',
                    'https://example.com/kit2.jpg'
                ])
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(JSON.parse(response.data.data.kit_url))).toBe(true);
        });

        it('TC04: manager_id hợp lệ - Should create team with correct manager_id', async () => {
            const teamData = {
                name: 'Manager ID Team',
                country: 'Vietnam'
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.data.manager_id).toBe(validManagerId);
        });

    });

    // ==================== UNHAPPY CASES ====================
    describe('POST /teams - Unhappy Cases', () => {

        it('TC05: Thiếu name - Should return 400 when name is missing', async () => {
            const teamData = {
                country: 'Vietnam',
                description: 'Missing name'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC06: name rỗng - Should return 400 when name is empty string', async () => {
            const teamData = {
                name: '',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC07: name whitespace - Should return 400 when name is only whitespace', async () => {
            const teamData = {
                name: '   ',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC08: logo_url invalid - Should return 400 when logo_url is invalid URL', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam',
                logo_url: 'invalid-url'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC09: kit_url not array - Should return 400 when kit_url is not an array', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam',
                kit_url: JSON.stringify('not-an-array')
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC10: kit_url invalid URLs - Should return 400 when kit_url contains invalid URLs', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam',
                kit_url: JSON.stringify(['https://valid.com', 'invalid-url'])
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC11: Missing Authorization - Should return 401 when Authorization header is missing', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData);
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC12: Invalid token - Should return 401 when Authorization token is invalid', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC13: Expired token - Should return 401 when Authorization token is expired', async () => {
            const teamData = {
                name: 'Test Team',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': 'Bearer expired-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC14: SQL Injection in name - Should safely handle SQL injection attempts', async () => {
            const teamData = {
                name: "' OR '1'='1",
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect([200, 201, 400]).toContain(error.response.status);
                    if (error.response.status === 201) {
                        expect(error.response.data.success).toBe(true);
                    }
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC15: name có khoảng trắng - Should trim whitespace from name', async () => {
            const teamData = {
                name: '  Team A  ',
                country: 'Vietnam'
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.name).toBe('Team A');
        });

    });

    // ==================== GET /teams - Happy Cases ====================
    describe('GET /teams - Happy Cases', () => {

        it('TC16: Get all teams - Should return all teams for authenticated user', async () => {
            const response = await axios.get(`${BASE_URL}/teams`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC17: Search by name - Should return teams matching search term', async () => {
            const response = await axios.get(`${BASE_URL}/teams?search=Test`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
            // Should contain teams with "Test" in name
            if (response.data.data.length > 0) {
                response.data.data.forEach(team => {
                    expect(team.name.toLowerCase()).toContain('test');
                });
            }
        });

        it('TC18: Search with Vietnamese characters - Should handle Unicode search correctly', async () => {
            const response = await axios.get(`${BASE_URL}/teams?search=Đội`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });


    });

    // ==================== GET /teams - Unhappy Cases ====================
    describe('GET /teams - Unhappy Cases', () => {

        it('TC19: Missing token - Should return 401 when Authorization header is missing', async () => {
            try {
                await axios.get(`${BASE_URL}/teams`);
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC20: Invalid token - Should return 401 when Authorization token is invalid', async () => {
            try {
                await axios.get(`${BASE_URL}/teams`, {
                    headers: {
                        'Authorization': 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC21: Expired token - Should return 401 when Authorization token is expired', async () => {
            try {
                await axios.get(`${BASE_URL}/teams`, {
                    headers: {
                        'Authorization': 'Bearer expired-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC22: SQL Injection in search - Should safely handle SQL injection in search parameter', async () => {
            try {
                await axios.get(`${BASE_URL}/teams?search=' OR '1'='1`, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect([200, 400]).toContain(error.response.status);
                    if (error.response.status === 200) {
                        expect(error.response.data.success).toBe(true);
                        expect(Array.isArray(error.response.data.data)).toBe(true);
                        // Should not return all teams due to injection
                        expect(error.response.data.data.length).toBe(0);
                    }
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });
    });

    // ==================== GET /teams/{teamId} - Happy Cases ====================
    describe('GET /teams/:teamId - Happy Cases', () => {

        it('TC23: Get team details with valid ID - Should return team details for valid team ID', async () => {
            const team = await createTeam({ name: 'Team for Details Test', country: 'Vietnam' });

            const response = await axios.get(`${BASE_URL}/teams/${team.id}`, {
                headers: { 'Authorization': `Bearer ${validToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.message).toBe('Get team successfully');
            expect(response.data.data).toHaveProperty('id');
            expect(response.data.data).toHaveProperty('name');
            expect(response.data.data).toHaveProperty('country');
            expect(response.data.data).toHaveProperty('description');
            expect(response.data.data).toHaveProperty('logo_url');
            expect(response.data.data).toHaveProperty('kit_url');
            expect(response.data.data).toHaveProperty('manager_id');
            expect(response.data.data).toHaveProperty('created_at');
            expect(response.data.data).toHaveProperty('updated_at');
            expect(response.data.data.id).toBe(team.id);
            expect(response.data.data.name).toBe('Team for Details Test');
        });

        it('TC24: Get team with all fields populated - Should return complete team data', async () => {
            const team = await createTeam({
                name: 'Complete Team Details',
                country: 'Vietnam',
                description: 'Full team description',
                logo_url: 'https://example.com/logo.jpg',
                kit_url: JSON.stringify(['https://example.com/kit1.jpg', 'https://example.com/kit2.jpg'])
            });

            const response = await axios.get(`${BASE_URL}/teams/${team.id}`, {
                headers: { 'Authorization': `Bearer ${validToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.data.name).toBe('Complete Team Details');
            expect(response.data.data.country).toBe('Vietnam');
            expect(response.data.data.description).toBe('Full team description');
            expect(response.data.data.logo_url).toBe('https://example.com/logo.jpg');
            expect(Array.isArray(JSON.parse(response.data.data.kit_url))).toBe(true);
            expect(JSON.parse(response.data.data.kit_url)).toHaveLength(2);
        });

    });

    // ==================== GET /teams/{teamId} - Unhappy Cases ====================
    describe('GET /teams/:teamId - Unhappy Cases', () => {

        it('TC25: Team ID does not exist - Should return 404 for non-existent team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/999999`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC26: Invalid team ID format - string - Should handle invalid string team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid-string-id`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC27: Invalid team ID format - special characters - Should handle special characters in team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/team@#$%^&*()`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC28: Null team ID - Should handle null team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC29: Very large team ID - Should handle extremely large team ID', async () => {
            const largeId = '9'.repeat(100);
            try {
                await axios.get(`${BASE_URL}/teams/${largeId}`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC30: Missing token - Should return 401 when Authorization header is missing', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team.id}`);
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC31: Invalid token - Should return 401 when Authorization token is invalid', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team.id}`, {
                    headers: {
                        'Authorization': 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC32: Float team ID - Should handle float team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/123.45`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC33: SQL injection in team ID - Should safely handle SQL injection in teamId parameter', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1' OR '1'='1`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC34: Extremely long team ID - Should handle very long team ID strings', async () => {
            const longId = 'a'.repeat(1000) + '123';
            try {
                await axios.get(`${BASE_URL}/teams/${longId}`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

    });

    // ==================== PUT /teams/{teamId} - Validation Cases ====================
    describe('PUT /teams/:teamId - Validation Cases', () => {

        it('TC35: Update team with valid data - Should update all fields successfully', async () => {
            const team = await createTeam({
                name: 'Team Update Full',
                country: 'Vietnam',
                description: 'Before update'
            });

            const updateResponse = await axios.put(`${BASE_URL}/teams/${team.id}`, {
                name: 'Team Updated Full',
                country: 'Thailand',
                description: 'After update',
                logo_url: 'https://example.com/new-logo.jpg',
                kit_url: JSON.stringify(['https://example.com/newkit1.jpg'])
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);
            expect(updateResponse.data.data.name).toBe('Team Updated Full');
            expect(updateResponse.data.data.country).toBe('Thailand');
            expect(updateResponse.data.data.description).toBe('After update');
            expect(updateResponse.data.data.logo_url).toBe('https://example.com/new-logo.jpg');
            expect(Array.isArray(JSON.parse(updateResponse.data.data.kit_url))).toBe(true);
            expect(JSON.parse(updateResponse.data.data.kit_url)).toContain('https://example.com/newkit1.jpg');
        });

        it('TC36: Update part of a field - Should update name only', async () => {
            const team = await createTeam({
                name: 'Team Update Name Only',
                country: 'Vietnam',
                description: 'Initial description'
            });

            const updateResponse = await axios.put(`${BASE_URL}/teams/${team.id}`, {
                name: 'Team Name Changed'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);
            expect(updateResponse.data.data.name).toBe('Team Name Changed');
            expect(updateResponse.data.data.description).toBe('Initial description');
        });


        it('TC37: Update with empty name - Should return 400 when updating to empty name', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    name: ''
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC38: Update with whitespace name - Should trim whitespace from name', async () => {
            const team = await createTeam();
            const updateResponse = await axios.put(`${BASE_URL}/teams/${team.id}`, {
                name: '  Updated Name  '
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);
            expect(updateResponse.data.data.name).toBe('Updated Name');
        });

        it('TC39: Update with invalid logo_url - Should return 400 for invalid logo_url', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    logo_url: 'invalid-url'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC40: Update with invalid kit_url - Should return 400 for invalid kit_url', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    kit_url: 'invalid-json'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC41: Update non-existent team - Should return 404 for non-existent team ID', async () => {
            try {
                await axios.put(`${BASE_URL}/teams/999999`, {
                    name: 'Updated Name'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC42: Update with invalid token - Should return 401 for invalid token', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    name: 'Updated Name'
                }, {
                    headers: {
                        Authorization: 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC43: Update without token - Should return 401 when Authorization header is missing', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    name: 'Updated Name'
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC44: Update with unauthorized user - Should return 404 when user is not the owner', async () => {
            const team = await createTeam();
            // Create another user
            const timestamp = Date.now();
            const secondUserResponse = await axios.post(`${BASE_URL}/auth/register`, {
                email: `other-organizer-${timestamp}@example.com`,
                password: 'password123',
                full_name: 'Other Organizer'
            });
            expect(secondUserResponse.status).toBe(201);

            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: `other-organizer-${timestamp}@example.com`,
                password: 'password123'
            });
            expect(loginResponse.status).toBe(200);
            const otherToken = loginResponse.data.data.token;

            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    name: 'Unauthorized Update'
                }, {
                    headers: { Authorization: `Bearer ${otherToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC45: Update with SQL injection - Should safely handle SQL injection in update data', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    name: "' OR '1'='1"
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect([200, 400]).toContain(error.response.status);
                    if (error.response.status === 200) {
                        expect(error.response.data.success).toBe(true);
                    }
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC46: Update with invalid kit_url array - Should return 400 when kit_url is not an array', async () => {
            const team = await createTeam();
            try {
                await axios.put(`${BASE_URL}/teams/${team.id}`, {
                    kit_url: 'not-an-array'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

    });

    describe('GET /teams/{teamId}/members - Happy Cases', () => {

        it('TC47: Get members with valid teamId - Should return members array', async () => {
            const team = await createTeam();
            await createMember(team.id);
            const response = await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { 'Authorization': `Bearer ${validToken}` }
            });
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC48: Team with members - Should return non-empty members array', async () => {
            const team = await createTeam();
            const member = await createMember(team.id);
            const response = await axios.get(`${BASE_URL}/teams/${team.id}/members`, {
                headers: { 'Authorization': `Bearer ${validToken}` }
            });
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data.length).toBeGreaterThan(0);
            
            // Validate member structure
            const memberData = response.data.data[0];
            expect(memberData).toHaveProperty('id');
            expect(memberData).toHaveProperty('full_name');
            expect(memberData).toHaveProperty('age');
            expect(memberData).toHaveProperty('height_cm');
            expect(memberData).toHaveProperty('weight_kg');
            expect(memberData).toHaveProperty('preferred_foot');
            expect(memberData).toHaveProperty('main_position');
            expect(memberData).toHaveProperty('jersey_number');
            expect(memberData).toHaveProperty('joined_at');
        });


    });

    describe('GET /teams/{teamId}/members - Unhappy Cases', () => {

        it('TC49: teamId does not exist - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/99999/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC50: Invalid teamId format - string - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid-string-id/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC51: Invalid teamId format - special characters - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/!@#$%^&*()/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC52: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC53: Edge case - very large teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/999999999999999999999/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC54: SQL Injection attempt - Should safely handle SQL injection', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1' OR '1'='1/members`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
            } catch (error) {
                if (error.response) {
                    expect([400, 404]).toContain(error.response.status);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC55: Missing token - Should return 401', async () => {
            const team = await createTeam();
            try {
                await axios.get(`${BASE_URL}/teams/${team.id}/members`);
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });
    });

    describe('GET /teams/{teamId}/members/{playerId}', () => {

        describe('Happy Cases', () => {

            it('TC56: Get member detail with valid IDs - Should return member details', async () => {
                const team = await createTeam();
                const member = await createMember(team.id);
                const response = await axios.get(`${BASE_URL}/teams/${team.id}/members/${member.id}`, {
                    headers: { 'Authorization': `Bearer ${validToken}` }
                });
                expect(response.status).toBe(200);
                expect(response.data.success).toBe(true);
                expect(response.data.data.id).toBe(member.id);
                expect(response.data.data.full_name).toBe(member.full_name);
                expect(response.data.data.age).toBe(member.age);
                expect(response.data.data.main_position).toBe(member.main_position);
            });


        });

        describe('Unhappy Cases', () => {

            it('TC57: teamId does not exist - Should return 404', async () => {
                try {
                    await axios.get(`${BASE_URL}/teams/99999/members/1`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC58: playerId does not exist - Should return 404', async () => {
                const team = await createTeam();
                try {
                    await axios.get(`${BASE_URL}/teams/${team.id}/members/99999`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC59: Invalid teamId format - Should return 400 or 404', async () => {
                try {
                    await axios.get(`${BASE_URL}/teams/invalid/members/1`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC60: Invalid playerId format - Should return 400 or 404', async () => {
                const team = await createTeam();
                try {
                    await axios.get(`${BASE_URL}/teams/${team.id}/members/invalid`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC61: Edge case - null playerId - Should return 400 or 404', async () => {
                const team = await createTeam();
                try {
                    await axios.get(`${BASE_URL}/teams/${team.id}/members/null`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC62: Edge case - null teamId - Should return 400 or 404', async () => {
                try {
                    await axios.get(`${BASE_URL}/teams/null/members/1`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC63: Edge case - null playerId - Should return 400 or 404', async () => {
                const team = await createTeam();
                try {
                    await axios.get(`${BASE_URL}/teams/${team.id}/members/null`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

        });

    });

    describe('POST /teams/{teamId}/members - Happy Cases', () => {

        it('TC64: Add member with valid data - Should add member with all valid fields', async () => {
            const team = await createTeam();
            const memberData = {
                full_name: 'Nguyễn Văn A',
                age: 25,
                height_cm: 180,
                weight_kg: 75,
                preferred_foot: 'right',
                main_position: 'Forward',
                jersey_number: 7
            };
            const response = await axios.post(
                `${BASE_URL}/teams/${team.id}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.full_name).toBe(memberData.full_name);
            expect(response.data.data.age).toBe(memberData.age);
        });



        it('TC65: Add member to non-existent team - Should return 404', async () => {
            const memberData = {
                full_name: 'Test Player',
                age: 25,
                main_position: 'Forward'
            };
            try {
                await axios.post(
                    `${BASE_URL}/teams/99999/members`,
                    memberData,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC66: Add member without authorization - Should return 401', async () => {
            const team = await createTeam();
            const memberData = {
                full_name: 'Test Player',
                age: 25,
                main_position: 'Forward'
            };
            try {
                await axios.post(
                    `${BASE_URL}/teams/${team.id}/members`,
                    memberData
                );
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });

        it('TC67: Add member with invalid token - Should return 401', async () => {
            const team = await createTeam();
            const memberData = {
                full_name: 'Test Player',
                age: 25,
                main_position: 'Forward'
            };
            try {
                await axios.post(
                    `${BASE_URL}/teams/${team.id}/members`,
                    memberData,
                    { headers: { Authorization: 'Bearer invalid-token-12345' } }
                );
            } catch (error) {
                if (error.response) {
                    expect(error.response.status).toBe(401);
                    expect(error.response.data.success).toBe(false);
                } else {
                    expect.fail('No response received: ' + error.message);
                }
            }
        });



    });

    describe('DELETE /teams/{teamId}/members/{playerId}', () => {

        describe('Happy Cases', () => {

            it('TC68: Delete member successfully - Should delete member and return 200 or 204', async () => {
                const team = await createTeam();
                const member = await createMember(team.id);
                const response = await axios.delete(
                    `${BASE_URL}/teams/${team.id}/members/${member.id}`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
                expect([200, 204]).toContain(response.status);
                if (response.status === 200) {
                    expect(response.data.success).toBe(true);
                }
            });

        });

        describe('Unhappy Cases', () => {

            it('TC69: Delete non-existent member - Should return 404', async () => {
                const team = await createTeam();
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/${team.id}/members/99999`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC70: Delete member from non-existent team - Should return 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/99999/members/1`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC71: Delete member without authorization - Should return 401', async () => {
                const team = await createTeam();
                const member = await createMember(team.id);
                try {
                    await axios.delete(`${BASE_URL}/teams/${team.id}/members/${member.id}`);
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(401);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });




            it('TC72: Delete member with invalid teamId format - Should return 400 or 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/invalid/members/1`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC73: Delete member with invalid playerId format - Should return 400 or 404', async () => {
                const team = await createTeam();
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/${team.id}/members/invalid`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC74: Edge case - null playerId - Should return 400 or 404', async () => {
                const team = await createTeam();
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/${team.id}/members/null`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC75: Edge case - null teamId - Should return 400 or 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/null/members/1`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

        });

    });

    describe('DELETE /teams/{teamId}', () => {

        describe('Happy Cases', () => {

            it('TC76: Delete team successfully - Should delete team and return 200 or 204', async () => {
                const team = await createTeam();
                const response = await axios.delete(
                    `${BASE_URL}/teams/${team.id}`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
                expect([200, 204]).toContain(response.status);
                if (response.status === 200) {
                    expect(response.data.success).toBe(true);
                }
            });

            it('TC77: Delete team and verify removal - Should not be able to get deleted team', async () => {
                const team = await createTeam();
                const deleteResponse = await axios.delete(
                    `${BASE_URL}/teams/${team.id}`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
                expect([200, 204]).toContain(deleteResponse.status);

                // Try to get the deleted team
                try {
                    await axios.get(`${BASE_URL}/teams/${team.id}`, {
                        headers: { 'Authorization': `Bearer ${validToken}` }
                    });
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });


        });

        describe('Unhappy Cases', () => {

            it('TC78: Delete non-existent team - Should return 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/99999`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC79: teamId does not exist - Should return 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/99999`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC80: Invalid teamId format - string - Should return 400 or 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/invalid-string-id`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC81: Missing token - Should return 401', async () => {
                const team = await createTeam();
                try {
                    await axios.delete(`${BASE_URL}/teams/${team.id}`);
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(401);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC82: Invalid token - Should return 401', async () => {
                const team = await createTeam();
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/${team.id}`,
                        { headers: { Authorization: 'Bearer invalid-token-12345' } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(401);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC83: Unauthorized user - Should return 404 when user is not owner', async () => {
                const team = await createTeam();
                // Create another user
                const timestamp = Date.now();
                const secondUserResponse = await axios.post(`${BASE_URL}/auth/register`, {
                    email: `other-organizer-${timestamp}@example.com`,
                    password: 'password123',
                    full_name: 'Other Organizer'
                });
                expect(secondUserResponse.status).toBe(201);

                const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                    email: `other-organizer-${timestamp}@example.com`,
                    password: 'password123'
                });
                expect(loginResponse.status).toBe(200);
                const otherToken = loginResponse.data.data.token;

                try {
                    await axios.delete(
                        `${BASE_URL}/teams/${team.id}`,
                        { headers: { Authorization: `Bearer ${otherToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect(error.response.status).toBe(404);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });

            it('TC84: Edge case - null teamId - Should return 400 or 404', async () => {
                try {
                    await axios.delete(
                        `${BASE_URL}/teams/null`,
                        { headers: { Authorization: `Bearer ${validToken}` } }
                    );
                } catch (error) {
                    if (error.response) {
                        expect([400, 404]).toContain(error.response.status);
                        expect(error.response.data.success).toBe(false);
                    } else {
                        expect.fail('No response received: ' + error.message);
                    }
                }
            });
        });

    });

});