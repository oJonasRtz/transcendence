// Set framework

import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
// Set routes path

const fastify = Fastify({ logger: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import relationsRoutes from './routes/relations.js';
import lobbiesRoutes from './routes/lobbies.js';
import matchmakingRoutes from './routes/matchmaking.js';
import matchesRoutes from './routes/matches.js';
import tournamentRoutes from './routes/tournaments.js';
import channelsRoutes from './routes/channels.js';
import healthRoutes from './routes/health.js';

// Set handlers

import notFoundHandler from './handlers/notFoundHandler.js';
import errorHandler from './handlers/errorHandler.js';

// Set Database

import dbPlugin from './src/plugins/database.js';

fastify.register(dbPlugin);

fastify.get('/', async (request, reply) => {
  return { hello: 'world', database: 'connected' };
});

// Register routes

fastify.register(userRoutes, { prefix:'/api/users' });
fastify.register(authRoutes, { prefix: '/api/auth/users' });
fastify.register(relationsRoutes, { prefix: '/api/friends' });
fastify.register(lobbiesRoutes, { prefix: '/api/lobbies' });
fastify.register(matchmakingRoutes, { prefix: '/api/matchmaking' });
fastify.register(matchesRoutes, { prefix: '/api/matches' });
fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
fastify.register(channelsRoutes, { prefix: '/api/channels' });
fastify.register(healthRoutes);

export default fastify;
