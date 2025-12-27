import { PrismaClient } from '../../prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool with proper configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter with the pool instance
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
export const prisma = new PrismaClient({
  adapter: adapter as any, // Type assertion needed for custom adapters
});
