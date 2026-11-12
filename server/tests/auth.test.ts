import request from 'supertest';
import { app } from '../src/app';
import { sequelize } from '../src/config/database';
import { User } from '../src/db/models';

describe('Auth & RBAC Endpoints', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // Clean up any test user created during tests
    await User.destroy({
      where: { email: 'newcustomer@test.com' },
      force: true,
    });
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 with fields map when input is invalid', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: '123', // too short, no letters
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.fields).toHaveProperty('email');
      expect(res.body.error.fields).toHaveProperty('password');
    });

    it('should successfully register a customer, set httpOnly cookie, and return 201', async () => {
      // Ensure user doesn't already exist from previous run
      await User.destroy({
        where: { email: 'newcustomer@test.com' },
        force: true,
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'newcustomer@test.com',
        password: 'SecurePassword123!',
        fullName: 'Test Customer',
        phone: '+1 555 123 4567',
        shippingAddress: '123 Test St, City, ST 12345',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('newcustomer@test.com');
      expect(res.body.data.role).toBe('customer');
      expect(res.body.data.profile.fullName).toBe('Test Customer');
      expect(res.body.data).not.toHaveProperty('passwordHash');

      // Verify httpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should return 400 when attempting to register an already existing email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'newcustomer@test.com',
        password: 'SecurePassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 when password is wrong', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@ecomm.dev',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid email or password/i);
    });

    it('should login seeded admin and set httpOnly cookie', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@ecomm.dev',
        password: 'AdminPass123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@ecomm.dev');
      expect(res.body.data.role).toBe('admin');
      expect(res.body.data).not.toHaveProperty('passwordHash');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });
  });

  describe('GET /api/auth/me & Session Verification', () => {
    it('should return 401 when unauthenticated (no cookie)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });

    it('should return current user when authenticated via httpOnly cookie', async () => {
      // Login first to get cookie
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@ecomm.dev',
        password: 'CustomerPass123!',
      });

      const cookie = loginRes.headers['set-cookie'];

      const meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe('customer@ecomm.dev');
      expect(meRes.body.data.profile.fullName).toBe('Jane Elizabeth Doe');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should return 403 Forbidden when a customer accesses an admin-only endpoint', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@ecomm.dev',
        password: 'CustomerPass123!',
      });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app).get('/api/auth/admin-check').set('Cookie', cookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Access forbidden/i);
    });

    it('should allow access to admin-only endpoint when user is admin', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@ecomm.dev',
        password: 'AdminPass123!',
      });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app).get('/api/auth/admin-check').set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Admin access granted');
    });
  });

  describe('PUT /api/auth/me (Profile Update)', () => {
    it('should update profile fields for the authenticated user', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@ecomm.dev',
        password: 'CustomerPass123!',
      });

      const cookie = loginRes.headers['set-cookie'];

      const updateRes = await request(app).put('/api/auth/me').set('Cookie', cookie).send({
        phone: '+1 (555) 999-8888',
        shippingAddress: '999 Updated Lane, Portland, OR 97201',
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.phone).toBe('+1 (555) 999-8888');
      expect(updateRes.body.data.shippingAddress).toBe('999 Updated Lane, Portland, OR 97201');

      // Re-fetch via GET /api/auth/me to verify persistence
      const verifyRes = await request(app).get('/api/auth/me').set('Cookie', cookie);

      expect(verifyRes.body.data.profile.phone).toBe('+1 (555) 999-8888');
      expect(verifyRes.body.data.profile.shippingAddress).toBe(
        '999 Updated Lane, Portland, OR 97201'
      );
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the token cookie', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Cleared cookie has empty value or expired date
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
