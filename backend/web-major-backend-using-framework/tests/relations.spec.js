import supertest from 'supertest';
import AuthUtils from '../src/utils/auth.js';
import fastify from '../index.js';
import { jest } from '@jest/globals';

// Set longer timeout for database operations
jest.setTimeout(60000);

// Test data
const testUsers = [
	{
		username: 'Alice',
		nickname: 'alice_user',
		email: 'alice@example.com',
		password: 'AlicePassword123!'
	},
	{
		username: 'Bob',
		nickname: 'bob_user',
		email: 'bob@example.com',
		password: 'BobPassword123!'
	},
	{
		username: 'Charlie',
		nickname: 'charlie_user',
		email: 'charlie@example.com',
		password: 'CharliePassword123!'
	}
];

beforeAll(async () => {
	await fastify.ready();
});

beforeEach(async () => {
	try {
		// Clean up database before each test
		await AuthUtils.deleteAuthTable(fastify.db);
		
		// Clean up relations tables
		await fastify.db.exec('DELETE FROM friend_requests');
		await fastify.db.exec('DELETE FROM friends');
		await fastify.db.exec('DELETE FROM user_status');
		
		// Reset auto-increment
		await fastify.db.exec('DELETE FROM sqlite_sequence WHERE name IN ("friend_requests", "friends", "user_status")');
	} catch (error) {
		console.warn('Database cleanup warning:', error.message);
	}
});

afterAll(async () => {
	await fastify.close();
});

describe('Relations API Tests - Friends and User Status', () => {
	
	// Helper function to create test users
	async function createTestUsers() {
		const userIds = [];
		for (const user of testUsers) {
			await supertest(fastify.server)
				.post('/api/auth/users/register')
				.send(user)
				.expect(201);
			userIds.push(userIds.length + 1);
		}
		return userIds;
	}

	describe('GET /api/friends/friends/:userId - Get Friends List', () => {
		test('should return empty friends list for new user', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.get('/api/friends/friends/1')
				.expect(200);
			
			expect(response.body.message).toBe('Friends list retrieved successfully');
			expect(response.body.friends).toEqual([]);
		});

		test('should return friends list with online status', async () => {
			await createTestUsers();
			
			// Create friendship between user 1 and 2
			await fastify.dbQueries.relations.sendFriendRequest(1, 2);
			await fastify.dbQueries.relations.acceptFriendRequest(1, 2);
			
			// Set user 2 as online
			await fastify.dbQueries.relations.updateUserStatus(2, true, 'Playing a game');
			
			const response = await supertest(fastify.server)
				.get('/api/friends/friends/1')
				.expect(200);
			
			expect(response.body.friends).toHaveLength(1);
			expect(response.body.friends[0].friend_id).toBe(2);
			expect(response.body.friends[0].username).toBe('Bob');
			expect(response.body.friends[0].is_online).toBe(true);
			expect(response.body.friends[0].status_message).toBe('Playing a game');
		});

		test('should return 400 for invalid user ID', async () => {
			const response = await supertest(fastify.server)
				.get('/api/friends/friends/invalid')
				.expect(400);
			
			expect(response.body.error).toBe('Invalid user ID');
		});
	});

	describe('GET /api/friends/requests/pending/:userId - Get Pending Friend Requests', () => {
		test('should return empty pending requests for new user', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.get('/api/friends/requests/pending/1')
				.expect(200);
			
			expect(response.body.message).toBe('Pending friend requests retrieved successfully');
			expect(response.body.requests).toEqual([]);
		});

		test('should return pending friend requests', async () => {
			await createTestUsers();
			
			// Send friend request from user 2 to user 1
			await fastify.dbQueries.relations.sendFriendRequest(2, 1);
			
			const response = await supertest(fastify.server)
				.get('/api/friends/requests/pending/1')
				.expect(200);
			
			expect(response.body.requests).toHaveLength(1);
			expect(response.body.requests[0].requester_id).toBe(2);
			expect(response.body.requests[0].username).toBe('Bob');
		});

		test('should return 400 for invalid user ID', async () => {
			const response = await supertest(fastify.server)
				.get('/api/friends/requests/pending/invalid')
				.expect(400);
			
			expect(response.body.error).toBe('Invalid user ID');
		});
	});

	describe('GET /api/friends/requests/sent/:userId - Get Sent Friend Requests', () => {
		test('should return empty sent requests for new user', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.get('/api/friends/requests/sent/1')
				.expect(200);
			
			expect(response.body.message).toBe('Sent friend requests retrieved successfully');
			expect(response.body.requests).toEqual([]);
		});

		test('should return sent friend requests', async () => {
			await createTestUsers();
			
			// Send friend request from user 1 to user 2
			await fastify.dbQueries.relations.sendFriendRequest(1, 2);
			
			const response = await supertest(fastify.server)
				.get('/api/friends/requests/sent/1')
				.expect(200);
			
			expect(response.body.requests).toHaveLength(1);
			expect(response.body.requests[0].addressee_id).toBe(2);
			expect(response.body.requests[0].username).toBe('Bob');
			expect(response.body.requests[0].status).toBe('pending');
		});
	});

	describe('POST /api/friends/request/:userId - Send Friend Request', () => {
		test('should send friend request successfully', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 2 })
				.expect(201);
			
			expect(response.body.message).toBe('Friend request sent successfully');
		});

		test('should return 400 when trying to add self as friend', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 1 })
				.expect(400);
			
			expect(response.body.error).toBe('Cannot send friend request to yourself');
		});

		test('should return 404 for non-existent user', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 999 })
				.expect(404);
			
			expect(response.body.error).toBe('User not found');
		});

		test('should return 409 when request already sent', async () => {
			await createTestUsers();
			
			// Send first request
			await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 2 })
				.expect(201);
			
			// Try to send again
			const response = await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 2 })
				.expect(409);
			
			expect(response.body.error).toBe('Friend request already sent');
		});

		test('should return 400 for invalid user ID', async () => {
			const response = await supertest(fastify.server)
				.post('/api/friends/request/invalid')
				.send({ targetUserId: 2 })
				.expect(400);
			
			expect(response.body.error).toBe('Invalid user ID');
		});
	});

	describe('POST /api/friends/accept/:userId - Accept Friend Request', () => {
		test('should accept friend request successfully', async () => {
			await createTestUsers();
			
			// Send friend request first
			await fastify.dbQueries.relations.sendFriendRequest(2, 1);
			
			const response = await supertest(fastify.server)
				.post('/api/friends/accept/1')
				.send({ requesterId: 2 })
				.expect(200);
			
			expect(response.body.message).toBe('Friend request accepted successfully');
			
			// Verify friendship was created
			const friends = await fastify.dbQueries.relations.getFriendsList(1);
			expect(friends).toHaveLength(1);
			expect(friends[0].friend_id).toBe(2);
		});

		test('should return 404 for non-existent request', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/accept/1')
				.send({ requesterId: 2 })
				.expect(404);
			
			expect(response.body.error).toBe('Friend request not found');
		});

		test('should return 400 for invalid request status', async () => {
			await createTestUsers();
			
			// Send and reject request first
			await fastify.dbQueries.relations.sendFriendRequest(2, 1);
			await fastify.dbQueries.relations.rejectFriendRequest(2, 1);
			
			const response = await supertest(fastify.server)
				.post('/api/friends/accept/1')
				.send({ requesterId: 2 })
				.expect(400);
			
			expect(response.body.error).toBe('Invalid request status');
		});
	});

	describe('POST /api/friends/reject/:userId - Reject Friend Request', () => {
		test('should reject friend request successfully', async () => {
			await createTestUsers();
			
			// Send friend request first
			await fastify.dbQueries.relations.sendFriendRequest(2, 1);
			
			const response = await supertest(fastify.server)
				.post('/api/friends/reject/1')
				.send({ requesterId: 2 })
				.expect(200);
			
			expect(response.body.message).toBe('Friend request rejected successfully');
		});

		test('should return 404 for non-existent request', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/reject/1')
				.send({ requesterId: 2 })
				.expect(404);
			
			expect(response.body.error).toBe('Friend request not found');
		});
	});

	describe('DELETE /api/friends/:userId - Remove Friend', () => {
		test('should remove friend successfully', async () => {
			await createTestUsers();
			
			// Create friendship first
			await fastify.dbQueries.relations.sendFriendRequest(1, 2);
			await fastify.dbQueries.relations.acceptFriendRequest(1, 2);
			
			const response = await supertest(fastify.server)
				.delete('/api/friends/1')
				.send({ friendId: 2 })
				.expect(200);
			
			expect(response.body.message).toBe('Friend removed successfully');
			
			// Verify friendship was removed
			const friends = await fastify.dbQueries.relations.getFriendsList(1);
			expect(friends).toHaveLength(0);
		});

		test('should return 404 when users are not friends', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.delete('/api/friends/1')
				.send({ friendId: 2 })
				.expect(404);
			
			expect(response.body.error).toBe('Users are not friends');
		});
	});

	describe('POST /api/friends/status/:userId - Update User Status', () => {
		test('should update user online status successfully', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.post('/api/friends/status/1')
				.send({ 
					isOnline: true, 
					statusMessage: 'Playing a game' 
				})
				.expect(200);
			
			expect(response.body.message).toBe('User status updated successfully');
		});

		test('should update user offline status', async () => {
			await createTestUsers();
			
			// Set online first
			await fastify.dbQueries.relations.updateUserStatus(1, true, 'Online');
			
			const response = await supertest(fastify.server)
				.post('/api/friends/status/1')
				.send({ 
					isOnline: false, 
					statusMessage: 'Away' 
				})
				.expect(200);
			
			expect(response.body.message).toBe('User status updated successfully');
		});

		test('should return 400 for invalid user ID', async () => {
			const response = await supertest(fastify.server)
				.post('/api/friends/status/invalid')
				.send({ isOnline: true })
				.expect(400);
			
			expect(response.body.error).toBe('Invalid user ID');
		});
	});

	describe('GET /api/friends/status/:userId - Get User Status', () => {
		test('should get user status successfully', async () => {
			await createTestUsers();
			
			// Set user status first
			await fastify.dbQueries.relations.updateUserStatus(1, true, 'Playing a game');
			
			const response = await supertest(fastify.server)
				.get('/api/friends/status/1')
				.expect(200);
			
			expect(response.body.message).toBe('User status retrieved successfully');
			expect(response.body.user.id).toBe(1);
			expect(response.body.user.username).toBe('Alice');
			expect(response.body.user.is_online).toBe(true);
			expect(response.body.user.status_message).toBe('Playing a game');
		});

		test('should return default status for user without status', async () => {
			await createTestUsers();
			
			const response = await supertest(fastify.server)
				.get('/api/friends/status/1')
				.expect(200);
			
			expect(response.body.user.is_online).toBe(false);
			expect(response.body.user.last_seen).toBe(null);
			expect(response.body.user.status_message).toBe('');
		});

		test('should return 404 for non-existent user', async () => {
			const response = await supertest(fastify.server)
				.get('/api/friends/status/999')
				.expect(404);
			
			expect(response.body.error).toBe('User not found');
		});
	});

	describe('Complete Friend Request Flow', () => {
		test('should handle complete friend request workflow', async () => {
			await createTestUsers();
			
			// 1. User 1 sends friend request to User 2
			await supertest(fastify.server)
				.post('/api/friends/request/1')
				.send({ targetUserId: 2 })
				.expect(201);
			
			// 2. Check pending requests for User 2
			const pendingResponse = await supertest(fastify.server)
				.get('/api/friends/requests/pending/2')
				.expect(200);
			
			expect(pendingResponse.body.requests).toHaveLength(1);
			expect(pendingResponse.body.requests[0].requester_id).toBe(1);
			
			// 3. Check sent requests for User 1
			const sentResponse = await supertest(fastify.server)
				.get('/api/friends/requests/sent/1')
				.expect(200);
			
			expect(sentResponse.body.requests).toHaveLength(1);
			expect(sentResponse.body.requests[0].addressee_id).toBe(2);
			
			// 4. User 2 accepts the request
			await supertest(fastify.server)
				.post('/api/friends/accept/2')
				.send({ requesterId: 1 })
				.expect(200);
			
			// 5. Verify friendship exists
			const friendsResponse = await supertest(fastify.server)
				.get('/api/friends/friends/1')
				.expect(200);
			
			expect(friendsResponse.body.friends).toHaveLength(1);
			expect(friendsResponse.body.friends[0].friend_id).toBe(2);
			
			// 6. Set User 2 as online
			await supertest(fastify.server)
				.post('/api/friends/status/2')
				.send({ 
					isOnline: true, 
					statusMessage: 'Available for games' 
				})
				.expect(200);
			
			// 7. Check friends list shows online status
			const friendsWithStatusResponse = await supertest(fastify.server)
				.get('/api/friends/friends/1')
				.expect(200);
			
			expect(friendsWithStatusResponse.body.friends[0].is_online).toBe(true);
			expect(friendsWithStatusResponse.body.friends[0].status_message).toBe('Available for games');
			
			// 8. Remove friend
			await supertest(fastify.server)
				.delete('/api/friends/1')
				.send({ friendId: 2 })
				.expect(200);
			
			// 9. Verify friendship removed
			const finalFriendsResponse = await supertest(fastify.server)
				.get('/api/friends/friends/1')
				.expect(200);
			
			expect(finalFriendsResponse.body.friends).toHaveLength(0);
		});
	});
});
