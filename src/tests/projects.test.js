const request = require('supertest');
const app = require('../app');
const { prisma, cleanupDatabase } = require('./setup');
const { generateToken } = require('../utils/jwt');

describe('Project Endpoints', () => {
  let token;
  let user;

  beforeEach(async () => {
    // Clean up first
    await cleanupDatabase();

    // Create test user
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword'
      }
    });

    token = generateToken({ id: user.id, email: user.email, role: 'USER' });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Community Library',
          description: 'A new public library for the community'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
    }, 15000); // Increase timeout for this test
  });

  describe('GET /api/projects', () => {
    it('should list projects', async () => {
      await prisma.project.create({
        data: {
          title: 'Test Project',
          description: 'Test Description',
          proposer_id: user.id
        }
      });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeInstanceOf(Array);
    }, 15000); // Increase timeout for this test
  });
});