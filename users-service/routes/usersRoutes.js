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
	{ method: 'POST', url: '/getUserStatus', handler: usersControllers.getUserStatus },
	{ method: 'POST', url: '/setMatchId', handler: usersControllers.setMatchId },
	{ method: 'POST', url: '/getMatchId', handler: usersControllers.getMatchId },
	{ method: 'POST', url: '/getUserInformation', handler: usersControllers.getUserInformation },
	{ method: 'POST', url: '/setUserDescription', handler: usersControllers.setUserDescription },
	{ method: 'GET', url: '/getAllUserInformation', handler: usersControllers.getAllUsersInformation }
];

export default async function usersRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}
}
