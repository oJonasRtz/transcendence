import AuthUtils from '../../utils/auth.js';
import bcrypt from 'bcrypt';

class DatabaseQueries {
  constructor(db) {
    this.db = db;
  }
	async registerUser (username, nickname, email, password) {
		const existing = await this.db.get(`
			SELECT id, username, nickname, email
			FROM auth
			WHERE username = ? OR email = ? OR nickname = ?
			LIMIT 1
		`, [username, email, nickname]);
		if (existing)
			throw new Error('User already exists');
		const passwordHash = await AuthUtils.hashPassword(password);
			const stmt = await this.db.prepare(`
			INSERT INTO auth (username, nickname, email, password_hash)
			VALUES (?, ?, ?, ?)
			`);
			try {
				const res = await stmt.run(username, nickname, email, passwordHash);
				return true;
			} finally {
				await stmt.finalize();
			}
	}
	
	async loginUser(username, email, password) {
		if (!username && email) {
			const stmt = await this.db.prepare(`
			SELECT email, password_hash
			FROM auth
			WHERE email = ?
			`);
			try {
				const res = await stmt.get(email);
				if (!res)
					throw new Error('invalid input');
				const isValid = await AuthUtils.verifyPassword(password, res.password_hash);
				if (!isValid){
					await this.db.run(`
						UPDATE auth 
						SET failed_login_count = failed_login_count + 1,
						WHERE email = ?
					`, [res.email.toLowerCase()]);
					throw new Error('invalid username/password/email');
				}
				await this.db.run(`
					UPDATE auth 
					SET is_active = 1,
						failed_login_count = 0,
						last_login_at = CURRENT_TIMESTAMP,
						updated_at = CURRENT_TIMESTAMP
					WHERE email = ?`
				, [res.email.toLowerCase()]);
				return (true)
			}
			finally {
				await stmt.finalize();
			}
		}
		else if (username) {
			const stmt = await this.db.prepare(`
			SELECT username, password_hash
			FROM auth
			WHERE username = ?
			`);
			try {
				const res = await stmt.get(username);
				if (!res)
					throw new Error("NOT_FOUND");
				const isValid = await AuthUtils.verifyPassword(password, res.password_hash);
				if (!isValid){
					await this.db.run(`
                                                UPDATE auth 
                                                SET failed_login_count = failed_login_count + 1,
                                                WHERE username = ?
                                        `, [res.username]);
					throw new Error("INVALID_USER_PASS");
				}
				await this.db.run(`
                                        UPDATE auth 
                                        SET is_active = 1,
                                                failed_login_count = 0,
						last_login_at = CURRENT_TIMESTAMP,
						updated_at = CURRENT_TIMESTAMP
                                        WHERE username = ?`
                                , [res.username]);
				return (true);
			} finally {
				await stmt.finalize();
			}
		}
		else
			throw new Error("Don't have enough information to check");
	}

	async logoutUser (id) {
		if (!id)
			throw new Error ('Invalid input');
		const existing = await this.db.get(`
                        SELECT id, username, email
                        FROM auth
                        WHERE id = ?
                        LIMIT 1
                `, [id]);
		if (existing) {
			this.db.run(`
			UPDATE auth
			SET is_active = 0,
			    updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`, [id]);
			return (true);
		}
		else
			throw new Error("The user doesn't exist");
	}

	async forgotPass(id, email, newPassword)
	{
		if (!id || !email || !newPassword)
			throw new Error ("MISSING_INPUT");
		const existing = await this.db.get(`
			SELECT id, username, email, password_hash
			FROM auth
			WHERE id = ? AND email = ?
		`, [id, email]);
		if (!existing)
			throw new Error ("NOT_FOUND");
		const isTheSame = await bcrypt.compare(newPassword, existing.password_hash);
		if (isTheSame)
			throw new Error ('SAME_PASSWORD');
		else
		{
			const strength = await AuthUtils.calculatePassWordStrength(newPassword);
			if (strength !== 5)
				throw new Error ("WEAK_NEW_PASSWORD");
			const passwordHash = await AuthUtils.hashPassword(newPassword);
			try {
				await this.db.run(`
					UPDATE auth
					SET password_hash = ?
					WHERE id = ? AND email = ?
					`, [passwordHash, id, email]);
			} catch (err) {
				throw new Error ("INTERNAL_SERVER_ERROR");
			}
			return (true);
		}
	}

	async aboutMeGetUserInformation(id)
	{
		if (!id)
			throw new Error ('MISSING_INPUT');
		const existing = await this.db.get(`
			SELECT *
			FROM auth
			WHERE id = ?
		`, [id]);

		if (existing)
			return ({ 
				id: existing.id, 
				username: existing.username, 
				email: existing.email,
				is_active: existing.is_active,
				password_hash: existing.password_hash,
				last_login_at: existing.last_login_at,
				failed_login_count: existing.failed_login_count,
				last_login_ip: existing.last_login_ip
			});
		else if (!existing)
			throw new Error('UNAUTHORIZED');
	}
};
export default DatabaseQueries;
