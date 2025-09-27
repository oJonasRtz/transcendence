import AuthUtils from '../../utils/auth.js';

class UsersQueries {
  constructor(db) {
    this.db = db;
  }
	async newUser(username, nickname, email) {
		if (!username || !nickname || !email)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.all(`
			SELECT username, nickname, email FROM users
			WHERE username = ? OR nickname = ? OR email = ?
		`, [username, nickname, email]);

		if (existing.length !== 0)
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
		const users = await this.db.all(`
			SELECT * FROM users;
		`);

		if (users.length === 0) 
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

	async updatePatchUser(id, fields = {})
	{
		if (!id)
			throw new Error('MISSING_ID');
	
		if (typeof fields.email === 'string') fields.email = fields.email.trim().toLowerCase();
		if (typeof fields.username === 'string') fields.username = fields.username.trim(); 
		if (typeof fields.nickname === 'string') fields.nickname = fields.nickname.trim();

		const Allowed = new Set(['username', 'email', 'nickname', 'password', 'description', 'avatar', 'gender']);	
		const updates = Object.entries(fields)
		.filter(([key, value]) => Allowed.has(key) && value !== undefined);

		if (updates.length === 0)
			throw new Error("NO_FIELDS");

		const setClauses = [];
		const params = [];

		for (const [col, val] of updates) {
			setClauses.push(`${col} = ?`);
			params.push(val);
		}

		params.push(id);

		if (fields.username !== undefined)
		{
			const existing = await this.db.get(`SELECT * FROM users WHERE username = ?`, [fields.username]);
			if (existing)
				throw new Error ('ALREADY_EXISTS_USERNAME');
			await this.db.run(`
				UPDATE auth
				SET username = ?
				WHERE id = ?
			`, [fields.username, id]);
		}
		if (fields.nickname !== undefined)
		{
			const existing = await this.db.get(`SELECT * FROM users WHERE nickname = ?`, [fields.nickname]);
			if (existing)
				throw new Error ('ALREADY_EXISTS_NICKNAME');
		}
		if (fields.email !== undefined)
		{
			const existing = await this.db.get('SELECT * FROM users WHERE email = ?', 			[fields.email]);
			if (existing)
				throw new Error ('ALREADY_EXISTS_EMAIL');
			await this.db.run(`
                                UPDATE auth
                                SET email = ?
                                WHERE id = ?
                        `, [fields.email, id]);
		}
		if (fields.password !== undefined)
		{
			const strength = await AuthUtils.calculatePassWordStrength(password);
			if (strength !== 5)
				throw new Error ('WEAK_PASSWORD');
			const password_hash = await AuthUtils.hashPassword(fields.password);
			await this.db.run(`
				UPDATE auth
				SET password_hash = ?
				WHERE id = ?
				`, [password_hash, id]);
			delete fields.password;
		}
		const query = `
			UPDATE users
			SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?	
		`;

		await this.db.run(query, params);
	}
};

export default UsersQueries;
