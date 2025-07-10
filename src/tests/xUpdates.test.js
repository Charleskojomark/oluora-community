const request = require('supertest');
const app = require('../app');
const { prisma, cleanupDatabase } = require('./setup');

describe('X Updates Endpoints', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/x-updates', () => {
    it('should fetch X updates', async () => {
      await prisma.xUpdate.create({
        data: {
          post_id: '12345',
          content: 'Test update #AbiaState',
          author: 'testuser',
          posted_at: new Date(),
          fetched_at: new Date()
        }
      });

      const res = await request(app)
        .get('/api/x-updates');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeInstanceOf(Array);
    }, 15000); // Increase timeout for this test
  });
});