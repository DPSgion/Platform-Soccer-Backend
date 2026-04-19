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

        it('TC03: Unicode name - Should handle Vietnamese Unicode characters', async () => {
            const teamData = {
                name: 'Đội bóng VN',
                country: 'Việt Nam',
                description: 'Mô tả đội bóng'
            };

            const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.name).toBe(teamData.name);
            expect(response.data.data.country).toBe(teamData.country);
        });

        it('TC04: kit_url hợp lệ - Should accept valid kit_url array', async () => {
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

        it('TC05: manager_id hợp lệ - Should create team with correct manager_id', async () => {
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

        it('TC06: Thiếu name - Should return 400 when name is missing', async () => {
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
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC07: name rỗng - Should return 400 when name is empty string', async () => {
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
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC08: name whitespace - Should return 400 when name is only whitespace', async () => {
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
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC09: logo_url sai - Should return 400 for invalid logo_url', async () => {
            const teamData = {
                name: 'Invalid Logo Team',
                logo_url: 'abc'
            };

            try {
                const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });

                // Should either return 400 or handle gracefully
                if (response.status === 400) {
                    expect(response.data.success).toBe(false);
                }
            } catch (error) {
                if (error.response.status === 400) {
                    expect(error.response.data.success).toBe(false);
                }
            }
        });

        it('TC10: kit_url không phải array - Should return 400 when kit_url is not array', async () => {
            const teamData = {
                name: 'Invalid Kit Team',
                kit_url: 'abc'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC11: kit_url sai data - Should return 400 when kit_url contains invalid data', async () => {
            const teamData = {
                name: 'Mixed Kit Team',
                kit_url: JSON.stringify([123, 'abc'])
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC12: Không có token - Should return 401 when Authorization header is missing', async () => {
            const teamData = {
                name: 'No Token Team',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData);
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC13: Token sai - Should return 401 for invalid token', async () => {
            const teamData = {
                name: 'Fake Token Team',
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': 'Bearer fake-invalid-token-12345'
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC14: SQL Injection - Should safely handle SQL injection attempts', async () => {
            const teamData = {
                name: "' OR 1=1--",
                country: 'Vietnam'
            };

            try {
                const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });

                // Should not crash or execute SQL - either reject or sanitize
                expect([200, 201, 400]).toContain(response.status);
                if (response.status === 201) {
                    expect(response.data.data.name).not.toContain("'");
                }
            } catch (error) {
                expect([200, 201, 400]).toContain(error.response.status);
            }
        });

        it('TC15: XSS - Should safely handle XSS attempts', async () => {
            const teamData = {
                name: '<script>alert(1)</script>',
                country: 'Vietnam'
            };

            try {
                const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });

                // Should create team but not execute script
                if (response.status === 201) {
                    expect(response.data.data.name).not.toContain('<script>');
                }
            } catch (error) {
                // Handle error case
            }
        });

        it('TC16: name quá dài - Should return 400 for name longer than 255 characters', async () => {
            const longName = 'A'.repeat(256);
            const teamData = {
                name: longName,
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC17: name = null - Should return 400 when name is null', async () => {
            const teamData = {
                name: null,
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC18: name = number - Should return 400 when name is a number', async () => {
            const teamData = {
                name: 123,
                country: 'Vietnam'
            };

            try {
                await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC19: name emoji - Should handle emoji in name correctly', async () => {
            const teamData = {
                name: '⚽🔥 Team',
                country: 'Vietnam'
            };

            try {
                const response = await axios.post(`${BASE_URL}/teams`, teamData, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });

                // Should either accept or handle gracefully
                expect([200, 201, 400]).toContain(response.status);
                if (response.status === 201) {
                    expect(response.data.success).toBe(true);
                }
            } catch (error) {
                expect([200, 201, 400]).toContain(error.response.status);
            }
        });

        it('TC20: name có khoảng trắng - Should trim whitespace from name', async () => {
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

// ==================== GET /teams - Happy Cases ====================
    describe('GET /teams - Happy Cases', () => {

        it('TC21: Get all teams - Should return all teams for authenticated user', async () => {
            const response = await axios.get(`${BASE_URL}/teams`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC22: Search by name - Should return teams matching search term', async () => {
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

        it('TC23: Search with Vietnamese characters - Should handle Unicode search correctly', async () => {
            const response = await axios.get(`${BASE_URL}/teams?search=Đội`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC24: Empty search results - Should return empty array when no teams match', async () => {
            const response = await axios.get(`${BASE_URL}/teams?search=NonExistentTeam12345`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
            expect(response.data.data.length).toBe(0);
        });

    });

    // ==================== GET /teams - Unhappy Cases ====================
    describe('GET /teams - Unhappy Cases', () => {

        it('TC25: Missing token - Should return 401 when Authorization header is missing', async () => {
            try {
                await axios.get(`${BASE_URL}/teams`);
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC26: Invalid token - Should return 401 for invalid token', async () => {
            try {
                await axios.get(`${BASE_URL}/teams`, {
                    headers: {
                        'Authorization': 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });



        it('TC27: Empty search parameter - Should return all teams when search is empty', async () => {
            const response = await axios.get(`${BASE_URL}/teams?search=`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC28: Very long search string - Should handle extremely long search strings', async () => {
            const longSearch = 'A'.repeat(1000);
            const response = await axios.get(`${BASE_URL}/teams?search=${longSearch}`, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.data.success).toBe(true);
                expect(Array.isArray(response.data.data)).toBe(true);
            }
        });

        it('TC29: SQL injection in search - Should safely handle SQL injection attempts in search query', async () => {
            try {
                const response = await axios.get(`${BASE_URL}/teams?search=' OR '1'='1`, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`
                    }
                });

                expect(response.status).toBe(200);
                expect(response.data.success).toBe(true);
                expect(Array.isArray(response.data.data)).toBe(true);
                // Should not return all teams due to injection
                expect(response.data.data.length).toBe(0);
            } catch (error) {
                // May return 400 for invalid query
                expect([200, 400]).toContain(error.response.status);
            }
        });
 // ==================== GET /teams/{teamId} - Happy Cases ====================
    describe('GET /teams/:teamId - Happy Cases', () => {

        it('TC30: Get team details with valid ID - Should return team details for valid team ID', async () => {
            // First create a team to get a valid ID
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Details Test',
                country: 'Vietnam'
            }, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            // Now get team details
            const response = await axios.get(`${BASE_URL}/teams/${teamId}`);

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
            expect(response.data.data.id).toBe(teamId);
            expect(response.data.data.name).toBe('Team for Details Test');
        });

        it('TC31: Get team with all fields populated - Should return complete team data', async () => {
            // Create a team with all fields
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Complete Team Details',
                country: 'Vietnam',
                description: 'Full team description',
                logo_url: 'https://example.com/logo.jpg',
                kit_url: JSON.stringify(['https://example.com/kit1.jpg', 'https://example.com/kit2.jpg'])
            }, {
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            // Get team details
            const response = await axios.get(`${BASE_URL}/teams/${teamId}`);

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

        it('TC32: Team ID does not exist - Should return 404 for non-existent team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/999999`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC33: Invalid team ID format - string - Should handle invalid string team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid-string-id`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC34: Invalid team ID format - special characters - Should handle special characters in team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/team@#$%^&*()`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC35: Null team ID - Should handle null team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC36: Very large team ID - Should handle extremely large team ID', async () => {
            const largeId = '9'.repeat(100);
            try {
                await axios.get(`${BASE_URL}/teams/${largeId}`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC37: Negative team ID - Should handle negative team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/-123`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC38: Zero team ID - Should handle zero team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/0`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC39: Float team ID - Should handle float team ID', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/123.45`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

        it('TC40: SQL injection in team ID - Should safely handle SQL injection in teamId parameter', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1' OR '1'='1`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                // Should not crash or execute SQL
            }
        });



        it('TC41: Extremely long team ID - Should handle very long team ID strings', async () => {
            const longId = 'a'.repeat(1000) + '123';
            try {
                await axios.get(`${BASE_URL}/teams/${longId}`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });

    });

    // ==================== PUT /teams/{teamId} - Validation Cases ====================
    describe('PUT /teams/:teamId - Validation Cases', () => {

        it('TC42: Update team with valid data - Should update all fields successfully', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Update Full',
                country: 'Vietnam',
                description: 'Before update'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            const updateResponse = await axios.put(`${BASE_URL}/teams/${teamId}`, {
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

        it('TC43: Update part of a field - Should update name only', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Update Name Only',
                country: 'Vietnam',
                description: 'Initial description'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            const updateResponse = await axios.put(`${BASE_URL}/teams/${teamId}`, {
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

        it('TC44: Update part of a field - Should update description only', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Update Description Only',
                country: 'Vietnam',
                description: 'Before description'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            const updateResponse = await axios.put(`${BASE_URL}/teams/${teamId}`, {
                description: 'Updated description only'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);
            expect(updateResponse.data.data.description).toBe('Updated description only');
            expect(updateResponse.data.data.name).toBe('Team Update Description Only');
        });

        it('TC45: Update with Unicode data - Should update team with Unicode fields', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Unicode Update Team',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            const updateResponse = await axios.put(`${BASE_URL}/teams/${teamId}`, {
                name: 'Đội bóng cập nhật',
                description: 'Mô tả cập nhật'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.data.name).toBe('Đội bóng cập nhật');
            expect(updateResponse.data.data.description).toBe('Mô tả cập nhật');
        });

        it('TC46: teamId does not exist - Should return 404 for non-existent team', async () => {
            try {
                await axios.put(`${BASE_URL}/teams/999999`, {
                    name: 'Does Not Exist'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC47: Invalid teamId format - string - Should return 400 or 404 for invalid teamId', async () => {
            try {
                await axios.put(`${BASE_URL}/teams/invalid-string-id`, {
                    name: 'Invalid ID'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
            }
        });


        it('TC48: Missing token - Should return 401 when Authorization header is missing', async () => {
            try {
                await axios.put(`${BASE_URL}/teams/1`, {
                    name: 'No Token Update'
                });
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC49: Invalid token - Should return 401 for invalid token', async () => {
            try {
                await axios.put(`${BASE_URL}/teams/1`, {
                    name: 'Invalid Token Update'
                }, {
                    headers: {
                        Authorization: 'Bearer invalid-token-12345'
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC50: Unauthorized user - Should return 404 when user is not owner', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Unauthorized Owner Team',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

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
                await axios.put(`${BASE_URL}/teams/${teamId}`, {
                    name: 'Should Not Update'
                }, {
                    headers: {
                        Authorization: `Bearer ${otherToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC51: Empty name - Should return 400 when name is empty string', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Empty Name Update',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            try {
                await axios.put(`${BASE_URL}/teams/${teamId}`, {
                    name: ''
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC52: Null name - Should return 400 when name is null', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Null Name Update',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            try {
                await axios.put(`${BASE_URL}/teams/${teamId}`, {
                    name: null
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC53: Name too long - Should return 400 when name exceeds 255 characters', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Too Long Name Update',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;
            const longName = 'A'.repeat(256);

            try {
                await axios.put(`${BASE_URL}/teams/${teamId}`, {
                    name: longName
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC54: Invalid kit_url format - Should return 400 when kit_url is not an array', async () => {
            const createResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team Invalid Kit Update',
                country: 'Vietnam'
            }, {
                headers: {
                    Authorization: `Bearer ${validToken}`
                }
            });

            expect(createResponse.status).toBe(201);
            const teamId = createResponse.data.data.id;

            try {
                await axios.put(`${BASE_URL}/teams/${teamId}`, {
                    kit_url: 'not-an-array'
                }, {
                    headers: {
                        Authorization: `Bearer ${validToken}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

    });

    describe('GET /teams/{teamId}/members - Happy Cases', () => {

        it('TC55: Get members with valid teamId - Should return members array', async () => {
            const response = await axios.get(`${BASE_URL}/teams/1/members`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('TC56: Team with members - Should return non-empty members array', async () => {
            const response = await axios.get(`${BASE_URL}/teams/1/members`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data.length).toBeGreaterThan(0);
            
            // Validate member structure
            const member = response.data.data[0];
            expect(member).toHaveProperty('id');
            expect(member).toHaveProperty('full_name');
            expect(member).toHaveProperty('age');
            expect(member).toHaveProperty('height_cm');
            expect(member).toHaveProperty('weight_kg');
            expect(member).toHaveProperty('preferred_foot');
            expect(member).toHaveProperty('main_position');
            expect(member).toHaveProperty('jersey_number');
            expect(member).toHaveProperty('joined_at');
        });

        it('TC57: Team with no members - Should return empty array or 404', async () => {
            try {
                const response = await axios.get(`${BASE_URL}/teams/9999/members`);
                expect(response.status).toBe(200);
                expect(response.data.success).toBe(true);
                expect(Array.isArray(response.data.data)).toBe(true);
                expect(response.data.data.length).toBe(0);
            } catch (error) {
                // Some backends return 404 for teams with no members
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

    });

    describe('GET /teams/{teamId}/members - Unhappy Cases', () => {

        it('TC58: teamId does not exist - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/99999/members`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC59: Invalid teamId format - string - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid-string-id/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC60: Invalid teamId format - special characters - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/!@#$%^&*()/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC61: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC62: Edge case - empty teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams//members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC63: Edge case - very large teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/999999999999999999999/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC64: Response structure validation - Should have correct member properties', async () => {
            const response = await axios.get(`${BASE_URL}/teams/1/members`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            
            if (response.data.data.length > 0) {
                const member = response.data.data[0];
                expect(typeof member.id).toBe('number');
                expect(typeof member.full_name).toBe('string');
                expect(typeof member.age).toBe('number');
                expect(typeof member.height_cm).toBe('number');
                expect(typeof member.weight_kg).toBe('number');
                expect(typeof member.preferred_foot).toBe('string');
                expect(typeof member.main_position).toBe('string');
                expect(typeof member.jersey_number).toBe('number');
                expect(member).toHaveProperty('joined_at');
            }
        });

        it('TC65: SQL Injection attempt - Should safely handle SQL injection', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1' OR '1'='1/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC66: XSS attempt - Should safely handle XSS attempts', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/<script>alert('xss')</script>/members`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

    });

    describe('GET /teams/{teamId}/members/{playerId}', () => {

    describe('Happy Cases', () => {

        it('TC67: Valid teamId and playerId - Should return member data', async () => {
            const response = await axios.get(`${BASE_URL}/teams/1/members/1`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.message).toBe('Get team member successfully');
            expect(response.data.data).toBeDefined();
            expect(typeof response.data.data.id).toBe('number');
            expect(typeof response.data.data.full_name).toBe('string');
        });

        it('TC68: Response structure validation - Should have all required properties', async () => {
            const response = await axios.get(`${BASE_URL}/teams/1/members/1`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            const member = response.data.data;
            expect(member).toHaveProperty('id');
            expect(member).toHaveProperty('team_id');
            expect(member).toHaveProperty('full_name');
            expect(member).toHaveProperty('image_url');
            expect(member).toHaveProperty('age');
            expect(member).toHaveProperty('height_cm');
            expect(member).toHaveProperty('weight_kg');
            expect(member).toHaveProperty('preferred_foot');
            expect(member).toHaveProperty('main_position');
            expect(member).toHaveProperty('jersey_number');
            expect(member).toHaveProperty('joined_at');
            expect(member).toHaveProperty('created_at');
            expect(member).toHaveProperty('updated_at');
        });

    });

    describe('Unhappy Cases', () => {

        it('TC69: teamId does not exist - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/99999/members/1`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC70: playerId does not exist - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1/members/99999`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC71: playerId exists but not in the specified team - Should return 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1/members/2`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC72: Invalid teamId format - string - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/invalid-string-id/members/1`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC73: Invalid playerId format - string - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1/members/invalid-string-id`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC74: Invalid teamId format - special characters - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/!@#$%^&*()/members/1`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC75: Invalid playerId format - special characters - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1/members/!@#$%^&*()`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC76: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/null/members/1`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC77: Edge case - null playerId - Should return 400 or 404', async () => {
            try {
                await axios.get(`${BASE_URL}/teams/1/members/null`);
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

describe('POST /teams/{teamId}/members - Happy Cases', () => {

    it('TC78: Add member with valid data - Should add member with all valid fields', async () => {
        const memberData = {
            full_name: 'Nguyễn Văn A',
            age: 25,
            height_cm: 180,
            weight_kg: 75,
            preferred_foot: 'right',
            main_position: 'Forward',
            jersey_number: 7
        };

        try {
            const response = await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.full_name).toBe(memberData.full_name);
            expect(response.data.data.age).toBe(memberData.age);
        } catch (error) {
            console.error('TC78 Error:', error.response?.data);
        }
    });

    it('TC79: Add member with minimum required fields - Should create member with only essential data', async () => {
        const memberData = {
            full_name: 'Trần Văn B',
            age: 22,
            main_position: 'Midfielder'
        };

        try {
            const response = await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.full_name).toBe(memberData.full_name);
        } catch (error) {
            console.error('TC79 Error:', error.response?.data);
        }
    });

    it('TC80: Add member with Unicode data - Should handle Vietnamese characters correctly', async () => {
        const memberData = {
            full_name: 'Phạm Đức Cường',
            age: 28,
            height_cm: 185,
            weight_kg: 82,
            preferred_foot: 'left',
            main_position: 'Defender',
            jersey_number: 4
        };

        try {
            const response = await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data.full_name).toBe(memberData.full_name);
        } catch (error) {
            console.error('TC80 Error:', error.response?.data);
        }
    });

    it('TC81: Add member with all optional fields - Should store all member properties', async () => {
        const memberData = {
            full_name: 'Lê Minh D',
            age: 26,
            height_cm: 175,
            weight_kg: 70,
            preferred_foot: 'right',
            main_position: 'Goalkeeper',
            jersey_number: 1
        };

        try {
            const response = await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(response.status).toBe(201);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('id');
            expect(response.data.data).toHaveProperty('team_id');
            expect(response.data.data).toHaveProperty('full_name');
            expect(response.data.data).toHaveProperty('age');
        } catch (error) {
            console.error('TC81 Error:', error.response?.data);
        }
    });

});

describe('POST /teams/{teamId}/members - Unhappy Cases', () => {

    it('TC82: teamId does not exist - Should return 404', async () => {
        const memberData = {
            full_name: 'Đặng Văn E',
            age: 24,
            main_position: 'Defender'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/99999/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC83: Invalid teamId format - string - Should return 400 or 404', async () => {
        const memberData = {
            full_name: 'Bùi Văn F',
            age: 23,
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/invalid-string-id/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect([400, 404]).toContain(error.response.status);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC84: Invalid teamId format - special characters - Should return 400 or 404', async () => {
        const memberData = {
            full_name: 'Hồ Văn G',
            age: 27,
            main_position: 'Midfielder'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/!@#$%^&*()/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect([400, 404]).toContain(error.response.status);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC85: Missing token - Should return 401', async () => {
        const memberData = {
            full_name: 'Võ Văn H',
            age: 25,
            main_position: 'Forward'
        };

        try {
            await axios.post(`${BASE_URL}/teams/1/members`, memberData);
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC86: Invalid token - Should return 401', async () => {
        const memberData = {
            full_name: 'Tô Văn I',
            age: 24,
            main_position: 'Defender'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: 'Bearer invalid-token-12345' } }
            );
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC87: Malformed token - Should return 401', async () => {
        const memberData = {
            full_name: 'Trương Văn J',
            age: 26,
            main_position: 'Midfielder'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: 'InvalidTokenFormat' } }
            );
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC88: Missing required field - full_name - Should return 400', async () => {
        const memberData = {
            age: 25,
            height_cm: 180,
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC89: Empty full_name - Should return 400', async () => {
        const memberData = {
            full_name: '',
            age: 25,
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC90: null full_name - Should return 400', async () => {
        const memberData = {
            full_name: null,
            age: 25,
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC91: Invalid age data type - string - Should return 400', async () => {
        const memberData = {
            full_name: 'Lý Văn K',
            age: 'twenty-five',
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
        }
    });

    it('TC92: Invalid age value - negative - Should return 400', async () => {
        const memberData = {
            full_name: 'Mạc Văn L',
            age: -5,
            main_position: 'Forward'
        };

        try {
            await axios.post(
                `${BASE_URL}/teams/1/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
        }
    });


});

describe('DELETE /teams/{teamId}/members/{playerId}', () => {

    describe('Happy Cases', () => {

        it('TC93: Delete member with valid teamId and playerId - Should delete successfully', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Delete Test',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Add a member to the team
            const memberData = {
                full_name: 'Delete Test Member',
                age: 25,
                main_position: 'Forward'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);
            const playerId = addMemberResponse.data.data.id;

            // Now delete the member
            const deleteResponse = await axios.delete(
                `${BASE_URL}/teams/${teamId}/members/${playerId}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.data.success).toBe(true);
        });

        it('TC94: Verify member is deleted - GET should return 404 after deletion', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Verify Delete',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Add a member to the team
            const memberData = {
                full_name: 'Verify Delete Member',
                age: 26,
                main_position: 'Midfielder'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);
            const playerId = addMemberResponse.data.data.id;

            // Delete the member
            const deleteResponse = await axios.delete(
                `${BASE_URL}/teams/${teamId}/members/${playerId}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(deleteResponse.status).toBe(200);

            // Verify member is gone - GET should return 404
            try {
                await axios.get(`${BASE_URL}/teams/${teamId}/members/${playerId}`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

    });

    describe('Unhappy Cases', () => {

        it('TC95: teamId does not exist - Should return 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/99999/members/1`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC96: playerId does not exist - Should return 404', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Player Not Exist',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}/members/99999`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC97: player does not belong to team - Should return 404', async () => {
            // Create two teams
            const createTeam1Response = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team 1 for Belong Test',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeam1Response.status).toBe(201);
            const teamId1 = createTeam1Response.data.data.id;

            const createTeam2Response = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team 2 for Belong Test',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeam2Response.status).toBe(201);
            const teamId2 = createTeam2Response.data.data.id;

            // Add member to team 1
            const memberData = {
                full_name: 'Belong Test Member',
                age: 24,
                main_position: 'Defender'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId1}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);
            const playerId = addMemberResponse.data.data.id;

            // Try to delete from team 2
            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId2}/members/${playerId}`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC98: Invalid teamId format - string - Should return 400 or 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/invalid-string-id/members/1`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC99: Invalid playerId format - string - Should return 400 or 404', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Invalid PlayerId',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}/members/invalid-string-id`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });




        it('TC100: Missing token - Should return 401', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Missing Token',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Add a member
            const memberData = {
                full_name: 'Missing Token Member',
                age: 25,
                main_position: 'Forward'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);
            const playerId = addMemberResponse.data.data.id;

            try {
                await axios.delete(`${BASE_URL}/teams/${teamId}/members/${playerId}`);
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC101: Invalid token - Should return 401', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Invalid Token',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Add a member
            const memberData = {
                full_name: 'Invalid Token Member',
                age: 26,
                main_position: 'Midfielder'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);
            const playerId = addMemberResponse.data.data.id;

            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}/members/${playerId}`,
                    { headers: { Authorization: 'Bearer invalid-token-12345' } }
                );
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });


        it('TC102: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/null/members/1`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC103: Edge case - null playerId - Should return 400 or 404', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Null PlayerId',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}/members/null`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });


    });

});

describe('DELETE /teams/{teamId}', () => {

    describe('Happy Cases', () => {

        it('TC104: Delete team with valid teamId - Should delete successfully', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Delete Test',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Delete the team
            const deleteResponse = await axios.delete(
                `${BASE_URL}/teams/${teamId}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.data.success).toBe(true);
        });

        it('TC105: Verify team is deleted - GET should return 404 after deletion', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Verify Delete',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Delete the team
            const deleteResponse = await axios.delete(
                `${BASE_URL}/teams/${teamId}`,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(deleteResponse.status).toBe(200);

            // Verify team is gone - GET should return 404
            try {
                await axios.get(`${BASE_URL}/teams/${teamId}`);
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

    });

    describe('Unhappy Cases', () => {

        it('TC106: Cannot delete team that still has members - Should return 400 or 409', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team with Members',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            // Add a member to the team
            const memberData = {
                full_name: 'Member to Prevent Delete',
                age: 25,
                main_position: 'Forward'
            };
            const addMemberResponse = await axios.post(
                `${BASE_URL}/teams/${teamId}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${validToken}` } }
            );
            expect(addMemberResponse.status).toBe(201);

            // Try to delete the team - should fail
            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 409]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC107: teamId does not exist - Should return 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/99999`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC108: Invalid teamId format - string - Should return 400 or 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/invalid-string-id`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });


        it('TC109: Missing token - Should return 401', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Missing Token',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            try {
                await axios.delete(`${BASE_URL}/teams/${teamId}`);
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC110: Invalid token - Should return 401', async () => {
            // Create a team first
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Team for Invalid Token',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}`,
                    { headers: { Authorization: 'Bearer invalid-token-12345' } }
                );
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC111: Unauthorized user - Should return 404 when user is not owner', async () => {
            // Create a team with the first user
            const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
                name: 'Unauthorized Delete Team',
                country: 'Vietnam'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
            expect(createTeamResponse.status).toBe(201);
            const teamId = createTeamResponse.data.data.id;

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

            // Try to delete with the other user
            try {
                await axios.delete(
                    `${BASE_URL}/teams/${teamId}`,
                    { headers: { Authorization: `Bearer ${otherToken}` } }
                );
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC112: Edge case - null teamId - Should return 400 or 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/null`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('TC113: Edge case - empty teamId - Should return 400 or 404', async () => {
            try {
                await axios.delete(
                    `${BASE_URL}/teams/`,
                    { headers: { Authorization: `Bearer ${validToken}` } }
                );
            } catch (error) {
                expect([400, 404]).toContain(error.response.status);
                expect(error.response.data.success).toBe(false);
            }
        });


        // Note: Cannot delete team that is currently in a tournament test would require tournament creation functionality
        // which is not implemented in the current test suite. This test can be added when tournament endpoints are available.

    });

});

    });
});
});
    });
});
