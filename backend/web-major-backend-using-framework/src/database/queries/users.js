class UsersQueries {
  constructor(db) {
    this.db = db;
  }
	async newUser(username, nickname, email) {
		if (!username || !nickname || !email)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get(`
			SELECT username, nickname, email FROM users
			WHERE username = ? OR nickname = ? OR email = ?
		`, [username, nickname, email]);

		if (existing)
			throw new Error('USER_EXISTS');

		const avatar = '../../../images/man.png';
		const gender = 'M';
		const stmt = await this.db.prepare(`
                                INSERT INTO users (username, nickname, email, avatar, gender)
                                VALUES (?, ?, ?, ?, ?)
                        `); 
		try {
			await stmt.run(username, nickname, email, avatar, gender);
		} finally {
			if (stmt) await stmt.finalize();
		}
		return (true);
	}
};

export default UsersQueries;
