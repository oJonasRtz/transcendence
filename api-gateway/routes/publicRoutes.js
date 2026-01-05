import axios from 'axios';
import publicControllers from '../controllers/publicControllers.js';

// AUTH-SERVICE

const routes = [
	{ method: 'GET', url: '/', handler: publicControllers.homePage },
	{ method: 'GET', url: '/login', handler: publicControllers.login },
	{ method: 'GET', url: '/register', handler: publicControllers.register },
	{ method: 'POST', url: '/checkRegister', handler: publicControllers.checkRegister },
	{ method: 'POST', url: '/checkLogin', handler: publicControllers.checkLogin },
	{ method: 'POST', url: '/verifyLogin2FA', handler: publicControllers.verifyLogin2FA },
	{ method: 'GET', url: '/getCaptcha', handler: publicControllers.getCaptcha },
	{ method: 'POST', url: '/apiCheckEmail', handler: publicControllers.apiCheckEmail },
	{ method: 'POST', url: '/apiCheckEmailCode', handler: publicControllers.apiCheckEmailCode },
	{ method: 'POST', url: '/apiNewPassword', handler: publicControllers.apiNewPassword },
	{ method: 'GET', url: '/hello', handler: publicControllers.hello },
	{ method: 'GET', url: '/forgotPassword', handler: publicControllers.forgotPasswordPage },
	{ method: 'POST', url: '/checkEmail', handler: publicControllers.checkEmail },
	{ method: 'GET', url: '/validateEmailCode', handler: publicControllers.validateEmailCode },
	{ method: 'GET', url: '/checkEmailCode', handler: publicControllers.checkEmailCode },
	{ method: 'POST', url: '/checkEmailCode', handler: publicControllers.checkEmailCode },
	{ method: 'GET', url: '/changePassword', handler: publicControllers.changePassword },
	{ method: 'POST', url: '/newPassword', handler: publicControllers.newPassword },
	// TESTING BAD ROUTES
	{ method: 'GET', url: '/checkDb', handler: publicControllers.checkDb },
	{ method: 'GET', url: '/favicon.ico', handler: publicControllers.getIcon },
];

export default async function publicRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}	
};
