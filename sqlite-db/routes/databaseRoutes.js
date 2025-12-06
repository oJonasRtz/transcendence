import axios from 'axios';
import databaseControllers from '../controllers/databaseControllers.js';

// SQLITE-DB ROUTES

const routes = [
	{ method: 'GET', url: '/hello', handler: databaseControllers.hello },
	{ method: 'POST', url: '/registerNewUser', handler: databaseControllers.registerNewUser },
	{ method: 'POST', url: '/tryLoginTheUser', handler: databaseControllers.tryLoginTheUser },
	{ method: 'POST', url: '/getUserData', handler: databaseControllers.getUserData },
	{ method: 'POST', url: '/getMatchId', handler: databaseControllers.getMatchId },
	{ method: 'POST', url: '/setMatchId', handler: databaseControllers.setMatchId },
	{ method: 'POST', url: '/getUserStatus', handler: databaseControllers.getUserStatus },
	{ method: 'POST', url: '/checkEmail', handler: databaseControllers.checkEmail },
	{ method: 'POST', url: '/newPassword', handler: databaseControllers.newPassword },
	{ method: 'POST', url: '/createNewUser', handler: databaseControllers.createNewUser },
	{ method: 'POST', url: '/validateUserEmail', handler: databaseControllers.validateUserEmail },
	{ method: 'POST', url: '/getQueue', handler: databaseControllers.getQueue },
	{ method: 'POST', url: '/setInQueue', handler: databaseControllers.setInQueue },
	{ method: 'POST', url: '/get2FAEnable', handler: databaseControllers.get2FAEnable },
	{ method: 'POST', url: '/setRank', handler: databaseControllers.setRank },
	{ method: 'POST', url: '/get2FASecret', handler: databaseControllers.get2FASecret },
	{ method: 'POST', url: '/getInGame', handler: databaseControllers.getInGame },
	{ method: 'POST', url: '/setInGame', handler: databaseControllers.setInGame },
	{ method: 'POST', url: '/set2FASecret', handler: databaseControllers.set2FASecret },
	{ method: 'POST', url: '/get2FAValidate', handler: databaseControllers.get2FAValidate },
	{ method: 'POST', url: '/set2FAValidate', handler: databaseControllers.set2FAValidate },
	{ method: 'POST', url: '/getIsOnline', handler: databaseControllers.getIsOnline },
	{ method: 'POST', url: '/setIsOnline', handler: databaseControllers.setIsOnline },
	{ method: 'POST', url: '/getUserAvatar', handler: databaseControllers.getUserAvatar },
	{ method: 'POST', url: '/setUserAvatar', handler: databaseControllers.setUserAvatar },
	{ method: 'POST', url: '/getUserInformation', handler: databaseControllers.getUserInformation },
	{ method: 'POST', url: '/setUserDescription', handler: databaseControllers.setUserDescription },
	{ method: 'POST', url: '/setUserExperience', handler: databaseControllers.setUserExperience },
	{ method: 'POST', url: '/setUserFriends', handler: databaseControllers.setUserFriends },
	{ method: 'POST', url: '/setUserWins', handler: databaseControllers.setUserWins },
	{ method: 'POST', url: '/setUserLosses', handler: databaseControllers.setUserLosses },
	{ method: 'POST', url: '/setUserTitle', handler: databaseControllers.setUserTitle },
	{ method: 'POST', url: '/getAuthData', handler: databaseControllers.getAuthData },
	{ method: 'POST', url: '/setAuthUsername', handler: databaseControllers.setAuthUsername },
	{ method: 'POST', url: '/setAuthNickname', handler: databaseControllers.setAuthNickname },
	{ method: 'POST', url: '/setAuthEmail', handler: databaseControllers.setAuthEmail },
	{ method: 'POST', url: '/setAuthPassword', handler: databaseControllers.setAuthPassword },
	{ method: 'POST', url: '/setUsersDescription', handler: databaseControllers.setUsersDescription },
	{ method: 'GET', url: '/getAllUsersInformation', handler: databaseControllers.getAllUsersInformation },
	{ method: 'POST', url: '/getDataByPublicId', handler: databaseControllers.getDataByPublicId },
	{ method: 'POST', url: '/deleteUserAccount', handler: databaseControllers.deleteUserAccount },
	{ method: 'POST', url: '/storeMessage', handler: databaseControllers.storeMessage },
	{ method: 'GET', url: '/getAllMessages', handler: databaseControllers.getAllMessages },
	{ method: 'POST', url: '/blockTheUser', handler: databaseControllers.blockTheUser },
	{ method: 'POST', url: '/friendInvite', handler: databaseControllers.friendInvite },
	{ method: 'POST', url: '/getAllFriends', handler: databaseControllers.getAllFriends },
	{ method: 'POST', url: '/getAllPendencies', handler: databaseControllers.getAllPendencies },
	{ method: 'POST', url: '/setAcceptFriend', handler: databaseControllers.setAcceptFriend },
	{ method: 'POST', url: '/deleteAFriend', handler: databaseControllers.deleteAFriend },
	{ method: 'GET', url: '/getAllBlackList', handler: databaseControllers.getAllBlacklist }
];

export default async function databaseRoutes(fastify, options) {

	for (const route of routes) {
		fastify.route({
			method: route.method,
			url: route.url,
			handler: async (req, reply) => {
				return route.handler(fastify, req, reply);
			}
		});
	}
}
