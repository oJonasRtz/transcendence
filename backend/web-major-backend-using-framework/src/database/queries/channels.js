import AuthUtils from '../../utils/auth.js'

class ChannelsQueries {
	constructor(db) {
		this.db = db;
	}

	async createNewChannel(name, topic, password, invitationFlag, limitTopic, hasLimit) {
		if (!name || !topic)
			throw new Error('MISSING_INPUT');
		let password_hash;
		const existing = await this.db.get(`SELECT * FROM channels WHERE name = ?`, [name]);
		if (existing)
			throw new Error('ALREADY_EXISTS');
		if (!password)
			password = null;
		if (!invitationFlag)
			invitationFlag = false;
		if (!limitTopic)
			limitTopic = false;
		if (!hasLimit)
			hasLimit = null;
		if (password)
		{
			const strength = await AuthUtils.calculatePassWordStrength(password);
			if (strength !== 5)
				throw new Error('WEAK_PASSWORD');
			password_hash = await AuthUtils.hashPassword(password);
		}
		const stmt = await this.db.prepare(`
			INSERT INTO channels (name, topic, has_password, invitation, changeTopic, players_limit)
			VALUES (?, ?, ?, ?, ?, ?);
		`);
		await stmt.run(name, topic, password_hash, !!invitationFlag, !!limitTopic, hasLimit);
		await stmt.finalize();
	}

	async getAllChannels()
	{
		const existing = await this.db.all(`SELECT * FROM channels`);
		if (existing.length === 0)
			throw new Error('NO_CONTENT');
		return (existing);
	}

	async deleteChannel(name)
	{
		if (!name)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get(`SELECT * FROM channels WHERE name = ?`, [name]);
		if (!existing)
			throw new Error('NOT_FOUND');
		const stmt = await this.db.prepare(`DELETE FROM channels WHERE name = ?`);

		await stmt.run(name);
		await stmt.finalize();
	}
}

export default ChannelsQueries;
