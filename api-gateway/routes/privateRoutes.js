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
	// { method: 'GET', url: '/matchMaking', handler: privateControllers.match },
	// { method: 'GET', url: '/matchMaking/:token', handler: privateControllers.match },
	{ method: 'GET', url: '/seeAllUsers', handler: privateControllers.seeAllUsers },
	{ method: 'GET', url: '/seeProfile', handler: privateControllers.seeProfile },
	{ method: 'GET', url: '/chatAllUsers', handler: privateControllers.chatAllUsers },
	// { method: 'POST', url: '/joinQueue', handler: privateControllers.joinQueue },
	// { method: 'POST', url: '/leaveQueue', handler: privateControllers.leaveQueue },
	// { method: 'GET', url: '/matchFound', handler: privateControllers.matchFound },
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
	{ method: 'GET', url: '/set2FAOnOff', handler: privateControllers.set2FAOnOff },
	// -- JSON API for Next.js frontend --
	{ method: 'GET', url: '/api/profile', handler: privateControllers.getProfileData },
	{ method: 'POST', url: '/api/friendInvite', handler: privateControllers.apiFriendInvite },
	{ method: 'POST', url: '/api/blockUser', handler: privateControllers.apiBlockUser },
	{ method: 'POST', url: '/api/email/send-verification', handler: privateControllers.sendVerificationEmailJson },
	{ method: 'POST', url: '/api/email/verify-code', handler: privateControllers.verifyEmailCodeJson },
	{ method: 'GET', url: '/getVerificationStatus', handler: privateControllers.getVerificationStatus },
	{ method: 'GET', url: '/api/history', handler: privateControllers.apiGetHistory },
	{ method: 'GET', url: '/api/users', handler: privateControllers.apiGetAllUsers },
	{ method: 'GET', url: '/api/friends', handler: privateControllers.apiGetFriends },
	{ method: 'GET', url: '/api/messages', handler: privateControllers.apiGetMessages },

	{ method: 'POST', url: '/joinParty/:token', handler: privateControllers.joinParty },
	{ method: 'POST', url: '/leaveParty', handler: privateControllers.leaveParty },
	{ method: 'GET', url: '/partyInfo/:id', handler: privateControllers.partyInfo },

	{ method: 'POST', url: '/setFlappyHighScore', handler: privateControllers.setFlappyHighScore },
	{ method: 'POST', url: '/getFlappyHighScore', handler: privateControllers.getFlappyHighScore },
];

export default async function privateRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}
}
