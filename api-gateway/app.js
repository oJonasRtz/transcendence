import fastify from 'fastify';
import publicRoutes from './routes/publicRoutes.js';
import privateRoutes from './routes/privateRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authHook, validatorHook, require2faHook } from './hooks/hooks.js';
import path from 'path';
import formBody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import ejs from 'ejs';
import fastifyView from '@fastify/view';
import session from '@fastify/session';
import dotenv from 'dotenv';
import fs from 'fs';
import fastifyStatic from "@fastify/static";
import { errorHandler, notFoundHandler } from './handlers/handlers.js';
import multipart from '@fastify/multipart';

dotenv.config();

// It is a temporary configuration
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//console.log(__filename);
//console.log(__dirname);

const app = fastify({
    https: {
        key: fs.readFileSync('./shared/ssl/server.key'),
        cert: fs.readFileSync('./shared/ssl/server.cert'),
		ca: fs.readFileSync('./shared/ssl/rootCA.pem')
    }
});

// To allow uploads with the limit of 2MB filesize

app.register(multipart, {
	limits: {
		fileSize: 2 * 1024 * 1024 // 2MB
	}
});

app.register(fastifyStatic, {
	root: path.join(__dirname, "public"),
	prefix: "/public/"
});


app.get("/boom", (req, reply) => {
	throw new Error("Big Error");
});

errorHandler(app);
notFoundHandler(app);

const isProduction = process.env.NODE_ENV === 'production';

// Registering the cookie

app.register(cookie, {
	secret: process.env.COOKIE_SECRET || 'purpleVoidSatoroGojopurpleVoidSatoroGojo',
	hook: 'onRequest'
});

// Registering the session

app.register(session, {
	secret: process.env.SESSION_SECRET || 'purpleVoidSatoroGojopurpleVoidSatoroGojo',
	cookieName: "session",
	cookie: {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: isProduction
	},
	saveUninitialized: false
});

// Now, we are able to read formularies

app.register(formBody);

app.register(fastifyView, {
        engine: { ejs },
        root: path.join(process.cwd(), "views"),
        viewExt: "ejs"
});

// You can add prefix: /api to prefix every route prefix: '/api'

app.addHook('preHandler', validatorHook);

app.register(publicRoutes, {});

app.register(async (privateScope) => {
	privateScope.addHook('preHandler', authHook);
	privateScope.addHook('preHandler', require2faHook);
	privateScope.register(privateRoutes, {});
});

export default app;
