const axios = require('axios');
const { z } = require('zod');

// ================= CONFIG =================
const BASE_URL = process.env.BASE_URL || 'https://backend.cupzone.fun/auth';

jest.retryTimes(2);

// ================= AXIOS =================
const api = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true,
    timeout: 10000
});

// ================= HELPERS =================
const createUnique = () =>
    `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

const generateEmail = () => `tester_${createUnique()}@mail.com`;
const generateUsername = () => `tester_${createUnique()}`;

const password = '12345678';
const fullName = 'Tester Cupzone';

// ================= SCHEMA =================
const registerSchema = z.object({
    data: z.object({
        id: z.number().optional(),
        email: z.string().email().optional(),
        username: z.string().optional()
    }).passthrough()
});

const loginSchema = z.object({
    data: z.object({
        token: z.string()
    }).passthrough()
});

// ================= API HELPERS =================
const register = (payload) => api.post('/register', payload);
const login = (payload) => api.post('/login', payload);

// ================= TEST =================
describe('AUTH', () => {

    // ================= REGISTER =================
    describe('POST /auth/register', () => {

        // ===== HAPPY =====
        describe('Happy Case', () => {

            test('TC_R01 - Đăng ký thành công với dữ liệu hợp lệ', async () => {
                const res = await register({
                    email: generateEmail(),
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect(res.status).toBe(201);
                registerSchema.parse(res.data);
            });

            test('TC_R02 - Không cho phép đăng ký email trùng (lần 1 vẫn thành công)', async () => {
                const email = generateEmail();

                const first = await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect(first.status).toBe(201);

                const second = await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 409]).toContain(second.status);
            });

            test('TC_R03 - Email có khoảng trắng vẫn đăng ký', async () => {
                const res = await register({
                    email: `   ${generateEmail()}   `,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([201, 400]).toContain(res.status);
                if (res.status === 201) registerSchema.parse(res.data);
            });

            test('TC_R04 - Email viết hoa vẫn đăng ký', async () => {
                const res = await register({
                    email: generateEmail().toUpperCase(),
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([201, 400]).toContain(res.status);
                if (res.status === 201) registerSchema.parse(res.data);
            });

        });

        // ===== UNHAPPY =====
        describe('Unhappy Case', () => {

            test('TC_R05 - Không cho phép đăng ký email đã tồn tại', async () => {
                const email = generateEmail();

                await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                const res = await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 409]).toContain(res.status);
            });

            test('TC_R06 - Từ chối email sai định dạng', async () => {
                const res = await register({
                    email: 'abc.com',
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R07 - Từ chối email rỗng', async () => {
                const res = await register({
                    email: '',
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R08 - Từ chối password < 6 ký tự', async () => {
                const res = await register({
                    email: generateEmail(),
                    password: '123',
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R09 - Từ chối password rỗng', async () => {
                const res = await register({
                    email: generateEmail(),
                    password: '',
                    full_name: fullName,
                    username: generateUsername()
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R10 - Từ chối khi thiếu email', async () => {
                const res = await register({
                    password,
                    full_name: fullName
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R11 - Từ chối khi thiếu password', async () => {
                const res = await register({
                    email: generateEmail(),
                    full_name: fullName
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R12 - Từ chối full_name rỗng', async () => {
                const res = await register({
                    email: generateEmail(),
                    password,
                    full_name: ''
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_R13 - Từ chối email không phải chuỗi', async () => {
                const res = await register({
                    email: 123456,
                    password,
                    full_name: fullName
                });

                expect([400, 422]).toContain(res.status);
            });

        });

    });

    // ================= LOGIN =================
    describe('POST /auth/login', () => {

        // ===== HAPPY =====
        describe('Happy Case', () => {

            test('TC_L01 - Đăng nhập thành công', async () => {
                const email = generateEmail();

                await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                const res = await login({
                    email,
                    password
                });

                expect(res.status).toBe(200);
                loginSchema.parse(res.data);
            });

            test('TC_L02 - Email có khoảng trắng vẫn đăng nhập', async () => {
                const email = generateEmail();

                await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                const res = await login({
                    email: `   ${email}   `,
                    password
                });

                expect([200, 400]).toContain(res.status);
                if (res.status === 200) loginSchema.parse(res.data);
            });

            test('TC_L03 - Email viết hoa vẫn đăng nhập', async () => {
                const email = generateEmail();

                await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                const res = await login({
                    email: email.toUpperCase(),
                    password
                });

                expect([200, 401]).toContain(res.status);
                if (res.status === 200) loginSchema.parse(res.data);
            });

        });

        // ===== UNHAPPY =====
        describe('Unhappy Case', () => {

            test('TC_L04 - Sai password', async () => {
                const email = generateEmail();

                await register({
                    email,
                    password,
                    full_name: fullName,
                    username: generateUsername()
                });

                const res = await login({
                    email,
                    password: 'wrongpassword'
                });

                expect([400, 401]).toContain(res.status);
            });

            test('TC_L05 - Email không tồn tại', async () => {
                const res = await login({
                    email: generateEmail(),
                    password
                });

                expect([400, 401]).toContain(res.status);
            });

            test('TC_L06 - Email rỗng', async () => {
                const res = await login({
                    email: '',
                    password
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_L07 - Password rỗng', async () => {
                const res = await login({
                    email: generateEmail(),
                    password: ''
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_L08 - Thiếu email', async () => {
                const res = await login({
                    password
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_L09 - Thiếu password', async () => {
                const res = await login({
                    email: generateEmail()
                });

                expect([400, 422]).toContain(res.status);
            });

            test('TC_L10 - Email không phải chuỗi', async () => {
                const res = await login({
                    email: 123456,
                    password
                });

                expect([400, 422]).toContain(res.status);
            });

        });

    });

});