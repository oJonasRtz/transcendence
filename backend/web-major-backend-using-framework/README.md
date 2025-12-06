# ft_transcendence Backend

This repo is for the Web section of ft_transcendence 42 School project (refer en.subject.txt for more info), Major module: Use a framework to build the backend.

In this major module, it is required to use a specific web framework for backend development: **Fastify with Node.js**.

## Features

- **SQLite Database Integration**: Complete database layer with user management, tournaments, and game tracking
- **Authentication System**: Secure password hashing with bcrypt and input validation
- **Tournament Management**: Create and manage Pong tournaments with participant tracking
- **Game Session Tracking**: Store game results and match history
- **Security**: Protection against SQL injection and XSS attacks with parameterized queries
- **RESTful API**: Clean API endpoints for all core functionality

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:migrate
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Both commands will start the server on `http://localhost:3000`

## Database

This application uses SQLite for data persistence with the following schema:

- **users**: User accounts with secure password hashing
- **tournaments**: Tournament management and organization
- **tournament_participants**: Tournament participation tracking
- **games**: Individual game sessions and results
- **match_history**: Player match history and statistics

### Database Commands

```bash
# Run database migrations
npm run db:migrate

# Test database connection
npm run test:db
```

## API Endpoints

### Core Endpoints
- `GET /` - Health check: `{"hello":"world","database":"connected"}`
- `GET /api/health/db` - Database health check with user count

### User Management
- `POST /api/users/register` - Register a new user
  ```json
  {
    "username": "player1",
    "email": "player1@example.com", 
    "password": "securepassword"
  }
  ```

### Tournament Management
- `POST /api/tournaments` - Create a new tournament
  ```json
  {
    "name": "Championship 2025",
    "maxParticipants": 8
  }
  ```
- `GET /api/tournaments` - List all tournaments

## Security Features

- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Input Validation**: Username, email, and password validation
- **SQL Injection Prevention**: Parameterized queries for all database operations
- **XSS Protection**: Input sanitization and validation

## Testing

### Basic Health Check
```bash
curl http://localhost:3000
```

Expected response:
```json
{"hello":"world","database":"connected"}
```

### Database Health Check
```bash
curl http://localhost:3000/api/health/db
```

### User Registration Test
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Run All Tests
```bash
# Run linting
npm run lint

# Run database tests
npm run test:db

# Run all tests
npm test
```

## Project Structure

```
src/
├── database/
│   ├── config.js          # Database configuration
│   ├── connection.js      # SQLite connection management
│   ├── schema.sql         # Database schema definition
│   ├── migrations.js      # Database migration script
│   ├── queries.js         # Database query methods
│   └── test-connection.js # Database connectivity tests
├── plugins/
│   └── database.js        # Fastify database plugin
└── utils/
    └── auth.js            # Authentication utilities
```

## Development

The application follows Fastify plugin architecture with:

- **Database Plugin**: Decorates Fastify instance with database connection and queries
- **Modular Structure**: Organized codebase with separation of concerns
- **Error Handling**: Comprehensive error handling for database operations
- **Resource Management**: Proper SQLite statement lifecycle management
