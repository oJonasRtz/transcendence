# ft_transcendence

A comprehensive web-based Pong game platform built for the 42 School ft_transcendence project.

## Project Overview

This project implements the ft_transcendence requirements with a complete web application featuring:
- Backend API with Fastify framework (Node.js)
- Frontend interface with React/TypeScript
- Tournament management system
- User authentication and registration
- Game engine and web-based gameplay
- Comprehensive database layer with SQLite

## Project Structure

```
transcendence/
├── server/                     # Backend services
│   ├── code/
│   │   └── backend-fastify/   # Main Fastify backend implementation
│   │       ├── server.js      # Main server entry point
│   │       ├── package.json   # Dependencies and scripts
│   │       ├── CLAUDE.md      # Backend documentation
│   │       └── src/           # Source code
│   │           ├── plugins/   # Fastify plugins
│   │           │   └── database.js
│   │           ├── utils/     # Utility functions
│   │           │   └── auth.js
│   │           └── database/  # Database layer
│   │               ├── connection.js
│   │               ├── queries.js
│   │               ├── migrations.js
│   │               ├── schema.sql
│   │               ├── config.js
│   │               └── test-connection.js
│   ├── public/               # Static assets
│   ├── settings/             # Server configuration
│   ├── tests/                # Server tests
│   └── Dockerfile            # Server containerization
├── srcs/                      # Source code
│   ├── front-end/            # React frontend application
│   └── json/                 # JSON configurations
├── website/                   # Website assets and pages
│   ├── public/               # Public website assets
│   │   ├── assets/
│   │   │   ├── audios/
│   │   │   ├── icons/
│   │   │   └── videos/
│   │   └── srcs/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── store/
│   │       └── utils/
│   └── Dockerfile            # Website containerization
├── game/                      # Game implementation
│   ├── game-engine/          # Core game logic
│   ├── game-web/             # Web-based game interface
│   └── utils/                # Game utilities
├── database/                  # Database configuration
│   ├── create_tables/        # Database schema
│   └── examples/             # Example data
├── infrastructure/           # DevOps and infrastructure
│   ├── docker-compose.yml    # Multi-container setup
│   ├── nginx/               # Reverse proxy configuration
│   ├── logging/             # Logging configuration
│   └── monitoring/          # Monitoring setup
├── documentation/           # Project documentation
└── Makefile                 # Build automation
```

## Quick Start

### Backend (Fastify Server)

1. **Navigate to backend directory:**
   ```bash
   cd server/code/backend-fastify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run database migration:**
   ```bash
   npm run db:migrate
   ```

4. **Test database connection:**
   ```bash
   npm test
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

The backend server will be available at `http://localhost:3001`

### Frontend (React Application)

1. **Navigate to frontend directory:**
   ```bash
   cd srcs/front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Core Endpoints
- `GET /` - Health check with database status
- `GET /api/health/db` - Database health check with user count

### User Management
- `POST /api/users/register` - User registration
  ```json
  {
    "username": "string",
    "email": "string", 
    "password": "string"
  }
  ```

### Tournament System
- `POST /api/tournaments` - Create tournament
  ```json
  {
    "name": "string",
    "maxParticipants": "number"
  }
  ```
- `GET /api/tournaments` - List all tournaments

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `tournaments` - Tournament management
- `tournament_participants` - Tournament participation
- `games` - Game sessions and results
- `match_history` - Player match history

## Available Scripts

### Backend Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode
- `npm test` - Run database connection tests
- `npm run db:migrate` - Run database migrations
- `npm run test:db` - Test database functionality
- `npm run lint` - Run code linting

### Development

The project uses:
- **Backend**: Fastify (Node.js framework)
- **Frontend**: React with TypeScript
- **Database**: SQLite with proper migrations
- **Authentication**: bcrypt for password hashing
- **Security**: Prepared statements, input validation
- **Containerization**: Docker support for all services

## Architecture Highlights

### Backend Features
- Plugin-based architecture with Fastify
- Comprehensive database layer with query abstraction
- Secure authentication with bcrypt (12 salt rounds)
- Input validation and SQL injection prevention
- Proper error handling and logging
- Database connection management

### Security Implementation
- Password hashing with bcrypt
- Input validation (username, email, password requirements)
- SQL injection prevention via prepared statements
- Comprehensive error handling with appropriate HTTP status codes

## Development Notes

- All database operations use prepared statements for security
- The database plugin decorates Fastify with `db`, `dbQueries`, and `dbConnection`
- Branch naming convention: `jos-felipe/branch-name`
- Never commit secrets or sensitive data
- Follow existing code conventions and patterns

## Requirements Compliance

This implementation satisfies the ft_transcendence project requirements:
- ✅ Web-based Pong game platform
- ✅ Backend framework implementation (Fastify with Node.js)
- ✅ User management and authentication
- ✅ Tournament system
- ✅ Database integration
- ✅ Security best practices
- ✅ Containerization support
