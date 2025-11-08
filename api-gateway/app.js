import fastify from 'fastify';
import publicRoutes from './routes/publicRoutes.js';
import privateRoutes from './routes/privateRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authHook, validatorHook } from './hooks/hooks.js';
import formBody from '@fastify/formbody';
import cookie from '@fastify/cookie';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//console.log(__filename);
//console.log(__dirname);

const app = fastify();

app.register(formBody);

const isProduction = process.env.NODE_ENV;

app.register(cookie, {
	secret: process.env.COOKIE_SECRET || 'purpleVoid',
	parseOptions: {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: isProduction
	}
});

// You can add prefix: /api to prefix every route prefix: '/api'

app.addHook('preHandler', validatorHook);

app.register(publicRoutes, {});

app.register(async (privateScope) => {
	privateScope.addHook('preHandler', authHook);
	privateScope.register(privateRoutes, {});
});

export default app;
