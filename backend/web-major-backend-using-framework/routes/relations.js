async function relationsRoutes(fastify, options) {

	// Get friends list with online status
	fastify.get('/friends/:userId', async (request, reply) => {
		const { userId } = request.params;
		
		try {
			const userIdNum = parseInt(userId, 10);
			if (isNaN(userIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			const friends = await fastify.dbQueries.relations.getFriendsList(userIdNum);
			return reply.code(200).send({
				message: 'Friends list retrieved successfully',
				friends: friends
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	// Get pending friend requests (received)
	fastify.get('/requests/pending/:userId', async (request, reply) => {
		const { userId } = request.params;
		
		try {
			const userIdNum = parseInt(userId, 10);
			if (isNaN(userIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			const requests = await fastify.dbQueries.relations.getPendingFriendRequests(userIdNum);
			return reply.code(200).send({
				message: 'Pending friend requests retrieved successfully',
				requests: requests
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	// Get sent friend requests
	fastify.get('/requests/sent/:userId', async (request, reply) => {
		const { userId } = request.params;
		
		try {
			const userIdNum = parseInt(userId, 10);
			if (isNaN(userIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			const requests = await fastify.dbQueries.relations.getSentFriendRequests(userIdNum);
			return reply.code(200).send({
				message: 'Sent friend requests retrieved successfully',
				requests: requests
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	// Send friend request
	fastify.post('/request/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { targetUserId } = request.body;
		
		try {
			const requesterId = parseInt(userId, 10);
			const addresseeId = parseInt(targetUserId, 10);
			
			if (isNaN(requesterId) || isNaN(addresseeId)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			await fastify.dbQueries.relations.sendFriendRequest(requesterId, addresseeId);
			return reply.code(201).send({
				message: 'Friend request sent successfully'
			});
		} catch (err) {
			fastify.log.error(err);
			switch (err.message) {
				case 'CANNOT_ADD_SELF':
					return reply.code(400).send({ error: 'Cannot send friend request to yourself' });
				case 'USER_NOT_FOUND':
					return reply.code(404).send({ error: 'User not found' });
				case 'ALREADY_FRIENDS':
					return reply.code(409).send({ error: 'Users are already friends' });
				case 'REQUEST_ALREADY_SENT':
					return reply.code(409).send({ error: 'Friend request already sent' });
				default:
					return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Accept friend request
	fastify.post('/accept/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { requesterId } = request.body;
		
		try {
			const addresseeId = parseInt(userId, 10);
			const requesterIdNum = parseInt(requesterId, 10);
			
			if (isNaN(addresseeId) || isNaN(requesterIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			await fastify.dbQueries.relations.acceptFriendRequest(requesterIdNum, addresseeId);
			return reply.code(200).send({
				message: 'Friend request accepted successfully'
			});
		} catch (err) {
			fastify.log.error(err);
			switch (err.message) {
				case 'REQUEST_NOT_FOUND':
					return reply.code(404).send({ error: 'Friend request not found' });
				case 'INVALID_REQUEST_STATUS':
					return reply.code(400).send({ error: 'Invalid request status' });
				default:
					return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Reject friend request
	fastify.post('/reject/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { requesterId } = request.body;
		
		try {
			const addresseeId = parseInt(userId, 10);
			const requesterIdNum = parseInt(requesterId, 10);
			
			if (isNaN(addresseeId) || isNaN(requesterIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			await fastify.dbQueries.relations.rejectFriendRequest(requesterIdNum, addresseeId);
			return reply.code(200).send({
				message: 'Friend request rejected successfully'
			});
		} catch (err) {
			fastify.log.error(err);
			switch (err.message) {
				case 'REQUEST_NOT_FOUND':
					return reply.code(404).send({ error: 'Friend request not found' });
				case 'INVALID_REQUEST_STATUS':
					return reply.code(400).send({ error: 'Invalid request status' });
				default:
					return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Remove friend
	fastify.delete('/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { friendId } = request.body;
		
		try {
			const userIdNum = parseInt(userId, 10);
			const friendIdNum = parseInt(friendId, 10);
			
			if (isNaN(userIdNum) || isNaN(friendIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			await fastify.dbQueries.relations.removeFriend(userIdNum, friendIdNum);
			return reply.code(200).send({
				message: 'Friend removed successfully'
			});
		} catch (err) {
			fastify.log.error(err);
			switch (err.message) {
				case 'NOT_FRIENDS':
					return reply.code(404).send({ error: 'Users are not friends' });
				default:
					return reply.code(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Update user online status
	fastify.post('/status/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { isOnline, statusMessage } = request.body;
		
		try {
			const userIdNum = parseInt(userId, 10);
			if (isNaN(userIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			await fastify.dbQueries.relations.updateUserStatus(userIdNum, isOnline, statusMessage || '');
			return reply.code(200).send({
				message: 'User status updated successfully'
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	// Get user online status
	fastify.get('/status/:userId', async (request, reply) => {
		const { userId } = request.params;
		
		try {
			const userIdNum = parseInt(userId, 10);
			if (isNaN(userIdNum)) {
				return reply.code(400).send({ error: 'Invalid user ID' });
			}

			const user = await fastify.dbQueries.relations.getUserById(userIdNum);
			if (!user) {
				return reply.code(404).send({ error: 'User not found' });
			}

			// Get status from user_status table
			const status = await new Promise((resolve, reject) => {
				const stmt = fastify.db.prepare(`
					SELECT is_online, last_seen, status_message 
					FROM user_status WHERE user_id = ?
				`);
				
				stmt.get([userIdNum], (err, row) => {
					stmt.finalize();
					if (err) {
						reject(err);
					} else {
						resolve(row || { is_online: false, last_seen: null, status_message: '' });
					}
				});
			});

			return reply.code(200).send({
				message: 'User status retrieved successfully',
				user: {
					id: user.id,
					username: user.username,
					...status
				}
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});
}

export default relationsRoutes;
