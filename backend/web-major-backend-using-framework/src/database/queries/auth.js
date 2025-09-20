import AuthUtils from '../../utils/auth.js';

class DatabaseQueries {
  constructor(db) {
    this.db = db;
  }
	async registerUser (username, email, password) {
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
};
export default DatabaseQueries;
