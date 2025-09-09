const bcrypt = require('bcrypt');

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
    if (!username || username.length < 3 || username.length > 50) {
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
  }

  static validatePassword(password) {
    return password && password.length >= 8;
  }
}

module.exports = AuthUtils;
