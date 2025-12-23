class LobbiesQueries {
	constructor(db) {
		this.db = db;
	}

	async getAllLobbies()
	{
		const lobbies = await this.db.all(`SELECT * FROM lobbies`);
		if (lobbies.length === 0)
			throw new Error ('EMPTY');
		return (lobbies);
	}

	async createNewLobby(lobby_name, game_mode)
	{
		if (!lobby_name || !game_mode)
			throw new Error ('MISSING_INPUT');
		const existing = await this.db.get(`SELECT * FROM lobbies WHERE lobby_name = ?`, [lobby_name]);
		if (existing)
			throw new Error('ALREADY_EXISTS');
		const stmt = await this.db.prepare(`INSERT INTO lobbies (lobby_name, game_mode) VALUES (?, ?)`);

		await stmt.run(lobby_name, game_mode);
		await stmt.finalize();
	}

	async getLobbyById(lobby_id)
	{
		if (!lobby_id)
			throw new Error('MISSING_INPUT');
		const lobbyID = parseInt(lobby_id, 10);

		const existing = await this.db.get(`SELECT * FROM lobbies WHERE lobby_id = ?`, [lobby_id]);
		if (!existing)
			throw new Error('NOT_FOUND');
		return (existing);
	}

	async addNewUserToLobby(username, nickname, email, lobby_name, id)
	{
		if (!username || !nickname || !email || !lobby_name || !id)
			throw new Error('MISSING_INPUT');
		const lobby_id = parseInt(id, 10);
		const existing = await this.db.get(`SELECT * FROM users WHERE username = ? AND nickname = ? AND email = ?`, [username, nickname, email.toLowerCase()]);
		if (!existing)
			throw new Error('USER_DOES_NOT_EXIST');
		const isValidLobby = await this.db.get(`SELECT * FROM lobbies WHERE lobby_id = ? AND lobby_name = ?`, [lobby_id, lobby_name]);
		if (!isValidLobby)
			throw new Error('LOBBY_DOES_NOT_EXIST');
		if (isValidLobby.hasLimit && (isValidLobby.players + 1 ) > isValidLobby.maximum_players)
			throw new Error('MAXIMUM_CAPACITY');
		const checkExistence = await this.db.get(`SELECT * FROM lobbies_members WHERE username = ? OR nickname = ? OR email = ?`, [username, nickname, email.toLowerCase()]);
		if (checkExistence)
			throw new Error('ALREADY_EXISTS');
		const stmt = await this.db.prepare(`INSERT INTO lobbies_members (username, nickname, email, lobby_name, lobby_id)
			VALUES (?, ?, ?, ?, ?)`);

		await stmt.run(username, nickname, email, lobby_name, lobby_id)
		await stmt.finalize();

		await this.db.run(`UPDATE lobbies SET players = players + 1, updated_at = CURRENT_TIMESTAMP WHERE lobby_id = ? AND lobby_name = ?`, [lobby_id, lobby_name]);
	}

	async removeUserFromLobby(username, nickname, email, lobby_name, userId)
	{
		if (!username || !nickname || !email || !lobby_name || !userId)
			throw new Error('MISSING_INPUT');

		const id = parseInt(userId, 10);

		const existing = await this.db.get(`SELECT * FROM lobbies_members WHERE username = ?
			AND nickname = ?
			AND email = ?
			AND lobby_name = ?
			AND lobby_id = ?
			`, [username, nickname, email, lobby_name, id]);
		if (!existing)
			throw new Error('INVALID_USER');
		const stmt = await this.db.prepare(`DELETE FROM lobbies_members
			WHERE username = ? AND nickname = ? AND email = ? AND lobby_name = ? AND lobby_id = ?`);

		await stmt.run(username, nickname, email, lobby_name, id);
		await stmt.finalize();
	}

	async getAllLobbiesMembers()
	{
		const existing = await this.db.all(`SELECT * FROM lobbies_members`);
		if (existing.length === 0)
			throw new Error('EMPTY');
		return (existing);
	}

	async getLobbyMemberById(id)
	{
		const userId = parseInt(id, 10);

		const existing = await this.db.get(`SELECT * FROM lobbies_members WHERE lobby_id = ?`, [userId]);
		if (!existing)
			throw new Error('NOT_FOUND');
		return (existing);
	}

	async getLobbyMemberByQuery(nickname)
	{
		if (!nickname)
			throw new Error('MISSING_INPUT');
		const stmt = await this.db.prepare(`
                        SELECT * FROM lobbies_members
                        WHERE nickname LIKE ? COLLATE NOCASE
                `);
                const existing = await stmt.all(`${nickname}%`);
		await stmt.finalize();
		if (existing.length === 0)
			throw new Error('NOT_FOUND');
		return (existing);
	}

	async deleteLobby(lobby_name)
	{
		if (!lobby_name)
			throw new Error('MISSING_INPUT');
		const existing = await this.db.get(`SELECT * FROM lobbies WHERE lobby_name = ?`, [lobby_name]);
		if (!existing)
			throw new Error ('NOT_FOUND');
		const stmt = await this.db.prepare(`DELETE FROM lobbies_members WHERE lobby_name = ?`);

		await stmt.run(lobby_name);
		await stmt.finalize();

		await this.db.exec(`DELETE FROM lobbies`);
	}
}

export default LobbiesQueries;
