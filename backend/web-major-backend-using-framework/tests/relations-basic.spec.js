import supertest from 'supertest';
import fastify from '../index.js';
import { jest } from '@jest/globals';

jest.setTimeout(30000);

describe('Relations API - Basic Route Tests', () => {
  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Route Registration Tests', () => {
    test('should have friends routes registered', () => {
      const routes = fastify.printRoutes();
      // Check that the friends section exists
      expect(routes).toContain('friends/');
      expect(routes).toContain('status/');
      expect(routes).toContain('accept/');
    });
  });

  describe('Error Handling Tests', () => {
    test('should return 400 for invalid user ID in friends list', async () => {
      const response = await supertest(fastify.server)
        .get('/api/friends/friends/invalid')
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in pending requests', async () => {
      const response = await supertest(fastify.server)
        .get('/api/friends/requests/pending/invalid')
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in sent requests', async () => {
      const response = await supertest(fastify.server)
        .get('/api/friends/requests/sent/invalid')
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in friend request', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/request/invalid')
        .send({ targetUserId: 2 })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in accept request', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/accept/invalid')
        .send({ requesterId: 2 })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in reject request', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/reject/invalid')
        .send({ requesterId: 2 })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in remove friend', async () => {
      const response = await supertest(fastify.server)
        .delete('/api/friends/invalid')
        .send({ friendId: 2 })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in update status', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/status/invalid')
        .send({ isOnline: true })
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should return 400 for invalid user ID in get status', async () => {
      const response = await supertest(fastify.server)
        .get('/api/friends/status/invalid')
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });
  });

  describe('Non-existent User Tests', () => {
    test('should return 500 for non-existent user in get status (database not initialized)', async () => {
      const response = await supertest(fastify.server)
        .get('/api/friends/status/999')
        .expect(500);
      
      expect(response.body.error).toBe('Internal server error');
    });

    test('should return 500 for non-existent user in friend request (database not initialized)', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/request/1')
        .send({ targetUserId: 999 })
        .expect(500);
      
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Self-friend Request Test', () => {
    test('should return 400 when trying to add self as friend', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/request/1')
        .send({ targetUserId: 1 })
        .expect(400);
      
      expect(response.body.error).toBe('Cannot send friend request to yourself');
    });
  });

  describe('Request Body Validation Tests', () => {
    test('should handle missing targetUserId in friend request', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/request/1')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should handle missing requesterId in accept request', async () => {
      const response = await supertest(fastify.server)
        .post('/api/friends/accept/1')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should handle missing friendId in remove friend', async () => {
      const response = await supertest(fastify.server)
        .delete('/api/friends/1')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Invalid user ID');
    });
  });
});
