# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a backend implementation for the ft_transcendence 42 School project, specifically implementing the "Major module: Use a framework to build the backend" requirement. The project uses **Fastify with Node.js** as mandated by the project specifications.

## Commands

### Development
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode (currently same as start)

### Testing
- `npm test` - Currently not implemented (placeholder command)

## Architecture

### Core Framework
- **Fastify**: High-performance Node.js web framework chosen as per project requirements
- **Server Configuration**: Runs on port 3000 with host '0.0.0.0' and logging enabled

### Current Structure
- `index.js`: Main server entry point with basic Fastify setup and single route
- Basic hello world endpoint at `/` returning `{ hello: 'world' }`

### Project Context
This is part of the ft_transcendence project which is a web-based Pong game platform. The backend will eventually need to support:
- Real-time multiplayer Pong gameplay
- User management and authentication
- Tournament system with matchmaking
- Security features (HTTPS, input validation, password hashing)
- Database integration (SQLite as specified)

### Branch Naming
All new branches must be prefixed with `jos-felipe/` as per user configuration.

### Security Requirements
- All passwords must be hashed when database is added
- HTTPS must be enabled for production
- Input validation is required for all user inputs
- No credentials or secrets should be committed to the repository (.env files are gitignored)

## Development Notes

The project is in early setup phase with basic Fastify server. Future development will require expanding the API to support the full Pong game platform functionality as outlined in the project specifications.