import fastify from 'fastify';
import publicRoutes from './routes/publicRoutes.js';
import privateRoutes from './routes/privateRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authHook } from './hooks/hooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//console.log(__filename);
//console.log(__dirname);

const app = fastify();

app.register(publicRoutes, { prefix: "/api" });

app.register(async (privateScope) => {
	privateScope.addHook('preHandler', authHook);
	privateScope.register(privateRoutes, { prefix: "/api" });
});

export default app;
