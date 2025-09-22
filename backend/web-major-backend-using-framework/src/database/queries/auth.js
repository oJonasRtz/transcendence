import AuthUtils from '../../utils/auth.js';

class DatabaseQueries {
  constructor(db) {
    this.db = db;
  }
	async registerUser (username, email, password) {
		const existing = await this.db.get(`
			SELECT id, username, email
			FROM auth
			WHERE username = ? OR email = ?
			LIMIT 1
		`, [username, email]);
		if (existing)
			throw new Error('User already exists');
		const passwordHash = await AuthUtils.hashPassword(password);
			const stmt = await this.db.prepare(`
			INSERT INTO auth (username, email, password_hash)
			VALUES (?, ?, ?)
			`);
			try {
				const res = await stmt.run(username, email, passwordHash);
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
					`, [res.email]);
					throw new Error('invalid username/password/email');
				}
				await this.db.run(`
					UPDATE auth 
					SET is_active = 1,
						failed_login_count = 0,
						last_login_at = CURRENT_TIMESTAMP,
						updated_at = CURRENT_TIMESTAMP
					WHERE email = ?`
				, [res.email]);
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
					throw new Error("Don't have an user with this username");
				const isValid = await AuthUtils.verifyPassword(password, res.password_hash);
				if (!isValid){
					await this.db.run(`
                                                UPDATE auth 
                                                SET failed_login_count = failed_login_count + 1,
                                                WHERE username = ?
                                        `, [res.username]);
					throw new Error("Invalid username/email/password");
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
};
export default DatabaseQueries;
