import axios from 'axios';
import authControllers from '../controllers/authControllers.js';

// AUTH-SERVICE ROUTES

const routes = [
	{ method: 'POST', url: '/checkLogin', handler: authControllers.tryLoginTheUser },
	{ method: 'POST', url: '/checkRegister', handler: authControllers.checkRegister },
	{ method: 'GET', url: '/hello', handler: authControllers.hello },
	{ method: 'GET', url: '/getCaptcha', handler: authControllers.getCaptcha },
	{ method: 'POST', url: '/checkEmail', handler: authControllers.checkEmail },
	{ method: 'POST', url: '/newPassword', handler: authControllers.newPassword },
	{ method: 'GET', url: '/helloDb', handler: authControllers.helloDb },
	{ method: 'POST', url: '/get2FAQrCode', handler: authControllers.get2FAQrCode },
	{ method: 'POST', url: '/get2FAEnable', handler: authControllers.get2FAEnable },
	{ method: 'POST', url: '/get2FASecret', handler: authControllers.get2FASecret },
	{ method: 'POST', url: '/get2FAValidate', handler: authControllers.get2FAValidate },
	{ method: 'POST', url: '/set2FASecret', handler: authControllers.set2FASecret },
	{ method: 'POST', url: '/set2FAValidate', handler: authControllers.set2FAValidate },
	{ method: 'POST', url: '/createNewToken', handler: authControllers.createNewToken },
	{ method: 'POST', url: '/getAuthData', handler: authControllers.getAuthData },
	{ method: 'POST', url: '/setAuthUsername', handler: authControllers.setAuthUsername },
	{ method: 'POST', url: '/setAuthNickname', handler: authControllers.setAuthNickname },
	{ method: 'POST', url: '/setAuthEmail', handler: authControllers.setAuthEmail },
	{ method: 'POST', url: '/setAuthPassword', handler: authControllers.setAuthPassword },
	{ method: 'POST', url: '/deleteUserAccount', handler: authControllers.deleteUserAccount }
];

export default async function authRoutes(fastify, options) {
	for (const route of routes) {
		fastify.route(route);
	}
}
