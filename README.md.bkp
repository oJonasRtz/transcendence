# ft_transcendence

A multiplayer Pong web application featuring real-time gaming, chat, matchmaking, and user management. Built as a microservices architecture running on Docker.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Services](#services)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Monitoring](#monitoring)
- [Development](#development)

## Features

### Authentication & Security
- User registration with email validation
- JWT-based authentication with secure httpOnly cookies
- Two-Factor Authentication (2FA) with QR code setup
- Email-based password reset with verification codes
- Captcha integration on login/register
- Password requirements: 8+ chars, uppercase, lowercase, numbers, special chars

### User Management
- Customizable profiles (username, nickname, email, description)
- Avatar upload with automatic image processing
- Online/offline status tracking
- User search and public profiles

### Multiplayer Gaming
- **Pong** - Classic paddle game with physics
- **Flappy Bird** - Obstacle avoidance game
- Real-time game state via WebSocket
- Matchmaking modes:
  - **RANKED**: 1v1 matches with ELO-style ranking
  - **TOURNAMENT**: 4-player double-elimination brackets
- Game statistics and leaderboards

### Social Features
- Friend system (request, accept, reject, block)
- Public chat rooms
- Direct messaging between users
- Real-time notifications via Socket.io
- Message read status tracking

### Dashboard & Analytics
- User statistics (wins/losses/draws, ranking, level, XP)
- Match history with pagination
- Global leaderboard
- Friends list with online status
- Activity feed

## Architecture

```
Browser (HTTPS:443)
    │
    ▼
  nginx ──────────────────────────────────────────────────┐
    │                                                      │
    ├─► / (root only) ──► frontend:3000 (Next.js)         │
    │                                                      │
    ├─► /* (all other) ──► api-gateway:3000 (Fastify)     │
    │        │                                             │
    │        ├──► auth-service:3001                        │
    │        ├──► users-service:3003                       │
    │        └──► chat-service (WebSocket)                 │
    │                                                      │
    ├─► /pong-ws/ ──► game-server:8443 (WebSocket)        │
    │                                                      │
    ├─► /match/ ──► match-service:3010                     │
    │                                                      │
    └─► /grafana/ ──► grafana:3000                         │
```

### Networks

| Network | Purpose |
|---------|---------|
| `transcendence` | Main network connecting nginx, api-gateway, frontend, and core services |
| `game` | Game-related services (game-server, game-pong, game-flappy-bird, match-service) |
| `db_connection` | Database access (sqlite-db, auth-service, users-service, chat-service) |

### Databases

- **PostgreSQL**: Used by frontend via Prisma ORM
- **SQLite**: Used by api-gateway, auth-service, users-service, chat-service

## Tech Stack

### Frontend
- Next.js 16 with Turbopack
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- Prisma 7.2 ORM
- Socket.io-client

### Backend
- Fastify 5.6
- Node.js 20
- JWT authentication
- Sharp (image processing)
- Nodemailer (emails)
- Speakeasy (2FA)

### Games
- Excalibur game engine (v0.31-0.32)
- Vite build tool
- WebSocket real-time sync

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy, TLS)
- Prometheus, Grafana, Alertmanager (monitoring)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make
- Node.js 20+ (for local development)
- pnpm (for frontend)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ft_trans

# Start all services (generates TLS certs, builds, runs)
make up

# Access the application
# https://localhost (or your configured domain)
```

### Makefile Commands

```bash
make up        # Start all services
make down      # Stop all services
make build     # Build without starting
make re        # Restart all services
make fclean    # Full clean (removes volumes, images, containers)

# Restart individual services
make api       # api-gateway
make front     # frontend
make auth      # auth-service
make users     # users-service
make chat      # chat-service
make server    # game-server
make pong      # game-pong
make flappy    # game-flappy-bird
make match     # match-service

# View logs
docker compose logs -f <service-name>
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | 80, 443 | Reverse proxy with TLS termination |
| **api-gateway** | 3000 | Central API gateway, routing, session management |
| **frontend** | 3000 | Next.js React dashboard |
| **auth-service** | 3001 | Authentication, 2FA, password reset |
| **users-service** | 3003 | User profiles, avatars, online status |
| **chat-service** | - | Real-time public/private messaging (Socket.io) |
| **sqlite-db** | 3002 | SQLite database service |
| **game-server** | 8443 | WebSocket game state management |
| **game-pong** | - | Pong game client |
| **game-flappy-bird** | - | Flappy Bird game client |
| **match-service** | 3010 | Matchmaking and tournament management |
| **prometheus** | 9090 | Metrics collection |
| **grafana** | 3000 | Metrics visualization |
| **alertmanager** | 9093 | Alert management |

## API Routes

### Public Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/login` | Login page |
| GET | `/register` | Registration page |
| POST | `/checkRegister` | Handle registration |
| POST | `/checkLogin` | Handle login |
| GET | `/forgotPassword` | Password recovery |
| POST | `/checkEmail` | Email verification |
| POST | `/newPassword` | Password reset |

### Private Routes (Requires Authentication)

#### User Management
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/home` | Home dashboard |
| GET | `/logout` | Logout user |
| POST | `/setAuthUsername` | Update username |
| POST | `/setAuthNickname` | Update nickname |
| POST | `/setAuthEmail` | Update email |
| POST | `/setAuthPassword` | Update password |
| GET | `/upload` | Avatar upload |
| GET | `/deleteUserAccount` | Delete account |

#### Two-Factor Authentication
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/get2FAQrCode` | Generate 2FA QR code |
| POST | `/validate2FAQrCode` | Validate 2FA code |
| GET | `/set2FAOnOff` | Toggle 2FA |

#### Social Features
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/seeAllUsers` | User directory |
| GET | `/seeProfile` | View public profile |
| POST | `/friendInvite` | Send friend request |
| POST | `/setAcceptFriend` | Accept friend request |
| POST | `/deleteAFriend` | Remove friend |
| POST | `/blockTheUser` | Block user |
| GET | `/directMessage` | Direct messaging |

#### Gaming
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/match` | Matchmaking page |
| POST | `/match/join` | Join matchmaking queue |
| POST | `/match/leave` | Leave matchmaking queue |
| GET | `/pong` | Pong game |
| GET | `/flappy-bird` | Flappy Bird game |

## Database Schema

### User
```
- id: Int (PK)
- username: String (unique)
- email: String (unique)
- passwordHash: String
- avatar: String
- isOnline: Boolean
- lastSeen: DateTime
- createdAt, updatedAt: DateTime
```

### GameStats
```
- id: Int (PK)
- userId: Int (FK, unique)
- wins, losses, draws: Int
- ranking, level: Int
- xp, winStreak: Int
```

### Match
```
- id: Int (PK)
- player1Id, player2Id, winnerId: Int (FK)
- result: Enum (player1Win, player2Win, draw)
- score: String
- duration: Int
- playedAt: DateTime
```

### Friendship
```
- id: Int (PK)
- userId, friendId: Int (FK)
- status: Enum (pending, accepted, rejected, blocked)
```

### Message & Conversation
```
Message:
- id, conversationId, senderId, receiverId: Int
- content: Text
- isRead: Boolean

Conversation:
- id: Int (PK)
- participants: ConversationParticipant[]
- messages: Message[]
```

### Achievement
```
- id: Int (PK)
- name: String (unique)
- description: String
- category: Enum (wins, matches, streak, ranking, special)
- requirement, xpReward: Int
```

## Monitoring

The project includes a complete monitoring stack:

| Service | Port | Purpose |
|---------|------|---------|
| **Prometheus** | 9090 | Time-series metrics database |
| **Grafana** | /grafana | Visualization dashboards |
| **Alertmanager** | 9093 | Alert routing and management |
| **Node Exporter** | 9100 | Host system metrics |
| **cAdvisor** | 8080 | Docker container metrics |
| **Blackbox Exporter** | 9115 | Endpoint health checks |

Access Grafana at `https://localhost/grafana/` after starting the services.

## Development

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev          # Dev server with Turbopack

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Database GUI
```

### API Gateway Development

```bash
cd api-gateway
npm install
npm run build:css    # Build Tailwind CSS
npm run dev:css      # Watch Tailwind CSS
```

### Project Structure

```
ft_trans/
├── api-gateway/         # Fastify API gateway
│   ├── app.js           # Main app setup
│   ├── routes/          # Route definitions
│   ├── controllers/     # Request handlers
│   ├── hooks/           # Auth and validation hooks
│   └── views/           # EJS templates
├── frontend/            # Next.js application
│   ├── app/             # App router pages
│   │   ├── dashboard/   # Dashboard pages
│   │   ├── chat/        # Chat page
│   │   └── ui/          # React components
│   ├── lib/             # Utilities and actions
│   └── prisma/          # Database schema
├── auth-service/        # Authentication service
├── users-service/       # User management service
├── chat-service/        # Real-time chat service
├── game-server/         # WebSocket game server
├── game-pong/           # Pong game client
├── game-flappy-bird/    # Flappy Bird game client
├── match-service/       # Matchmaking service
├── sqlite-db/           # SQLite database service
├── monitoring/          # Prometheus, Grafana, etc.
├── nginx/               # Nginx configuration
├── shared/              # Shared assets
├── docker-compose.yml   # Service orchestration
└── Makefile             # Build commands
```

### Security Features

- JWT tokens with httpOnly, Secure, SameSite=Strict cookies
- Password hashing with bcrypt
- Input validation with regex patterns
- Bad-word filtering
- NSFW content detection for usernames
- Image safety checking for avatars
- DDOS detection in game server
- 2MB file upload limit

## License

This project is part of the 42 school curriculum.
