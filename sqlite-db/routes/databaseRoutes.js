import axios from 'axios';
import databaseControllers from '../controllers/databaseControllers.js';

// SQLITE-DB ROUTES

export default async function databaseRoutes(fastify, options) {
	// TESTS
	fastify.get("/hello", databaseControllers.hello);

	// SETTERS
	fastify.post("/registerNewUser", async (req, reply) => {
		return databaseControllers.registerNewUser(fastify, req, reply);
	});

	fastify.post("/tryLoginTheUser", async (req, reply) => {
		return databaseControllers.tryLoginTheUser(fastify, req, reply);
	});

	fastify.post("/getUserData", async (req, reply) => {
		return databaseControllers.getUserData(fastify, req, reply);
	});

	fastify.post('/getMatchId', async (req, reply) => {
		return databaseControllers.getMatchId(fastify, req, reply);
	});

	fastify.post('/setMatchId', async (req, reply) => {
		return databaseControllers.setMatchId(fastify, req, reply);
	});

	fastify.post("/getUserStatus", async (req, reply) => {
		return databaseControllers.getUserStatus(fastify, req, reply);
	});

	fastify.post("/checkEmail", async (req, reply) => {
		return databaseControllers.checkEmail(fastify, req, reply);
	});

	fastify.post("/newPassword", async (req, reply) => {
		return databaseControllers.newPassword(fastify, req, reply);
	});

	fastify.post("/createNewUser", async (req, reply) => {
		return databaseControllers.createNewUser(fastify, req, reply);
	});

	fastify.post("/validateUserEmail", async (req, reply) => {
		return databaseControllers.validateUserEmail(fastify, req, reply);
	});

	fastify.post("/getQueue", async (req, reply) => {
		return databaseControllers.getQueue(fastify, req, reply);
	});

	fastify.post("/setInQueue", async (req, reply) => {
		return databaseControllers.setInQueue(fastify, req, reply);
	});

	fastify.post("/get2FAEnable", async (req, reply) => {
		return databaseControllers.get2FAEnable(fastify, req, reply);
	});

	fastify.post("/setRank", async (req, reply) => {
		return databaseControllers.setRank(fastify, req, reply);
	});

	fastify.post("/get2FASecret", async (req, reply) => {
		return databaseControllers.get2FASecret(fastify, req, reply);
	});

	fastify.post("/getInGame", async (req, reply) => {
		return databaseControllers.getInGame(fastify, req, reply);
	});

	fastify.post("/setInGame", async (req, reply) => {
		return databaseControllers.setInGame(fastify, req, reply);
	});

	fastify.post("/set2FASecret", async (req, reply) => {
		return databaseControllers.set2FASecret(fastify, req, reply);
	});

	fastify.post("/get2FAValidate", async (req, reply) => {
		return databaseControllers.get2FAValidate(fastify, req, reply);
	});

	fastify.post("/set2FAValidate", async (req, reply) => {
		return databaseControllers.set2FAValidate(fastify, req, reply);
	});

	fastify.post("/getIsOnline", async (req, reply) => {
		return databaseControllers.getIsOnline(fastify, req, reply);
	});

	fastify.post("/setIsOnline", async (req, reply) => {
		return databaseControllers.setIsOnline(fastify, req, reply);
	});

	fastify.post("/getUserAvatar", async (req, reply) => {
		return databaseControllers.getUserAvatar(fastify, req, reply);
	});

	fastify.post("/setUserAvatar", async (req, reply) => {
		return databaseControllers.setUserAvatar(fastify, req, reply);
	});

	fastify.post("/getUserInformation", async (req, reply) => {
		return databaseControllers.getUserInformation(fastify, req, reply)
	});

	fastify.post("/setUserDescription", async (req, reply) => {
		return databaseControllers.setUserDescription(fastify, req, reply);
	});

	fastify.post("/setUserExperience", async (req, reply) => {
		return databaseControllers.setUserExperience(fastify, req, reply);
	});

	fastify.post("/setUserFriends", async (req, reply) => {
		return databaseControllers.setUserFriends(fastify, req, reply);
	});

	fastify.post("/setUserWins", async (req, reply) => {
		return databaseControllers.setUserWins(fastify, req, reply);
	});

	fastify.post("/setUserLosses", async (req, reply) => {
		return databaseControllers.setUserLosses(fastify, req, reply);
	});

	fastify.post("/setUserTitle", async (req, reply) => {
		return databaseControllers.setUserTitle(fastify, req, reply);
	});

	fastify.post("/getAuthData", async (req, reply) => {
		return databaseControllers.getAuthData(fastify, req, reply);
	});

	fastify.post("/setAuthUsername", async (req, reply) => {
		return databaseControllers.setAuthUsername(fastify, req, reply);
	});

	fastify.post("/setAuthNickname", async (req, reply) => {
		return databaseControllers.setAuthNickname(fastify, req, reply);
	});

	fastify.post("/setAuthEmail", async (req, reply) => {
		return databaseControllers.setAuthEmail(fastify, req, reply);
	});

	fastify.post("/setAuthPassword", async (req, reply) => {
		return databaseControllers.setAuthPassword(fastify, req, reply);
	});

	fastify.post("/setUsersDescription", async (req, reply) => {
		return databaseControllers.setUsersDescription(fastify, req, reply);
	});
};
