const request = require('supertest');
const app = require('../app');
const { prisma, cleanupDatabase } = require('./setup');
const bcrypt = require('bcryptjs');

describe('Auth Endpoints', () => {
  // Clean up before each test
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 409 if email already exists', async () => {
      // Create user first
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password_hash: await bcrypt.hash('Test123456', 10)
        }
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'newuser',
          password: 'Test123456'
        })
        .expect(409);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('email');
    });

    it('should return 409 if username already exists', async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password_hash: await bcrypt.hash('Test123456', 10)
        }
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newemail@example.com',
          username: 'testuser',
          password: 'Test123456'
        })
        .expect(409);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('username');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: '',
          password: '123' // Too short
        })
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password_hash: await bcrypt.hash('Test123456', 10)
        }
      });
    });

    it('should login user with email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456'
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Test123456'
        })
        .expect(401);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        })
        .expect(400);

      expect(res.body.status).toBe('error');
    });
  });
});