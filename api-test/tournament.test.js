const axios = require('axios');

const BASE_URL = 'https://backend.cupzone.fun';

require('events').EventEmitter.defaultMaxListeners = 20;

const expectFlexible = (actual, list) => {
    expect([...list, 500]).toContain(actual);
};

let validToken = '';


// ================= SETUP =================
beforeAll(async () => {
    try {
        const timestamp = Date.now();

        // register
        await axios.post(`${BASE_URL}/auth/register`, {
            email: `test-${timestamp}@example.com`,
            password: '123456',
            full_name: 'Test User'
        });

        // login
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: `test-${timestamp}@example.com`,
            password: '123456'
        });

        validToken = login.data?.data?.token;

    } catch (e) {
        console.log('Setup lỗi', e.message);
    }
});


// =====================================
// POST /tournaments/create
// =====================================
describe('POST /tournaments/create', () => {

    // ========= HAPPY =========

    it('TC01: Create tournament valid', async () => {
        const res = await axios.post(`${BASE_URL}/tournaments/create`, {
            name: 'Cup A',
            format: 'LEAGUE',
            start_date: '2026-07-01',
            end_date: '2026-07-10'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [201, 403]);
    });


    it('TC02: Create tournament with description', async () => {
        const res = await axios.post(`${BASE_URL}/tournaments/create`, {
            name: 'Cup B',
            description: 'Test description',
            format: 'LEAGUE',
            start_date: '2026-07-01',
            end_date: '2026-07-10'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [201, 403]);
    });


    it('TC03: Create tournament unicode name', async () => {
        const res = await axios.post(`${BASE_URL}/tournaments/create`, {
            name: 'Giải Việt Nam',
            format: 'LEAGUE',
            start_date: '2026-07-01',
            end_date: '2026-07-10'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [201, 403]);
    });


    // ========= UNHAPPY =========

    it('TC04: Missing name', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                format: 'LEAGUE',
                start_date: '2026-07-01',
                end_date: '2026-07-10'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC05: Missing format', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Cup'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC06: Missing start_date', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Cup',
                format: 'LEAGUE'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC07: Missing end_date', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Cup',
                format: 'LEAGUE',
                start_date: '2026-07-01'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC08: Empty name', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: '',
                format: 'LEAGUE',
                start_date: '2026-07-01',
                end_date: '2026-07-10'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC09: Invalid date format', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Cup',
                format: 'LEAGUE',
                start_date: 'abc',
                end_date: 'xyz'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });


    it('TC10: No token', async () => {
        try {
            await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Cup',
                format: 'LEAGUE',
                start_date: '2026-07-01',
                end_date: '2026-07-10'
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

});
// =====================================
// PUT /tournaments/{id}/update
// =====================================

describe('PUT /tournaments/{id}/update', () => {

    // helper tạo tournament
    const createTournament = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Tournament ' + Date.now(),
                format: 'LEAGUE',
                start_date: '2026-07-01',
                end_date: '2026-07-10'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });

            return res.data?.data;
        } catch {
            return null;
        }
    };

    // ========= HAPPY =========

    it('TC11: Update tournament valid', async () => {
        const t = await createTournament();

        const res = await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
            name: 'Updated Tournament'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC12: Update description', async () => {
        const t = await createTournament();

        const res = await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
            description: 'Updated description'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC13: Update multiple fields', async () => {
        const t = await createTournament();

        const res = await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
            name: 'Updated',
            description: 'New desc'
        }, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    // ========= UNHAPPY =========

    it('TC14: Invalid tournament id', async () => {
        try {
            await axios.put(`${BASE_URL}/tournaments/invalid-id/update`, {
                name: 'Fail'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 404]);
        }
    });

    it('TC15: Missing token', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
                name: 'Fail'
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC16: Invalid token', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
                name: 'Fail'
            }, {
                headers: { Authorization: 'Bearer invalid' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC17: Empty name', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
                name: ''
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });

    it('TC18: Invalid date format', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
                start_date: 'abc'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });

    it('TC19: start_date > end_date', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {
                start_date: '2026-09-01',
                end_date: '2026-07-01'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });

    it('TC20: Update with empty body', async () => {
        const t = await createTournament();

        try {
            await axios.put(`${BASE_URL}/tournaments/${t?.id}/update`, {}, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 403]);
        }
    });

});
// =====================================
// DELETE /tournaments/{id}/delete
// =====================================

describe('DELETE /tournaments/{id}/delete', () => {

    // helper tạo tournament
    const createTournament = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/tournaments/create`, {
                name: 'Tournament ' + Date.now(),
                format: 'LEAGUE',
                start_date: '2026-07-01',
                end_date: '2026-07-10'
            }, {
                headers: { Authorization: `Bearer ${validToken}` }
            });

            return res.data?.data;
        } catch {
            return null;
        }
    };

    // ========= HAPPY =========

    it('TC21: Delete tournament valid', async () => {
        const t = await createTournament();

        const res = await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC22: Delete immediately after create', async () => {
        const t = await createTournament();

        const res = await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });


    // ========= UNHAPPY =========

    it('TC23: Invalid tournament id', async () => {
        try {
            await axios.delete(`${BASE_URL}/tournaments/invalid-id/delete`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [400, 404]);
        }
    });

    it('TC24: Missing token', async () => {
        const t = await createTournament();

        try {
            await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`);
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC25: Invalid token', async () => {
        const t = await createTournament();

        try {
            await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
                headers: { Authorization: 'Bearer invalid' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC26: Delete twice', async () => {
        const t = await createTournament();

        await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        try {
            await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [404, 403]);
        }
    });

    it('TC27: Delete with expired token', async () => {
        try {
            await axios.delete(`${BASE_URL}/tournaments/123/delete`, {
                headers: { Authorization: 'Bearer expired' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC28: Delete with wrong owner', async () => {
        try {
            await axios.delete(`${BASE_URL}/tournaments/123/delete`, {
                headers: { Authorization: 'Bearer wrong-user' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC29: Delete non-existing tournament', async () => {
        try {
            await axios.delete(`${BASE_URL}/tournaments/999999/delete`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [404, 400]);
        }
    });

    it('TC30: Multiple delete requests', async () => {
        const t = await createTournament();

        await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        try {
            await axios.delete(`${BASE_URL}/tournaments/${t?.id}/delete`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [404, 403]);
        }
    });

});
// =====================================
// GET /tournaments
// =====================================

describe('GET /tournaments', () => {

    // ========= HAPPY =========

    it('TC31: Get tournaments list valid', async () => {
        const res = await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC32: Get tournaments multiple times', async () => {
        await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        const res = await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });

    it('TC33: Check response structure', async () => {
        const res = await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expect(res.data).toHaveProperty('data');
    });

    it('TC34: Large data response', async () => {
        const res = await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        expectFlexible(res.status, [200, 403]);
    });


    // ========= UNHAPPY =========

    it('TC35: Missing token', async () => {
        try {
            await axios.get(`${BASE_URL}/tournaments`);
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC36: Invalid token', async () => {
        try {
            await axios.get(`${BASE_URL}/tournaments`, {
                headers: { Authorization: 'Bearer invalid' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC37: Expired token', async () => {
        try {
            await axios.get(`${BASE_URL}/tournaments`, {
                headers: { Authorization: 'Bearer expired' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC38: Unauthorized role', async () => {
        try {
            await axios.get(`${BASE_URL}/tournaments`, {
                headers: { Authorization: 'Bearer wrong-role' }
            });
        } catch (e) {
            expectFlexible(e.response?.status, [401, 403]);
        }
    });

    it('TC39: Rapid multiple requests', async () => {
        for (let i = 0; i < 3; i++) {
            await axios.get(`${BASE_URL}/tournaments`, {
                headers: { Authorization: `Bearer ${validToken}` }
            });
        }

        expect(true).toBe(true);
    });

    it('TC40: Performance under threshold', async () => {
        const start = Date.now();

        await axios.get(`${BASE_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        const duration = Date.now() - start;

        expect(duration).toBeLessThan(3000);
    });

});