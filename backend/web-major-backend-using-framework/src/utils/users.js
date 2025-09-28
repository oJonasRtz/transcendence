import AuthUtils from './auth.js';
import bcrypt from 'bcrypt';

class UserUtils {
	constructor(db) {
	this.db = db;
}

	async handleUsername(userId, username) {
		if (!userId || !username)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get(' SELECT * FROM users WHERE username = ?', [username]);
		if (existing)
			throw new Error('ALREADY_EXISTS');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		const result = await AuthUtils.validateUsername(username);
		if (!result)
			throw new Error('INVALID_INPUT');
		await this.db.run ('UPDATE users SET username = ? WHERE email = ?', [username, isValid.email]);
		await this.db.run ('UPDATE auth SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [username, isValid.email]);
	}

	async handleNickname(userId, nickname) {
		if (!userId || !nickname)
			throw new Error ('MISSING_INPUT');
		const existing = await this.db.get('SELECT * FROM users WHERE nickname = ?', [nickname]);
		if (existing)
			throw new Error('ALREADY_EXISTS');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		const result = await AuthUtils.validateUsername(nickname);
		if (!result)
			throw new Error('INVALID_INPUT');
		await this.db.run('UPDATE users SET nickname = ? WHERE email = ?', [nickname, isValid.email]);
		await this.db.run('UPDATE auth SET nickname = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [nickname, isValid.email]);
	}

	async handlePassword(userId, password) {
		if (!userId || !password)
			throw new Error ('MISSING_INPUT');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		const strength = await AuthUtils.calculatePassWordStrength(password);
		if (strength !== 5)
			throw new Error('INVALID_INPUT');
		const userAuth = await this.db.get('SELECT * FROM auth WHERE email = ?', [isValid.email]);
		if (!userAuth)
			throw new Error('NOT_FOUND');
		const verify = await bcrypt.compare(password, userAuth.password_hash);
		if (verify)
			throw new Error('INVALID_INPUT');
		const password_hash = await AuthUtils.hashPassword(password);
		await this.db.run('UPDATE auth SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [password_hash, isValid.email]);
	}

	async handleEmail(userId, email) {
		if (!userId || !email)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
		if (existing)
			throw new Error('ALREADY_EXISTS');
		const isValid = await AuthUtils.validateEmail(email.toLowerCase());
		if (!isValid)
			throw new Error('INVALID_INPUT');
		await this.db.run('UPDATE auth SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?', [email.toLowerCase(), isValid.username]);
		await this.db.run('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?', [email.toLowerCase(), isValid.username]);
	}

	async handleDescription(userId, description) {
		if (!userId || !description)
			throw new Error('MISSING_INPUT');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		await this.db.run('UPDATE users SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [description, isValid.email]);
	}

	async handleAvatar(userId, avatar) {
		if (!userId || !avatar)
			throw new Error('MISSING_INPUT');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		await this.db.run('UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [avatar, isValid.email]);
	}

	async handleGender(userId, gender) {
		if (!userId || !gender)
			throw new Error('MISSING_INPUT');
		if (gender !== 'M' && gender !== 'F' && gender !== 'B')
			throw new Error('INVALID_INPUT');
		const isValid = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
		if (!isValid)
			throw new Error('NOT_FOUND');
		await this.db.run('UPDATE users SET gender = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [gender, isValid.email]);
	}
}

export default UserUtils; 
