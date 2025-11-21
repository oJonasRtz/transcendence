import fastify from 'fastify';
import dotenv from 'dotenv';
import initDatabase from './config/dbInit.js';
import formbody from '@fastify/formbody';
import fs from 'fs';

dotenv.config();

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = fastify();

app.register(formbody);

const db = await initDatabase();

// Now, our database is accessible in all part of this container

app.decorate('db', db);

export default app;
