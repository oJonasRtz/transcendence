import bcrypt from "bcrypt";
import { stat } from "node:fs";
import { randomUUID } from "crypto";
import { nanoid } from "nanoid";

const XP_PER_LEVEL = 500;

const databaseModels = {
  getUserData: async function getUserData(fastify, email) {
    let object = await fastify.db.get(
      "SELECT username, user_id FROM auth WHERE email = ?",
      [email]
    );
    if (!object) object = null;
    return object;
  },

  addHistory: async function addHistory(fastify, data) {
    const {matchId, players, time} = data;

    const result = await fastify.db.run(
      "INSERT INTO history (match_id, created_at, duration, game_type) VALUES (?, ?, ?, ?)",
      [matchId, time.startedAt, time.duration, 'RANKED']
    );

    const history_id = result.lastID;

    const insertPlayers = await fastify.db.prepare(
      "INSERT INTO history_players (history_id, user_id, score, isWinner) VALUES (?, ?, ?, ?)"
    );

    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      await insertPlayers.run([
        history_id,
        player.id,
        i + 1,
        player.score,
        player.winner,
      ]);
    }

    await insertPlayers.finalize();

    return true;
  },

  getHistory: async function getHistory(fastify, user_id, limit = 20) {
    const rows = await fastify.db.all(`
      SELECT 
        h.id AS history_id,
        h.match_id,
        h.created_at,
        h.game_type,
        h.duration,
        hp.user_id,
        hp.score,
        hp.isWinner,
        a.nickname,
        u.avatar,
        u.public_id
      FROM history h
      JOIN history_players hp ON hp.history_id = h.id
      JOIN auth a ON a.user_id = hp.user_id
      JOIN users u ON u.user_id = hp.user_id
      WHERE h.id IN (
        SELECT history_id FROM history_players WHERE user_id = ?
      )
      ORDER BY h.created_at DESC
    `, [user_id]
    );

    const historyMap = new Map();
    let   total = 0;
    let   wins = 0;
    
    rows.forEach(row => {
      if (!historyMap.has(row.history_id)) {
        historyMap.set(row.history_id, {
          match_id: row.match_id,
          created_at: row.created_at,
          game_type: row.game_type,
          duration: row.duration,
          players: [],
          isVictory: false
        });
      }

      const game = historyMap.get(row.history_id);

      game.players.push({
        user_id: row.user_id,
        public_id: row.public_id,
        name: row.nickname,
        score: row.score,
        avatar: row.avatar,
      });

      if (row.user_id === user_id) {
        total++;
        if (row.isWinner){
          wins++;
          game.isVictory = true;
        }
      }
    });

    const losses = total - wins;
    const win_rate = total > 0 ? Number((wins / total * 100).toFixed(2)) : 0;

    return {
      stats: {
        total_games: total,
        wins,
        losses,
        win_rate
      },
      history: Array.from(historyMap.values()).slice(0, limit)
    };
  },

  getUserPassword: async function getUserPassword(fastify, email) {
    let object = await fastify.db.get(
      "SELECT password from auth WHERE email = ?",
      [email]
    );
    if (!object) object = null;
    return object;
  },

  registerNewUser: async function registerNewUser(
    fastify,
    data,
    password_hash
  ) {
    await fastify.db.run(
      "INSERT INTO auth (user_id, username, nickname, password, email, twoFactorEnable) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.user_id,
        data.username,
        data.nickname,
        password_hash,
        data.email,
        data.is2faEnable,
      ]
    );
  },

  checkEmail: async function checkEmail(fastify, email) {
    const match = await fastify.db.get(
      "SELECT email FROM auth WHERE email = ?",
      [email]
    );
    return match ?? null;
  },

  getPassword: async function getPassword(fastify, email) {
    const object = await fastify.db.get(
      "SELECT password FROM auth WHERE email = ?",
      [email]
    );
    return object ?? null;
  },

  newPassword: async function newPassword(fastify, email, password_hash) {
    await fastify.db.run("UPDATE auth SET password = ? WHERE email = ?", [
      password_hash,
      email,
    ]);
    return true;
  },

  getUserId: async function getUserId(fastify, username) {
    const user_id = await fastify.db.get(
      "SELECT user_id FROM auth WHERE username = ?",
      [username]
    );
    return user_id.user_id ?? null;
  },

  createNewUser: async function createNewUser(fastify, user_id) {
    const nanoId = nanoid();
    await fastify.db.run(
      "INSERT INTO users (user_id, public_id) VALUES (?, ?)",
      [user_id, nanoId]
    );
  },

  activateEmail: async function validateUserEmail(fastify, data) {
    await fastify.db.run(
      "UPDATE users SET isEmailConfirmed = ? WHERE user_id = ?",
      [data.stats, data.user_id]
    );
  },

  get2FAEnable: async function get2FAEnable(fastify, email) {
    const twoFactorEnable = await fastify.db.get(
      "SELECT twoFactorEnable FROM auth WHERE email = ?",
      [email]
    );
    if (!twoFactorEnable) return null;
    return twoFactorEnable;
  },

  set2FASecret: async function set2FASecret(fastify, email, secret) {
    await fastify.db.run(
      "UPDATE auth SET twoFactorSecret = ? WHERE email = ?",
      [secret, email]
    );
  },

  get2FASecret: async function get2FASecret(fastify, email) {
    const twoFactorSecret = await fastify.db.get(
      "SELECT twoFactorSecret FROM auth WHERE email = ?",
      [email]
    );
    if (!twoFactorSecret) return null;
    return twoFactorSecret;
  },

  get2FAValidate: async function get2FAValidate(fastify, email) {
    const twoFactorValidate = await fastify.db.get(
      "SELECT twoFactorValidate FROM auth WHERE email = ?",
      [email]
    );
    if (!twoFactorValidate) return null;
    return twoFactorValidate;
  },

  set2FAValidate: async function set2FAValidate(fastify, email, signal) {
    await fastify.db.run(
      "UPDATE auth SET twoFactorValidate = ? WHERE email = ?",
      [signal, email]
    );
    return true;
  },

  // Users configuration

  getIsOnline: async function getIsOnline(fastify, email) {
    const isOnline = await fastify.db.get(
      "SELECT isOnline FROM users WHERE email = ?",
      [email]
    );
    if (!isOnline) return null;
    return isOnline;
  },

  setIsOnline: async function setIsOnline(fastify, data) {
    const STATUS = {
      true: 'IDLE',
      false: 'OFFLINE',
    };

    try {
      const {isOnline, user_id} = data;
      if (user_id === undefined || isOnline === undefined)
        throw new Error("MISSING_PARAMETERS");

      const online =  !!isOnline;

      await fastify.db.run(
        "UPDATE users SET isOnline = ?, state = ? WHERE user_id = ?",
        [online, STATUS[online], user_id]
      );
      return true;
    } catch (error) {
      console.error("setIsOnline error:", error);
      return null;
    }

    // if (data.isOnline === true)
    //   await fastify.db.run(
    //     "UPDATE users SET isOnline = ? WHERE user_id = ? AND isOnline = false",
    //     [data.isOnline, data.user_id]
    //   );
    // else if (data.isOnline === false)
    //   await fastify.db.run(
    //     "UPDATE users SET isOnline = ? WHERE user_id = ? AND isOnline = true",
    //     [data.isOnline, data.user_id]
    //   );

    // return true;
  },


  getUserAvatar: async function getUserAvatar(fastify, data) {
    const avatar = await fastify.db.get(
      "SELECT avatar FROM users WHERE user_id = ?",
      [data.user_id]
    );
    return avatar ?? null;
  },

  setUserAvatar: async function setUserAvatar(fastify, data) {
    await fastify.db.run("UPDATE users SET avatar = ? WHERE user_id = ?", [
      data.avatar,
      data.user_id,
    ]);
    return true;
  },

  setUserState: async function setUserState(fastify, data) {
	const row = await fastify.db.get(
		"SELECT user_id FROM auth WHERE email = ?",
		[data.email]
	);

	if (!row?.user_id) return false;

	await fastify.db.run(
		"UPDATE users SET state = ? WHERE user_id = ?",
		[data.state, row.user_id]
	)
	return true;
  },

  setRank: async function setRank(fastify, data) {
    try {
      const {user_id, rank} = data;
      if (user_id === undefined || rank === undefined)
        throw new Error("MISSING_PARAMETERS");

      const info = await this.getUserInformationRaw(fastify, { user_id });
      let newRank = (info.rank ?? 0) + rank;

      if (newRank < 0) newRank = 0;

      await fastify.db.run(
        "UPDATE users SET rank = ? WHERE user_id = ?",
        [newRank, user_id]
      );
      return true;
    } catch (error) {
      console.error("setRank error:", error);
      return null;
    }
  },

  getRank: async function getRank(fastify, user_id) {
    const info = await this.getUserInformationRaw(fastify, { user_id });
    if (!info) return {rank: 0, rank_points: 0, tier: 'BRONZE'};

    const RANKS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER'];
    const POINTS_PER_RANK = 100;

    const mmr = info?.rank ?? 0;
    const tierIndex = Math.min(Math.floor(mmr / POINTS_PER_RANK), RANKS.length - 1);
    const tier = RANKS[tierIndex];
    const rank_points = tierIndex < RANKS.length - 1
              ? mmr % POINTS_PER_RANK
              : mmr - POINTS_PER_RANK * (RANKS.length - 1);

    return {
      rank: mmr,
      tier,
      rank_points,
    };
  },

  getUserInformationRaw: async function getUserInformationRaw(fastify, data) {
    const response = await fastify.db.get(
      `SELECT users.*, auth.nickname
      FROM users
      JOIN auth ON auth.user_id = users.user_id
      WHERE users.user_id = ?
      `,
      [data.user_id]
    );
    return response ?? null;
  },

  getUserExperience: async function getUserExperience(fastify, user_id) {
    const TITLES = [
      'Rookie',
      'Fresh Blood',
      'Trainee',
      'Fighter',
      'Duelist',
      'Striker',
      'Veteran',
      'Champion',
      'Elite',
      'Legend',
      'Imortal'
    ];

    const info = await this.getUserInformationRaw(fastify, { user_id });
    if (!info)
      return {
        level: 1,
        experience_points: 0,
        title: TITLES[0],
        experience_to_next_level: XP_PER_LEVEL
      };

    let xp = info.experience_points ?? 0;
    let level = 1;
    

    while(xp >= XP_PER_LEVEL) {
      level++;
      xp -= XP_PER_LEVEL;
    }
    const titleIndex = Math.min(level - 1, TITLES.length - 1);
    const title = TITLES[titleIndex];

    return {
      level,
      experience_points: xp,
      title,
      experience_to_next_level: Math.max(0, XP_PER_LEVEL - xp)
    }
  },

  getUserInformation: async function getUserInformation(fastify, data) {
    const user = await this.getUserInformationRaw(fastify, data);
    if (!user) return null;

    const rankData = await this.getRank(fastify, data.user_id);
    const xpData = await this.getUserExperience(fastify, data.user_id);
    
    return {
      ...user,
      tier: rankData.tier,
      rank: rankData.rank,
      rank_points: rankData.rank_points,
      level: xpData.level,
      experience_points: xpData.experience_points,
      title: xpData.title,
      experience_to_next_level: xpData.experience_to_next_level
    };
  },

  setUserExperience: async function setUserExperience(fastify, data) {
    try {
      const {user_id, experience} = data;
      if (user_id === undefined || experience === undefined)
        throw new Error("MISSING_PARAMETERS");

      const info = await this.getUserInformationRaw(fastify, { user_id });
      let newXp = experience + (info.experience_points ?? 0);

      await fastify.db.run(
        `UPDATE users SET experience_points = ? WHERE user_id = ?`,
        [ newXp, user_id ]
      );

      return true;
    } catch (error) {
      console.error("setUserExperience error:", error);
      return null;
    }
  },

  // Auth configuration

  getAuthData: async function getAuthData(fastify, data) {
    const result = await fastify.db.get(
      "SELECT username, nickname, email FROM auth WHERE user_id = ?",
      [data.user_id]
    );
    return result ?? {};
  },

  setAuthUsername: async function setAuthUsername(fastify, data) {
    await fastify.db.run("UPDATE auth SET username = ? WHERE user_id = ?", [
      data.username,
      data.user_id,
    ]);
    return true;
  },

  setAuthNickname: async function setAuthNickname(fastify, data) {
    await fastify.db.run("UPDATE auth SET nickname = ? WHERE user_id = ?", [
      data.nickname,
      data.user_id,
    ]);
    return true;
  },

  setAuthEmail: async function setAuthEmail(fastify, data) {
    const existing = await fastify.db.get(
      "SELECT user_id FROM auth WHERE email = ?",
      [data.email]
    );
    if (existing && existing.user_id !== data.user_id) {
      const error = new Error("EMAIL_IN_USE");
      error.statusCode = 409;
      throw error;
    }
    await fastify.db.run("UPDATE auth SET email = ? WHERE user_id = ?", [
      data.email,
      data.user_id,
    ]);
    return true;
  },

  setAuthPassword: async function setAuthPassword(fastify, data) {
    await fastify.db.run("UPDATE auth SET password = ? WHERE user_id = ?", [
      data.password_hash,
      data.user_id,
    ]);
    return true;
  },

  setUserDescription: async function setUserDescription(fastify, data) {
    await fastify.db.run("UPDATE users SET description = ? WHERE user_id = ?", [
      data.description,
      data.user_id,
    ]);
    return true;
  },

  getAllUsersInformation: async function getAllUsersInformation(fastify) {
    // We are using JOIN here to combine using a common element here the user_id from auth and also from users table
    const users = await fastify.db.all(
      "SELECT users.*, auth.username FROM users JOIN auth ON auth.user_id = users.user_id"
    );
    return users ?? null;
  },

  // getDataByPublicId: async function getAllUsersInformation(fastify, body) {
  //   const user_id = await fastify.db.get(
  //     "SELECT user_id FROM users WHERE public_id = ?",
  //     [body.public_id]
  //   );
  //   // const data = await fastify.db.get(
  //   //   "SELECT users.*, auth.username FROM users JOIN auth ON auth.user_id = users.user_id WHERE users.user_id = ?",
  //   //   [user_id.user_id]
  //   // );
  //   const data = await fastify.db.get(
  //     `SELECT users.*, auth.username, auth.email
  //      FROM users 
  //      JOIN auth ON auth.user_id = users.user_id
  //      WHERE users.user_id = ?`,
  //     [user_id.user_id]
  //   );
    
  //   return data ?? null;
  // },

  getDataByPublicId: async function getAllUsersInformation(fastify, body) {
    const user = await fastify.db.get(
      'SELECT user_id FROM users WHERE public_id = ?',
      [body.public_id]
    );

    if (!user?.user_id) return null;

    const baseUser = await this.getUserInformationRaw(fastify, { user_id: user.user_id });
    if (!baseUser) return null;

    const authData = await fastify.db.get(
      'SELECT username, email FROM auth WHERE user_id = ?',
      [user.user_id]
    );

    const rankData = await this.getRank(fastify, user.user_id);
    const xpData = await this.getUserExperience(fastify, user.user_id);

    return {
      ...baseUser,
      ...authData,
      tier: rankData.tier,
      rank: rankData.rank,
      rank_points: rankData.rank_points,
      level: xpData.level,
      experience_points: xpData.experience_points,
      title: xpData.title,
      experience_to_next_level: xpData.experience_to_next_level
    }
  },
  

  deleteUserAccount: async function deleteUserAccount(fastify, data) {
    await fastify.db.run("DELETE FROM auth WHERE user_id = ?", [data.user_id]);
    await fastify.db.run("DELETE FROM users WHERE user_id = ?", [data.user_id]);
    await fastify.db.run("DELETE FROM messages WHERE sender_id = ?", [
      data.user_id,
    ]);
    await fastify.db.run(
      "DELETE FROM friends WHERE (owner_id = ?) OR (friend_id = ?)",
      [data.user_id, data.user_id]
    );
    return true;
  },

  storeMessage: async function storeMessage(fastify, data) {
    await fastify.db.run(
      "INSERT INTO messages (content, sender_id, isLink, avatar, isSystem) VALUES (?, ?, ?, ?, ?)",
      [data.msg, data.user_id, data.isLink, data.avatar, data.isSystem]
    );
    return true;
  },

  getAllMessages: async function getAllMessages(fastify, owner) {
    const user_id = await fastify.db.get(
      "SELECT user_id FROM auth WHERE username = ?",
      [owner]
    );
    const object = await fastify.db.all(
      "SELECT messages.*, auth.username FROM messages JOIN auth ON auth.user_id = messages.sender_id",
      [user_id, user_id]
    );
    return object ?? null;
    /*
     *WHERE NOT EXISTS ( SELECT 1 FROM blacklist WHERE (blacklist.owner_id = ? AND blacklist.target_id = messages.sender_id) OR (blacklist.target_id = ? AND blacklist.owner_id = messages.sender_id))"
     * */
  },

  blockTheUser: async function blockTheUser(fastify, data) {
    const target_id = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    if (!target_id || !target_id.user_id)
      throw new Error("USER_DOES_NOT_EXIST");
    if (target_id.user_id === data.user_id) return "SAME_USER";
    const object = await fastify.db.get(
      "SELECT * FROM blacklist WHERE owner_id = ? AND target_id = ?",
      [data.user_id, target_id.user_id]
    );
    if (object) {
      await fastify.db.run(
        "DELETE FROM blacklist WHERE owner_id = ? AND target_id = ?",
        [data.user_id, target_id.user_id]
      );
      return "Unblock";
    }
    await fastify.db.run(
      "INSERT INTO blacklist (owner_id, target_id) VALUES (?, ?)",
      [data.user_id, target_id.user_id]
    );
    return "Block";
  },

  friendInvite: async function friendInvite(fastify, data) {
    const friend_id = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    if (!friend_id || !friend_id.user_id)
      throw new Error("USER_DOES_NOT_EXIST");
    if (friend_id.user_id === data.user_id) throw new Error("SAME_USER");
    const object = await fastify.db.get(
      "SELECT * FROM friends WHERE (owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)",
      [friend_id.user_id, data.user_id, data.user_id, friend_id.user_id]
    );
    if (object) return "Already exists";
    await fastify.db.run(
      "INSERT INTO friends (owner_id, friend_id) VALUES (?, ?), (?, ?)",
      [data.user_id, friend_id.user_id, friend_id.user_id, data.user_id]
    );
    return "invited";
  },

  getAllFriends: async function getAllFriends(fastify, data) {
    const object = await fastify.db.all(
      "SELECT friends.*, auth.username, users.isOnline, users.avatar, users.public_id FROM friends JOIN auth ON auth.user_id = friends.friend_id JOIN users ON users.user_id = friends.friend_id WHERE friends.owner_id = ? AND friends.accepted = TRUE AND EXISTS ( SELECT 1 FROM friends friends2 WHERE friends2.owner_id = friends.friend_id AND friends2.friend_id = friends.owner_id AND friends2.accepted = TRUE )",
      [data.user_id]
    );
    return object ?? null;
  },

  getAllPendencies: async function getAllPendencies(fastify, data) {
    const object = await fastify.db.all(
      "SELECT friends.*, auth.username, users.isOnline, users.avatar, users.public_id FROM friends JOIN auth ON auth.user_id = friends.owner_id JOIN users ON users.user_id = friends.owner_id WHERE friends.friend_id = ? AND friends.accepted = FALSE",
      [data.user_id]
    );
    return object ?? null;
  },

  setAcceptFriend: async function setAcceptFriend(fastify, data) {
    const friend_id = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    if (!friend_id || !friend_id.user_id)
      throw new Error("USER_DOES_NOT_EXIST");
    if (friend_id.user_id === data.user_id) throw new Error("SAME_USER");
    await fastify.db.run(
      "UPDATE friends SET accepted = ? WHERE friend_id = ? AND owner_id = ?",
      [data.accept, data.user_id, friend_id.user_id]
    );
    const match = await fastify.db.get(
      "SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true",
      [friend_id.user_id, data.user_id]
    );
    const match2 = await fastify.db.get(
      "SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true",
      [data.user_id, friend_id.user_id]
    );
    if (match && match2) {
      await fastify.db.run(
        "UPDATE users SET friends = friends + 1 WHERE (user_id = ?) OR (user_id = ?)",
        [friend_id.user_id, data.user_id]
      );
    }
    return true;
  },

  deleteAFriend: async function deleteAFriend(fastify, data) {
    const friend_id = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    if (!friend_id || !friend_id.user_id)
      throw new Error("USER_DOES_NOT_EXIST");
    if (friend_id.user_id === data.user_id) throw new Error("SAME_USER");
    const match = await fastify.db.get(
      "SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true",
      [friend_id.user_id, data.user_id]
    );
    const match2 = await fastify.db.get(
      "SELECT * FROM friends WHERE owner_id = ? AND friend_id = ? AND accepted = true",
      [data.user_id, friend_id.user_id]
    );
    if (match && match2)
      await fastify.db.run(
        "UPDATE users SET friends = friends - 1 WHERE (user_id = ?) OR (user_id = ?)",
        [friend_id.user_id, data.user_id]
      );
    await fastify.db.run(
      "DELETE FROM friends WHERE (friend_id = ? AND owner_id = ?) OR (friend_id = ? AND owner_id = ?)",
      [friend_id.user_id, data.user_id, data.user_id, friend_id.user_id]
    );
    return true;
  },

  getAllBlacklist: async function getAllBlacklist(fastify, data) {
    const blacklist = await fastify.db.all(
      "SELECT blacklist.*, owner.username AS owner_username, target.username AS target_username FROM blacklist JOIN auth AS owner ON blacklist.owner_id = owner.user_id JOIN auth AS target ON blacklist.target_id = target.user_id"
    );
    return blacklist ?? null;
  },

  getPrivateMessages: async function getAllPrivateMessages(fastify, data) {
    const sender_id = data.user_id;
    const getTwo = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    const receiver_id = getTwo.user_id;

    if (!sender_id || !receiver_id) return [];

    const privateMessages = await fastify.db.all(
      `

		SELECT privateMessages.*, sender.username AS sender_username 
		FROM privateMessages 
		JOIN auth AS sender ON sender.user_id = privateMessages.sender_id 
		WHERE (
			(privateMessages.sender_id = ? AND privateMessages.receiver_id = ?) 
			OR 
			(privateMessages.sender_id = ? AND privateMessages.receiver_id = ?)
		)`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    return privateMessages ?? [];
  },

  storePrivateMessage: async function storePrivateMessage(fastify, data) {
    const sender_id = data.user_id;
    const getTwo = await fastify.db.get(
      "SELECT user_id FROM users WHERE public_id = ?",
      [data.public_id]
    );
    const receiver_id = getTwo.user_id;

    const isBlock = await fastify.db.get(
      `
				SELECT 1
				FROM blacklist
				WHERE (
					(blacklist.owner_id = ? AND blacklist.target_id = ?)
				OR
					(blacklist.owner_id = ? AND blacklist.target_id = ?)
				)
			`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );

    if (!isBlock) {
      await fastify.db.run(
        `INSERT INTO privateMessages (sender_id, content, avatar, isLink, receiver_id) VALUES (?,?,?,?,?)`,
        [sender_id, data.msg, data.avatar, data.isLink, receiver_id]
      );
      return true;
    }
    return false;
  },

  set2FAOnOff: async function set2FAOnOff(fastify, data) {
    try {
      const stat = await fastify.db.get(
        "SELECT twoFactorEnable FROM auth WHERE user_id = ?",
        [data.user_id]
      );
      if (stat?.twoFactorEnable) {
        await fastify.db.run(
          "UPDATE auth SET twoFactorEnable = false, twoFactorSecret = null WHERE user_id = ?",
          [data.user_id]
        );
        return "2FA_DISABLED";
      }
      await fastify.db.run(
        "UPDATE auth SET twoFactorEnable = true WHERE user_id = ?",
        [data.user_id]
      );
      return "2FA_ENABLED";
    } catch (err) {
      console.error("SQLITE-DB MODELS set2FAOnOff ERROR:", err.message);
      return "An error happened";
    }
  },

  setTargetId: async function setTargetId(fastify, data) {
    try {
      const user_id = await fastify.db.get(
        "SELECT user_id FROM users WHERE public_id = ?",
        [data.public_id]
      );
      await fastify.db.run("UPDATE users SET target_id = ? WHERE user_id = ?", [
        user_id.user_id,
        data.user_id,
      ]);
      return true;
    } catch (err) {
      console.error(
        "MODELS setTargetId ERROR:",
        err?.response?.data || err.message
      );
      return false;
    }
  },

  getTargetId: async function getTargetId(fastify, data) {
    try {
      const response = await fastify.db.get(
        "SELECT target_id FROM users WHERE public_id = ?",
        [data.public_id]
      );
      return response ?? null;
    } catch (err) {
      console.error(
        "MODELS getTargetId ERROR:",
        err?.response?.data || err.message
      );
      return null;
    }
  },

  getPublicId: async function getPublicId(fastify, data) {
    try {
      const res = await fastify.db.get(
        "SELECT public_id FROM users WHERE user_id = ?",
        [data.user_id]
      );
      return res ?? null;
    } catch (err) {
      console.error(
        "MODELS getPublicId ERROR:",
        err?.response?.data || err.message
      );
      return null;
    }
  },
};

export default databaseModels;
