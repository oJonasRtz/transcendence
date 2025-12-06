import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

class AuthUtils {
  static async hashPassword(password) {
    try {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      return hash;
    } catch (error) {
      throw new Error('Error hashing password: ' + error.message);
    }
  }
  static async calculatePassWordStrength(password) {
	let strength = 0;
	strength += Number(password.length >= 8);
	strength += Number(/[A-Z]/.test(password));
	strength += Number(/[0-9]/.test(password));
	strength += Number(/[a-z]/.test(password));
	strength += Number(/[^A-Za-z0-9]/.test(password));
	return strength;
}
  static async deleteAuthTable(db) {
	await db.exec('PRAGMA foreign_keys = OFF;');

	await db.exec('DELETE FROM auth;');
	await db.exec('DELETE FROM users;');
	await db.exec('DELETE FROM lobbies;');
	await db.exec('DELETE FROM lobbies_members;');

	const hasSeq = await db.get(`
		SELECT 1
		FROM sqlite_master
		WHERE name = 'sqlite_sequence'
		LIMIT 1
		`
	)
	if (hasSeq) {
		await db.exec(`DELETE FROM sqlite_sequence WHERE name='auth' OR name='users' OR name='lobbies' OR name='lobbies_members';`);
	}
	await db.exec('PRAGMA foreign_keys = ON;');
  }

  static async verifyPassword(password, hash) {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return isValid;
    } catch (error) {
      throw new Error('Error verifying password: ' + error.message);
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username) {
    if (!username || username.length < 3 || username.length > 25) {
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
  }

  static validatePassword(password) {
    return password && password.length >= 8;
  }
}

export default AuthUtils;
