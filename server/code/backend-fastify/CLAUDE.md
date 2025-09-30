# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode (currently same as start)

### Testing and Database
- `npm test` - Run database connection tests
- `npm run test:sqlite` - Run SQLite-specific connection tests with debug logging
- `npm run test:db` - Alternative command for database connection tests
- `npm run db:migrate` - Run database migrations

### Code Quality
- `npm run lint` - Run linting (currently a placeholder)

## Architecture Overview

This is a **Fastify-based Node.js backend** for a gaming/tournament platform with the following key components:

### Database Layer
- **SQLite** with custom connection management through `DatabaseConnection` class
- Thread-safe connection handling with UUID-based logging
- Automatic pragma configuration for performance (WAL mode, foreign keys, etc.)
- Located in `src/database/`:
  - `connection.js` - Custom database connection class with comprehensive logging
  - `queries.js` - Database query methods for users, tournaments, games, and match history
  - `config.js` - Database configuration (points to `database.sqlite` in project root)
  - `schema.sql` - Database schema definition
  - `migrations.js` - Database migration runner

### Plugin Architecture
- **Fastify plugins** for modular functionality
- `src/plugins/database.js` - Database plugin that decorates Fastify instance with:
  - `fastify.db` - Raw SQLite connection
  - `fastify.dbQueries` - Query helper methods
  - `fastify.dbConnection` - Connection manager instance

### API Structure
The server exposes RESTful endpoints for:
- **Users**: Registration, retrieval by username/email/id
- **Tournaments**: Creation, listing, participant management
- **Games**: Game creation, result updating, match history
- **Health checks**: Application and database health endpoints

### Authentication & Validation
- `src/utils/auth.js` - bcrypt-based password hashing and validation utilities
- Input validation for usernames, emails, and passwords
- Comprehensive error handling with appropriate HTTP status codes

### Logging
- Structured logging using Fastify's built-in logger (Pino)
- Database operations include detailed logging with connection IDs and performance metrics
- `src/utils/logger.js` - Custom database logger configuration

## Key Patterns

### Database Operations
- All database queries return Promises and use prepared statements
- Connection management is centralized through the `DatabaseConnection` class
- Query logging includes execution time tracking and slow query detection

### Error Handling
- Consistent error responses with appropriate HTTP status codes
- Development vs production error detail exposure
- Global error handler for unhandled exceptions

### ES Modules
- Project uses ES modules (`"type": "module"` in package.json)
- Import/export syntax throughout
- Proper handling of `__dirname` equivalent for file paths