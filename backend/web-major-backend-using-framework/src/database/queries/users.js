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

	async getAllUsers() {
		const users = await this.db.get(`
			SELECT * FROM users;
		`);

		if (!users) 
			throw new Error('NO_CONTENT');
		return (users);
	}
	
	async getIdUser(id) {
		const user = await this.db.get(`
			SELECT * FROM users
			WHERE id = ?
		`, [id]);

		if (!user)
			throw new Error ('NO_CONTENT');
		return (user);
	}

	async getQueryUser(nickStartWith) {
		if (!nickStartWith)
			throw new Error('BAD_REQUEST');

		const stmt = await this.db.prepare(`
			SELECT * FROM users
			WHERE nickname LIKE ? COLLATE NOCASE
		`);
		const users = await stmt.all(`${nickStartWith}%`);

		await stmt.finalize();

		if (users.length === 0)
			throw new Error('NO_CONTENT');
		return (users);
	}

	async removeUser(id)
	{
		if (!id)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get(`
			SELECT * FROM users
			WHERE id = ?
		`, [id]);

		if (!existing)
			throw new Error('NOT_FOUND');

		await this.db.run(`DELETE FROM auth WHERE email = ?`, [existing.email]);
		await this.db.run(`DELETE FROM users WHERE email = ?`, [existing.email]);
	}
};

export default UsersQueries;
