import bcrypt from 'bcrypt';
import { stat } from 'node:fs';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';

const databaseModels = {
	getUserData: async function getUserData(fastify, email) {
		let object = await fastify.db.get("SELECT username, user_id FROM auth WHERE email = ?", [ email ]);
		if (!object)
			object = null;
		return (object);
	},

	getUserPassword: async function getUserPassword(fastify, email) {
		let object = await fastify.db.get("SELECT password from auth WHERE email = ?", [ email ]);
		if (!object)
			object = null;
		return (object);
	},
	
	getQueue: async function getQueue(fastify) {
		const queue = await fastify.db.all(`
			SELECT 
				a.username,
				u.rank,
				u.user_id,
				a.email
			FROM users u
			JOIN auth a ON a.id = u.user_id
			WHERE u.isOnline = TRUE
			AND u.inQueue = TRUE
		`);

		return queue ?? [];
	},

	getMatchId: async function getMatchId(fastify, email) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ email ]);
		if (!user_id)
			return (null);
		const match_id = await fastify.db.get("SELECT match_id FROM users WHERE user_id = ?", [ user_id.id ]);
		return (match_id?.match_id ?? null);
	},

	setMatchId: async function setMatchId(fastify, email, match_id) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ email ]);
		if (!user_id)
			return (null);
		await fastify.db.run("UPDATE users SET match_id = ? WHERE user_id = ?", [ match_id, user_id.id ]);
		return (true);
	},

	registerNewUser: async function registerNewUser(fastify, data, password_hash) {
		await fastify.db.run("INSERT INTO auth (user_id, username, nickname, password, email, twoFactorEnable) VALUES (?, ?, ?, ?, ?, ?)", 
			[ data.user_id, data.username, data.nickname, password_hash, data.email, data.is2faEnable ]);
	},

	checkEmail: async function checkEmail(fastify, email) {
		const match = await fastify.db.get("SELECT email FROM auth WHERE email = ?", [ email ]);
		return (match ?? null);
	},

	getPassword: async function getPassword(fastify, email) {
		const object = await fastify.db.get("SELECT password FROM auth WHERE email = ?", [ email ]);
		return (object ?? null);
	},

	newPassword: async function newPassword(fastify, email, password_hash) {
		await fastify.db.run("UPDATE auth SET password = ? WHERE email = ?", [ password_hash, email ]);
		return (true);
	},

	getUserId: async function getUserId(fastify, username) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE username = ?", [ username ]);
		return (user_id.user_id ?? null);
	},

	createNewUser: async function createNewUser(fastify, user_id) {
		const nanoId = nanoid();
		await fastify.db.run("INSERT INTO users (user_id, public_id) VALUES (?, ?)", [ user_id, nanoId ]);
	},

	activateEmail: async function validateUserEmail(fastify, email) {
		await fastify.db.run("UPDATE users SET isEmailConfirmed = true");
	},

	get2FAEnable: async function get2FAEnable(fastify, email) {
		const twoFactorEnable = await fastify.db.get("SELECT twoFactorEnable FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorEnable)
			return (null);
		return (twoFactorEnable);
	},

	set2FASecret: async function set2FASecret(fastify, email, secret) {
		console.log("email do set:", email, "secret do set:", secret);
		await fastify.db.run("UPDATE auth SET twoFactorSecret = ? WHERE email = ?", [ secret, email ]);
	},

	get2FASecret: async function get2FASecret(fastify, email) {
		const twoFactorSecret = await fastify.db.get("SELECT twoFactorSecret FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorSecret)
			return (null);
		return (twoFactorSecret);
	},

	get2FAValidate: async function get2FAValidate(fastify, email) {
		const twoFactorValidate = await fastify.db.get("SELECT twoFactorValidate FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorValidate)
			return (null);
		return (twoFactorValidate);
	},

	set2FAValidate: async function set2FAValidate(fastify, email, signal) {
		await fastify.db.run("UPDATE auth SET twoFactorValidate = ? WHERE email = ?", [ signal, email ]);
		return (true);
	},


	// Users configuration
	
	getIsOnline: async function getIsOnline(fastify, email) {
		const isOnline = await fastify.db.get("SELECT isOnline FROM users WHERE email = ?", [ email ]);
		if (!isOnline)
			return (null);
		return (isOnline);
	},

	setIsOnline: async function setIsOnline(fastify, data) {
		if (data.isOnline === true)
			await fastify.db.run("UPDATE users SET isOnline = ? WHERE user_id = ? AND isOnline = false", [ data.isOnline, data.user_id ]);
		else if (data.isOnline === false)
			await fastify.db.run("UPDATE users SET isOnline = ? WHERE user_id = ? AND isOnline = true", [ data.isOnline, data.user_id ]);
		return (true);
	},

	setInQueue: async function setInQueue(fastify, data) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ data.email ]);
		await fastify.db.run("UPDATE users SET inQueue = ? WHERE user_id = ?", [ data.inQueue, user_id.id ]);
		return (true);
	},

	getUserAvatar: async function getUserAvatar(fastify, data) {
		const avatar = await fastify.db.get("SELECT avatar FROM users WHERE user_id = ?", [ data.user_id ]);
		return (avatar ?? null);
	},

	setUserAvatar: async function setUserAvatar(fastify, data) {
		await fastify.db.run("UPDATE users SET avatar = ? WHERE user_id = ?", [ data.avatar, data.user_id ]);
		return (true);
	},

	setRank: async function setRank(fastify, data) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return (null);
		await fastify.db.run("UPDATE users SET rank = ? WHERE user_id = ?", [ data.rank, user_id.id ]);
		return (true);
	},

	getUserStatus: async function getUserStatus(fastify, data) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return ({});

		const status = await fastify.db.get("SELECT isOnline, inQueue, inGame FROM users WHERE user_id = ?", [ user_id.id ]);

		return (
			(status.inGame && "IN_GAME") ||
			(status.inQueue && "IN_QUEUE") ||
			(status.isOnline && "ONLINE") ||
			"OFFLINE"
		);
	},

	getInGame: async function getInGame(fastify, email) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ email ]);
		if (!user_id)
			return (null);
		const inGame = await fastify.db.get("SELECT inGame FROM users WHERE user_id = ?", [ user_id.id ]);
		return (inGame ?? null);
	},

	setInGame: async function setInGame(fastify, data) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return (null);
		await fastify.db.run("UPDATE users SET inGame = ? WHERE user_id = ?", [ data.inGame, user_id.id ]);
		return (true);
	},

	getUserInformation: async function getUserInformation(fastify, data) {
		const response = await fastify.db.get("SELECT * FROM users WHERE user_id = ?", [ data.user_id ]);
		return (response ?? null);
	},

	setUserTitle: async function setUserTitle(fastify, data) {
		await fastify.db.run("UPDATE users SET title = ? WHERE user_id = ?", [ data.title, data.user_id ]);
		return (true);
	},

	// Auth configuration

	getAuthData: async function getAuthData(fastify, data) {
		const result = await fastify.db.get("SELECT username, nickname, email FROM auth WHERE user_id = ?", [ data.user_id ]);
		return (result ?? {});
	},

	setAuthUsername: async function setAuthUsername(fastify, data) {
		await fastify.db.run("UPDATE auth SET username = ? WHERE user_id = ?", [ data.username, data.user_id ]);
		return (true);
	},

	setAuthNickname: async function setAuthNickname(fastify, data) {
		await fastify.db.run("UPDATE auth SET nickname = ? WHERE user_id = ?", [ data.nickname, data.user_id ]);
		return (true);
	},

	setAuthEmail: async function setAuthEmail(fastify, data) {
		await fastify.db.run("UPDATE auth SET email = ? WHERE user_id = ?", [ data.email, data.user_id ]);
		return (true);
	},

	setAuthPassword: async function setAuthPassword(fastify, data) {
		await fastify.db.run("UPDATE auth SET password = ? WHERE user_id = ?", [ data.password_hash, data.user_id ]);
		return (true);
	},

	setUserDescription: async function setUserDescription(fastify, data) {
		await fastify.db.run("UPDATE users SET description = ? WHERE user_id = ?", [ data.description, data.user_id ]);
		return (true);
	},

	getAllUsersInformation: async function getAllUsersInformation(fastify) {
		// We are using JOIN here to combine using a common element here the user_id from auth and also from users table
		const users = await fastify.db.all("SELECT users.*, auth.username FROM users JOIN auth ON auth.user_id = users.user_id");
		return (users ?? null);
	},

	getDataByPublicId: async function getAllUsersInformation(fastify, body) {
		const user_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ body.public_id ]);
		const data = await fastify.db.get("SELECT users.*, auth.username FROM users JOIN auth ON auth.user_id = users.user_id WHERE users.user_id = ?", [ user_id.user_id ]);
		return (data ?? null);
	},

	deleteUserAccount: async function deleteUserAccount(fastify, data) {
		await fastify.db.run("DELETE FROM auth WHERE user_id = ?", [ data.user_id ]);
		await fastify.db.run("DELETE FROM users WHERE user_id = ?", [ data.user_id ]);
		await fastify.db.run("DELETE FROM messages WHERE sender_id = ?", [ data.user_id ]);
		await fastify.db.run("DELETE FROM friends WHERE (owner_id = ?) OR (friend_id = ?)", [ data.user_id, data.user_id ]);
		return (true);
	},

	storeMessage: async function storeMessage(fastify, data) {
		await fastify.db.run("INSERT INTO messages (content, sender_id, isSystem) VALUES (?, ?, ?)", [ data.msg, data.user_id, data.isSystem ]);
		return (true);
	},

	getAllMessages: async function getAllMessages(fastify, owner) {
		const user_id = await fastify.db.get("SELECT user_id FROM auth WHERE username = ?", [ owner ]);
		const object = await fastify.db.all("SELECT messages.*, auth.username FROM messages JOIN auth ON auth.user_id = messages.sender_id WHERE NOT EXISTS ( SELECT 1 FROM blacklist WHERE (blacklist.owner_id = ? AND blacklist.target_id = messages.sender_id) OR (blacklist.target_id = ? AND blacklist.owner_id = messages.sender_id))", [ user_id, user_id ]);
		return (object ?? null);
	},

	blockTheUser: async function blockTheUser(fastify, data) {
		const target_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ]);
		if (!target_id || !target_id.user_id)
			throw new Error("USER_DOES_NOT_EXIST");
		if (target_id.user_id === data.user_id)
			return ("SAME_USER");
		const object = await fastify.db.get("SELECT * FROM blacklist WHERE owner_id = ? AND target_id = ?", [ data.user_id, target_id.user_id ]);
		if (object) {
			await fastify.db.run("DELETE FROM blacklist WHERE owner_id = ? AND target_id = ?", [ data.user_id, target_id.user_id ]);
		return ("Unblock");
	}
		await fastify.db.run("INSERT INTO blacklist (owner_id, target_id) VALUES (?, ?)", [ data.user_id, target_id.user_id ]);
		return ("Block");
	},

	friendInvite: async function friendInvite(fastify, data) {
		const friend_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ]);
		if (!friend_id || !friend_id.user_id)
			throw new Error("USER_DOES_NOT_EXIST");
		if (friend_id.user_id === data.user_id)
			throw new Error("SAME_USER");
		const object = await fastify.db.get("SELECT * FROM friends WHERE (owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)", [ friend_id.user_id, data.user_id, data.user_id, friend_id.user_id ]);
		if (object)
			return ("Already exists");
		await fastify.db.run("INSERT INTO friends (owner_id, friend_id) VALUES (?, ?), (?, ?)", [ data.user_id, friend_id.user_id, friend_id.user_id, data.user_id ]);
		return ("invited");
	},

	getAllFriends: async function getAllFriends(fastify, data) {
		const object = await fastify.db.all("SELECT friends.*, auth.username, users.isOnline, users.avatar, users.public_id FROM friends JOIN auth ON auth.user_id = friends.friend_id JOIN users ON users.user_id = friends.friend_id WHERE friends.owner_id = ? AND friends.accepted = TRUE AND EXISTS ( SELECT 1 FROM friends friends2 WHERE friends2.owner_id = friends.friend_id AND friends2.friend_id = friends.owner_id AND friends2.accepted = TRUE )", [ data.user_id ]);
		return (object ?? null);
	},

	getAllPendencies: async function getAllPendencies(fastify, data) {
		const object = await fastify.db.all("SELECT friends.*, auth.username, users.isOnline, users.avatar, users.public_id FROM friends JOIN auth ON auth.user_id = friends.owner_id JOIN users ON users.user_id = friends.owner_id WHERE friends.friend_id = ? AND friends.accepted = FALSE", [ data.user_id ]);
		return (object ?? null);
	},

	setAcceptFriend: async function setAcceptFriend(fastify, data) {
		const friend_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ]);
		if (!friend_id || !friend_id.user_id)
			throw new Error("USER_DOES_NOT_EXIST");
		if (friend_id.user_id === data.user_id)
			throw new Error("SAME_USER");
		await fastify.db.run("UPDATE friends SET accepted = ? WHERE friend_id = ? AND owner_id = ?", [ data.accept, data.user_id, friend_id.user_id ]);
		const match = await fastify.db.get("SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true", [ friend_id.user_id, data.user_id ]);
		const match2 = await fastify.db.get("SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true", [ data.user_id, friend_id.user_id ]);
		if (match && match2) {
			await fastify.db.run("UPDATE users SET friends = friends + 1 WHERE (user_id = ?) OR (user_id = ?)", [ friend_id.user_id, data.user_id ]);
		}
		return (true);
	},

	deleteAFriend: async function deleteAFriend(fastify, data) {
		const friend_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ]);
		if (!friend_id || !friend_id.user_id)
			throw new Error("USER_DOES_NOT_EXIST");
		if (friend_id.user_id === data.user_id)
			throw new Error("SAME_USER");
		const match = await fastify.db.get("SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true", [ friend_id.user_id, data.user_id ]);
		const match2 = await fastify.db.get("SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true", [ data.user_id, friend_id.user_id ]);
		if (match && match2)
			await fastify.db.run("UPDATE users SET friends = friends - 1 WHERE (user_id = ?) OR (user_id = ?)", [ friend_id.user_id, data.user_id ]);
		await fastify.db.run("DELETE FROM friends WHERE (friend_id = ? AND owner_id = ?) OR (friend_id = ? AND owner_id = ?)", [ friend_id.user_id, data.user_id, data.user_id, friend_id.user_id ]);
		return (true);
	},

	getAllBlacklist: async function getAllBlacklist(fastify, data) {
		const blacklist = await fastify.db.all("SELECT blacklist.*, owner.username AS owner_username, target.username AS target_username FROM blacklist JOIN auth AS owner ON blacklist.owner_id = owner.user_id JOIN auth AS target ON blacklist.target_id = target.user_id");
		return (blacklist ?? null);
	},

	getPrivateMessages: async function getAllPrivateMessages(fastify, data) {
		const getter = await fastify.db.get("SELECT user_id FROM auth WHERE username = ?", [ data.username ]);
		const sender_id = getter.user_id;
		const receiver_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ])
		const privateMessages = await fastify.db.all(`SELECT privateMessages.*, sender.username AS sender_username FROM privateMessages JOIN auth AS sender ON sender.user_id = privateMessages.sender_id WHERE (privateMessages.sender_id = ? AND privateMessages.receiver_id = ?) OR (privateMessages.sender_id = ? AND privateMessages.receiver_id = ?)`, [ sender_id, receiver_id, receiver_id, sender_id ]);
		return (privateMessages ?? []);
	},

	storePrivateMessage: async function storePrivateMessage(fastify, data) {
		const getter = await fastify.db.get("SELECT user_id FROM auth WHERE username = ?", [ data.username ]);
		const sender_id = getter.user_id;
		const receiver_id = await fastify.db.get("SELECT user_id FROM users WHERE public_id = ?", [ data.public_id ])
		await fastify.db.run(`INSERT INTO privateMessages (sender_id, content, receiver_id) VALUES (?,?,?)`, [ sender_id, data.msg, receiver_id ]);
		return (true);
	}
}

export default databaseModels;
