class RelationsQueries {
  constructor(db) {
    this.db = db;
  }

  // Send friend request
  async sendFriendRequest(requesterId, addresseeId) {
    if (requesterId === addresseeId) {
      throw new Error('CANNOT_ADD_SELF');
    }

    // Check if users exist
    const requester = await this.getUserById(requesterId);
    const addressee = await this.getUserById(addresseeId);
    
    if (!requester || !addressee) {
      throw new Error('USER_NOT_FOUND');
    }

    // Check if already friends
    const existingFriendship = await this.areFriends(requesterId, addresseeId);
    if (existingFriendship) {
      throw new Error('ALREADY_FRIENDS');
    }

    // Check if request already exists
    const existingRequest = await this.getFriendRequest(requesterId, addresseeId);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new Error('REQUEST_ALREADY_SENT');
      } else if (existingRequest.status === 'accepted') {
        throw new Error('ALREADY_FRIENDS');
      }
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO friend_requests (requester_id, addressee_id, status)
        VALUES (?, ?, 'pending')
      `);
      
      stmt.run([requesterId, addresseeId], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, requesterId, addresseeId, status: 'pending' });
        }
      });
    });
  }

  // Accept friend request
  async acceptFriendRequest(requesterId, addresseeId) {
    const request = await this.getFriendRequest(requesterId, addresseeId);
    if (!request) {
      throw new Error('REQUEST_NOT_FOUND');
    }
    if (request.status !== 'pending') {
      throw new Error('INVALID_REQUEST_STATUS');
    }

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Update request status
        const updateStmt = this.db.prepare(`
          UPDATE friend_requests 
          SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
          WHERE requester_id = ? AND addressee_id = ?
        `);
        
        updateStmt.run([requesterId, addresseeId], (err) => {
          if (err) {
            updateStmt.finalize();
            reject(err);
            return;
          }
          updateStmt.finalize();

          // Add to friends table (ensure consistent ordering)
          const user1Id = Math.min(requesterId, addresseeId);
          const user2Id = Math.max(requesterId, addresseeId);
          
          const friendsStmt = this.db.prepare(`
            INSERT INTO friends (user1_id, user2_id)
            VALUES (?, ?)
          `);
          
          friendsStmt.run([user1Id, user2Id], function(err) {
            friendsStmt.finalize();
            if (err) {
              reject(err);
            } else {
              resolve({ requesterId, addresseeId, status: 'accepted' });
            }
          });
        });
      });
    });
  }

  // Reject friend request
  async rejectFriendRequest(requesterId, addresseeId) {
    const request = await this.getFriendRequest(requesterId, addresseeId);
    if (!request) {
      throw new Error('REQUEST_NOT_FOUND');
    }
    if (request.status !== 'pending') {
      throw new Error('INVALID_REQUEST_STATUS');
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE friend_requests 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE requester_id = ? AND addressee_id = ?
      `);
      
      stmt.run([requesterId, addresseeId], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ requesterId, addresseeId, status: 'rejected' });
        }
      });
    });
  }

  // Remove friend
  async removeFriend(userId, friendId) {
    const areFriends = await this.areFriends(userId, friendId);
    if (!areFriends) {
      throw new Error('NOT_FRIENDS');
    }

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Remove from friends table
        const user1Id = Math.min(userId, friendId);
        const user2Id = Math.max(userId, friendId);
        
        const friendsStmt = this.db.prepare(`
          DELETE FROM friends 
          WHERE user1_id = ? AND user2_id = ?
        `);
        
        friendsStmt.run([user1Id, user2Id], (err) => {
          if (err) {
            friendsStmt.finalize();
            reject(err);
            return;
          }
          friendsStmt.finalize();

          // Also remove any friend requests between them
          const requestStmt = this.db.prepare(`
            DELETE FROM friend_requests 
            WHERE (requester_id = ? AND addressee_id = ?) 
               OR (requester_id = ? AND addressee_id = ?)
          `);
          
          requestStmt.run([userId, friendId, friendId, userId], function(err) {
            requestStmt.finalize();
            if (err) {
              reject(err);
            } else {
              resolve({ userId, friendId, removed: true });
            }
          });
        });
      });
    });
  }

  // Get friends list with online status
  async getFriendsList(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          CASE 
            WHEN f.user1_id = ? THEN f.user2_id 
            ELSE f.user1_id 
          END as friend_id,
          u.username,
          u.email,
          us.is_online,
          us.last_seen,
          us.status_message,
          f.created_at as friendship_date
        FROM friends f
        JOIN users u ON (
          CASE 
            WHEN f.user1_id = ? THEN f.user2_id 
            ELSE f.user1_id 
          END = u.id
        )
        LEFT JOIN user_status us ON u.id = us.user_id
        WHERE f.user1_id = ? OR f.user2_id = ?
        ORDER BY us.is_online DESC, u.username ASC
      `, [userId, userId, userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get pending friend requests (received)
  async getPendingFriendRequests(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          fr.requester_id,
          u.username,
          u.email,
          fr.created_at as request_date
        FROM friend_requests fr
        JOIN users u ON fr.requester_id = u.id
        WHERE fr.addressee_id = ? AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get sent friend requests
  async getSentFriendRequests(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          fr.addressee_id,
          u.username,
          u.email,
          fr.status,
          fr.created_at as request_date
        FROM friend_requests fr
        JOIN users u ON fr.addressee_id = u.id
        WHERE fr.requester_id = ?
        ORDER BY fr.created_at DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Check if two users are friends
  async areFriends(userId1, userId2) {
    const user1Id = Math.min(userId1, userId2);
    const user2Id = Math.max(userId1, userId2);
    
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id FROM friends 
        WHERE user1_id = ? AND user2_id = ?
      `);
      
      stmt.get([user1Id, user2Id], (err, row) => {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  // Get friend request
  async getFriendRequest(requesterId, addresseeId) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT * FROM friend_requests 
        WHERE requester_id = ? AND addressee_id = ?
      `);
      
      stmt.get([requesterId, addresseeId], (err, row) => {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update user online status
  async updateUserStatus(userId, isOnline, statusMessage = '') {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO user_status (user_id, is_online, last_seen, status_message)
        VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          is_online = excluded.is_online,
          last_seen = excluded.last_seen,
          status_message = excluded.status_message
      `);
      
      stmt.run([userId, isOnline, statusMessage], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ userId, isOnline, statusMessage, lastSeen: new Date().toISOString() });
        }
      });
    });
  }

  // Get user by ID (helper method)
  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, username, email FROM users WHERE id = ?
      `);
      
      stmt.get([id], (err, row) => {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get user by username (helper method)
  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, username, email FROM users WHERE username = ?
      `);
      
      stmt.get([username], (err, row) => {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

export default RelationsQueries;
