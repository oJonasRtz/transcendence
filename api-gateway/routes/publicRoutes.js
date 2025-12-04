import axios from 'axios';
import publicControllers from '../controllers/publicControllers.js';

// AUTH-SERVICE

const routes = [
	{ method: 'GET', url: '/', handler: publicControllers.homePage },
	{ method: 'GET', url: '/login', handler: publicControllers.login },
	{ method: 'GET', url: '/register', handler: publicControllers.register },
	{ method: 'POST', url: '/checkRegister', handler: publicControllers.checkRegister },
	{ method: 'POST', url: '/checkLogin', handler: publicControllers.checkLogin },
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
	//rotas temporarias, elas vao para as privadas dps
	// { method: 'GET', url: '/flappy-bird', handler: publicControllers.goFlappyBird },
	{ method: 'GET', url: '/pong', handler: publicControllers.goPong },
];

export default async function publicRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}	
};
