import axios from 'axios';
import usersControllers from '../controllers/usersControllers.js';

const routes = [
	{ method: 'POST', url: '/createNewUser', handler: usersControllers.createNewUser },
	{ method: 'POST', url: '/validateUserEmail', handler: usersControllers.validateUserEmail },
	{ method: 'POST', url: '/getIsOnline', handler: usersControllers.getIsOnline },
	{ method: 'POST', url: '/getQueue', handler: usersControllers.getQueue },
	{ method: 'POST', url: '/setIsOnline', handler: usersControllers.setIsOnline },
	{ method: 'POST', url: '/getUserAvatar', handler: usersControllers.getUserAvatar },
	{ method: 'POST', url: '/setUserAvatar', handler: usersControllers.setUserAvatar },
	{ method: 'POST', url: '/setInGame', handler: usersControllers.setInGame },
	{ method: 'POST', url: '/getInGame', handler: usersControllers.getInGame },
	{ method: 'POST', url: '/setInQueue', handler: usersControllers.setInQueue },
	{ method: 'POST', url: '/setRank', handler: usersControllers.setRank },
	{ method: 'POST', url: '/getRank', handler: usersControllers.getRank },
	{ method: 'POST', url: '/getUserStatus', handler: usersControllers.getUserStatus },
	{ method: 'POST', url: '/setMatchId', handler: usersControllers.setMatchId },
	{ method: 'POST', url: '/getMatchId', handler: usersControllers.getMatchId },
	{ method: 'POST', url: '/getUserInformation', handler: usersControllers.getUserInformation },
	{ method: 'POST', url: '/setUserDescription', handler: usersControllers.setUserDescription },
	{ method: 'GET', url: '/getAllUsersInformation', handler: usersControllers.getAllUsersInformation },
	{ method: 'POST', url: '/getDataByPublicId', handler: usersControllers.getDataByPublicId },
	{ method: 'POST', url: '/blockTheUser', handler: usersControllers.blockTheUser },
	{ method: 'POST', url: '/friendInvite', handler: usersControllers.friendInvite },
	{ method: 'POST', url: '/getAllFriends', handler: usersControllers.getAllFriends },
	{ method: 'POST', url: '/getAllPendencies', handler: usersControllers.getAllPendencies },
	{ method: 'POST', url: '/setAcceptFriend', handler: usersControllers.setAcceptFriend },
	{ method: 'POST', url: '/deleteAFriend', handler: usersControllers.deleteAFriend },
	{ method: 'GET', url: '/getAllBlacklist', handler: usersControllers.getAllBlacklist },
	{ method: 'POST', url: '/getPublicId', handler: usersControllers.getPublicId }
];

export default async function usersRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}
}
