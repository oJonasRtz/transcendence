import AuthUtils from '../../utils/auth.js';
import UserUtils from '../../utils/users.js';

class UsersQueries {
  constructor(db) {
    this.db = db;
    this.userUtils = new UserUtils(db);
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

	async updatePatchUser(id, username, nickname, email, password, gender, avatar, description)
	{
		if (!id)
			throw new Error('MISSING_INPUT');
		const userId = parseInt(id, 10);
		if (username !== undefined)
			await this.userUtils.handleUsername(userId, username);
		if (nickname !== undefined)
			await this.userUtils.handleNickname(userId, nickname);
		if (email !== undefined)
			await this.userUtils.handleEmail(userId, email);
		if (password !== undefined)
			await this.userUtils.handlePassword(userId, password);
		if (gender !== undefined)
			await this.userUtils.handleGender(userId, gender);
		if (avatar !== undefined)
			await this.userUtils.handleAvatar(userId, avatar);
		if (description !== undefined)
			await this.userUtils.handleDescription(userId, description);
		return (true);
	}

	async updatePutUser(id, username, nickname, email, password, gender, avatar, description) {
		if (!id || !username || !nickname || !email || !password || !gender || !avatar || !description)
			throw new Error('MISSING_INPUT');

		const userId = parseInt(id, 10);

		await this.userUtils.handleUsername(userId, username);
		await this.userUtils.handleNickname(userId, nickname);
		await this.userUtils.handlePassword(userId, password);
		await this.userUtils.handleGender(userId, gender);
		await this.userUtils.handleAvatar(userId, avatar);
		await this.userUtils.handleDescription(userId, description);
		await this.userUtils.handleEmail(userId, email);
	}

	async getUserStatus(id) {
		if (!id)
			throw new Error('MISSING_INPUT');
		const userId = parseInt(id, 10);
		const response = this.db.get(`SELECT nickname, title, wins, losses, win_rate, level, experience_points FROM users WHERE id = ?`, [userId]);
		if (!response)
			throw new Error('NOT_FOUND');
		return (response);
	}
};

export default UsersQueries;
