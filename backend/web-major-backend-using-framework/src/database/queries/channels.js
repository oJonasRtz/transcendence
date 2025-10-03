import AuthUtils from '../../utils/auth.js'

class ChannelsQueries {
	constructor(db) {
		this.db = db;
	}

	async createNewChannel(name, topic, password, invitationFlag, limitTopic, hasLimit, isPrivate) {
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
		if (!isPrivate)
			isPrivate = false;
		if (password)
		{
			const strength = await AuthUtils.calculatePassWordStrength(password);
			if (strength !== 5)
				throw new Error('WEAK_PASSWORD');
			password_hash = await AuthUtils.hashPassword(password);
		}
		const stmt = await this.db.prepare(`
			INSERT INTO channels (name, topic, has_password, invitation, changeTopic, players_limit, is_private)
			VALUES (?, ?, ?, ?, ?, ?, ?);
		`);
		await stmt.run(name, topic, password_hash, !!invitationFlag, !!limitTopic, !!hasLimit, !!isPrivate);
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

	async addUserToChannel(id, name, password, username, nickname, email)
	{
		if (!id || !name || !username || !nickname || !email)
			throw new Error('MISSING_INPUT');

		const channel_id = parseInt(id, 10);

		const isValidUser = await this.db.get(`SELECT * FROM users WHERE username = ? AND nickname = ? AND email = ?`, [username, nickname, email]);
		if (!isValidUser)
			throw new Error ('NOT_FOUND_USER');

		let isOperator = false;
		const isValidChannel = await this.db.get(`SELECT * FROM channels WHERE name = ? AND id = ?`, [name, channel_id]);
		if (!isValidChannel)
			throw new Error ('NOT_FOUND_CHANNEL');

		const playersOnChannel = await this.db.all(`SELECT * FROM channels WHERE name = ? AND id = ?`, [name, channel_id]);
		if (playersOnChannel.length === 0)
			isOperator = true;
	
		if (!password && isValidChannel.has_password !== null)
			throw new Error ('FORGOT_PASSWORD');
		if (isValidChannel.invitation) {
			const check = await this.db.get(`SELECT * FROM channels_members WHERE username = ? AND nickname = ? AND email = ?`, [username, nickname, email]);
			if (!check)
				throw new Error ('WITHOUT_INVITATION');
		}
		if (isValidChannel.password_hash !== null && password){
			const checking = await AuthUtils.verifyPassword(password, isValidChannel.has_password);
			if (!checking)
				throw new Error ('INVALID_PASSWORD');
		}
		const stmt = await this.db.prepare(`INSERT INTO channels_members (username, nickname, email, channel_name, channel_id, isOperator) 
			VALUES (?, ?, ?, ?, ?, ?)`);

		await stmt.run(username, nickname, email, name, channel_id, isOperator);
		await stmt.finalize();
	}

	async getChannelUsers(name)
	{
		if (!name)
			throw new Error ('MISSING_INPUT');
		const users = await this.db.all(`SELECT * FROM channels_members WHERE channel_name = ?`, [name]);
		if (!users)
			throw new Error ('NO_CONTENT');
		return (users);
	}

	async deleteChannelUser(name, username, nickname, email)
	{
		if (!name || !username || !nickname || !email)
			throw new Error('MISSING_INPUT');
		const existingUser = await this.db.get(`SELECT * FROM channels_members WHERE username = ? AND nickname = ? AND email = ?`, [username, nickname, email]);
		if (!existingUser)
			throw new Error('NOT_FOUND_USER');
		const existingChannel = await this.db.get(`SELECT * FROM channels WHERE name = ?`, [name]);
		if (!existingChannel)
			throw new Error('NOT_FOUND_CHANNEL');
		const stmt = await this.db.prepare(`DELETE FROM channels_members WHERE username = ? AND nickname = ? AND email = ?`);

		await stmt.run(username, nickname, email);
		await stmt.finalize();
	}

	async getVisibleChannels()
	{
		const existing = await this.db.get(`SELECT * FROM channels WHERE is_private = FALSE`);
		if (!existing)
			throw new Error('NO_CONTENT');
		return (existing);
	}

	async inviteNewUser(channel_name, channel_id, ownerEmail, targetUsername, targetNickname, targetEmail)
	{
		if (!channel_name || !channel_id || !targetUsername || !targetNickname || !targetEmail)
			throw new Error('MISSING_INPUT');
		const existingTarget = await this.db.get(`SELECT * FROM users WHERE email = ?`, [targetEmail]);
		if (!existingTarget)
			throw new Error('NOT_FOUND_TARGET');
		const existingOwner = await this.db.get(`SELECT * FROM channels_members WHERE email = ?`, [ownerEmail]);
		if (!existingOwner)
			throw new Error('NOT_FOUND_OWNER');
		if (!existingOwner.isOperator)
			throw new Error('NOT_OPERATOR');
		const checkExists = await this.db.get(`SELECT * FROM channels_members WHERE email = ? AND channel_name = ?`, [targetEmail, channel_name]);
		if (checkExists)
			throw new Error('ALREADY_EXISTS');

		const existingChannel = await this.db.get(`SELECT * FROM channels WHERE channel_name = ? AND channel_id = ?`, [channel_name, channel_id]);
		if (!existingChannel)
			throw new Error('NOT_FOUND_CHANNEL');
		const stmt = await this.db.prepare(`INSERT INTO invited_members (channelName, channelId, username, nickname, email)`);

		await stmt.run(channel_name, channel_id, ownerEmail, targetUsername, targetNickname, targetEmail);
		await stmt.finalize();
	}
}

export default ChannelsQueries;
