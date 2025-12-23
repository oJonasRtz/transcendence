import privateControllers from '../controllers/privateControllers.js';

const routes = [
	{ method: 'GET', url: '/helloDb', handler: privateControllers.helloDb },
	{ method: 'GET', url: '/home', handler: privateControllers.getHomePage },
	{ method: 'GET', url: '/logout', handler: privateControllers.logout },
	{ method: 'GET', url: '/confirmUserEmail', handler: privateControllers.confirmUserEmail },
	{ method: 'GET', url: '/confirmUserEmailCode', handler: privateControllers.confirmUserEmailCode },
	{ method: 'POST', url: '/validateUserEmailCode', handler: privateControllers.validateUserEmailCode },
	{ method: 'GET', url: '/get2FAQrCode', handler: privateControllers.get2FAQrCode },
	{ method: 'GET', url: '/check2FAQrCode', handler: privateControllers.check2FAQrCode },
	{ method: 'POST', url: '/validate2FAQrCode', handler: privateControllers.validate2FAQrCode },
	{ method: 'POST', url: '/upload', handler: privateControllers.upload },
	{ method: 'GET', url: '/changeUsername', handler: privateControllers.changeUsername },
	{ method: 'POST', url: '/setAuthUsername', handler: privateControllers.setAuthUsername },
	{ method: 'GET', url: '/changeNickname', handler: privateControllers.changeNickname },
	{ method: 'POST', url: '/setAuthNickname', handler: privateControllers.setAuthNickname },
	{ method: 'GET', url: '/changeEmail', handler: privateControllers.changeEmail },
	{ method: 'POST', url: '/setAuthEmail', handler: privateControllers.setAuthEmail },
	{ method: 'GET', url: '/changeYourPassword', handler: privateControllers.changePassword },
	{ method: 'POST', url: '/setAuthPassword', handler: privateControllers.setAuthPassword },
	{ method: 'GET', url: '/changeDescription', handler: privateControllers.changeDescription },
	{ method: 'POST', url: '/setUserDescription', handler: privateControllers.setUserDescription },
	{ method: 'GET', url: '/match', handler: privateControllers.match },
	{ method: 'GET', url: '/seeAllUsers', handler: privateControllers.seeAllUsers },
	{ method: 'GET', url: '/seeProfile', handler: privateControllers.seeProfile },
	{ method: 'GET', url: '/chatAllUsers', handler: privateControllers.chatAllUsers },
	{ method: 'POST', url: '/match/join', handler: privateControllers.joinQueue },
	{ method: 'POST', url: '/match/leave', handler: privateControllers.leaveQueue },
	{ method: 'GET', url: '/deleteUserAccount', handler: privateControllers.deleteUserAccount },
	{ method: 'POST', url: '/blockTheUser', handler: privateControllers.blockTheUser },
	{ method: 'POST', url: '/friendInvite', handler: privateControllers.friendInvite },
	// -- Games --
	{ method: 'GET', url: '/flappy-bird', handler: privateControllers.goFlappyBird },
	{ method: 'GET', url: '/flappy-bird/', handler: privateControllers.goFlappyBird },
	{ method: 'GET', url: '/pong', handler: privateControllers.goPong },
	{ method: 'GET', url: '/pong/', handler: privateControllers.goPong },

	{ method: 'GET', url: '/handlerFriendsPage', handler: privateControllers.handlerFriendsPage },
	{ method: 'POST', url: '/setAcceptFriend', handler: privateControllers.setAcceptFriend },
	{ method: 'POST', url: '/deleteAFriend', handler: privateControllers.deleteAFriend },
	{ method: 'GET', url: '/directMessage', handler: privateControllers.directMessage },
	{ method: 'GET', url: '/set2FAOnOff', handler: privateControllers.set2FAOnOff }
];

export default async function privateRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}
}
