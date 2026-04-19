const request = require('supertest');
const app = require('../src/app');

describe('Auth API Integration Tests', () => {
    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const timestamp = Date.now();
            const userData = {
                email: `testuser${timestamp}@example.com`,
                password: 'password123',
                full_name: 'Test User',
                phone: '1234567890',
                avatar_url: 'https://example.com/avatar.jpg'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Organizer registered successfully');
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.full_name).toBe(userData.full_name);
        });

        it('should return validation error for invalid email format', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                full_name: 'Test User'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email is invalid');
        });

        it('should return validation error for missing required fields', async () => {
            const userData = {
                email: 'test@example.com'
                // missing password and full_name
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Password is required');
        });

        it('should return error for duplicate email', async () => {
            const timestamp = Date.now();
            const userData = {
                email: `duplicate${timestamp}@example.com`,
                password: 'password123',
                full_name: 'Duplicate User'
            };

            // Register first time
            await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            // Try to register again
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already exists');
        });

        it('should handle optional phone and avatar_url fields', async () => {
            const timestamp = Date.now();
            const userData = {
                email: `optional${timestamp}@example.com`,
                password: 'password123',
                full_name: 'Optional User'
                // phone and avatar_url are optional
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.phone).toBe('');
            expect(response.body.data.user.avatar_url).toBe('');
        });
    });

    describe('POST /auth/login', () => {
        let testEmail;

        beforeAll(async () => {
            const timestamp = Date.now();
            testEmail = `loginuser${timestamp}@example.com`;
            const userData = {
                email: testEmail,
                password: 'password123',
                full_name: 'Login User'
            };

            await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);
        });

        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: testEmail,
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe(testEmail);
        });

        it('should return error for non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email hoặc mật khẩu không chính xác');
        });

        it('should return error for wrong password', async () => {
            const loginData = {
                email: testEmail,
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email hoặc mật khẩu không chính xác');
        });

        it('should return validation error for missing email', async () => {
            const loginData = {
                password: 'password123'
                // missing email
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email is required');
        });

        it('should return validation error for missing password', async () => {
            const loginData = {
                email: testEmail
                // missing password
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Password is required');
        });
    });
});