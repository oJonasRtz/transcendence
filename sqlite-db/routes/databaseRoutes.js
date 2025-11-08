import axios from 'axios';
import databaseControllers from '../controllers/databaseControllers.js';

// SQLITE-DB ROUTES

export default async function databaseRoutes(fastify, options) {
	fastify.get("/hello", databaseControllers.hello);
};
