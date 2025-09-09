const AuthUtils = require('../utils/auth');

class DatabaseQueries {
  constructor(db) {
    this.db = db;
  }

  async createUser(username, email, password) {
    const passwordHash = await AuthUtils.hashPassword(password);
    
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `);
      
      stmt.run([username, email, passwordHash], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email });
        }
      });
    });
  }

  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, username, email, password_hash, created_at, updated_at
        FROM users WHERE username = ?
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

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, username, email, password_hash, created_at, updated_at
        FROM users WHERE email = ?
      `);
      
      stmt.get([email], (err, row) => {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, username, email, created_at, updated_at
        FROM users WHERE id = ?
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

  async createTournament(name, maxParticipants = 8) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO tournaments (name, max_participants)
        VALUES (?, ?)
      `);
      
      stmt.run([name, maxParticipants], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, maxParticipants, status: 'pending' });
        }
      });
    });
  }

  async getTournamentById(id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT id, name, status, max_participants, created_at
        FROM tournaments WHERE id = ?
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

  async getAllTournaments() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT id, name, status, max_participants, created_at
        FROM tournaments ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async addParticipantToTournament(tournamentId, userId) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO tournament_participants (tournament_id, user_id)
        VALUES (?, ?)
      `);
      
      stmt.run([tournamentId, userId], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ tournamentId, userId, joinedAt: new Date().toISOString() });
        }
      });
    });
  }

  async getTournamentParticipants(tournamentId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT u.id, u.username, tp.joined_at
        FROM tournament_participants tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
        ORDER BY tp.joined_at
      `, [tournamentId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async createGame(tournamentId, player1Id, player2Id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO games (tournament_id, player1_id, player2_id)
        VALUES (?, ?, ?)
      `);
      
      stmt.run([tournamentId, player1Id, player2Id], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            tournamentId, 
            player1Id, 
            player2Id, 
            status: 'pending' 
          });
        }
      });
    });
  }

  async updateGameResult(gameId, winnerId, scoreP1, scoreP2) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE games 
        SET winner_id = ?, score_p1 = ?, score_p2 = ?, 
            status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run([winnerId, scoreP1, scoreP2, gameId], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ gameId, winnerId, scoreP1, scoreP2 });
        }
      });
    });
  }

  async getGameById(id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        SELECT g.*, 
               p1.username as player1_username,
               p2.username as player2_username,
               w.username as winner_username
        FROM games g
        JOIN users p1 ON g.player1_id = p1.id
        JOIN users p2 ON g.player2_id = p2.id
        LEFT JOIN users w ON g.winner_id = w.id
        WHERE g.id = ?
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

  async addMatchHistory(userId, gameId, result, scoreFor, scoreAgainst) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO match_history (user_id, game_id, result, score_for, score_against)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run([userId, gameId, result, scoreFor, scoreAgainst], function(err) {
        stmt.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, userId, gameId, result });
        }
      });
    });
  }

  async getUserMatchHistory(userId, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT mh.*, g.created_at as game_date,
               p1.username as player1_username,
               p2.username as player2_username
        FROM match_history mh
        JOIN games g ON mh.game_id = g.id
        JOIN users p1 ON g.player1_id = p1.id
        JOIN users p2 ON g.player2_id = p2.id
        WHERE mh.user_id = ?
        ORDER BY mh.created_at DESC
        LIMIT ?
      `, [userId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = DatabaseQueries;
