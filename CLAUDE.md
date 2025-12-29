# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

### Full Stack (Docker)
- `make up` - Build and start all services (generates TLS certs, gets server IP)
- `make down` - Stop all services
- `make re` - Restart all services
- `make clean` - Stop services and prune containers/images
- `make fclean` - Full clean including volumes
- `make restart-<service>` - Restart specific service (e.g., `make restart-api-gateway`)
- Service shortcuts: `make api`, `make auth`, `make users`, `make chat`, `make server`, `make pong`, `make flappy`, `make match`

### Frontend (Next.js)
```bash
cd frontend
pnpm i              # Install dependencies
pnpm dev            # Dev server with Turbopack on localhost:3000
pnpm build          # Production build
prisma generate     # Generate Prisma client (runs on postinstall)
```

### API Gateway
```bash
cd api-gateway
npm run dev:css     # Watch Tailwind CSS
npm run build:css   # Build Tailwind CSS
npm run dev:ts      # Watch TypeScript
npm run build:ts    # Build TypeScript
```

## Architecture

This is **Transcendence** - a multiplayer gaming platform with real-time chat, built as a Docker-based microservices architecture.

### Services

| Service | Tech Stack | Purpose |
|---------|-----------|---------|
| **nginx** | Alpine | Reverse proxy, TLS termination (ports 80/443) |
| **api-gateway** | Fastify + EJS | Central routing, session management, WebSocket via Socket.IO |
| **auth-service** | Express | Authentication, JWT tokens, 2FA (Speakeasy) |
| **users-service** | Express | User profiles, avatars, friendships |
| **chat-service** | Express | Real-time messaging |
| **sqlite-db** | SQLite | Shared database service |
| **game-server** | Node.js | Game state coordination |
| **game-pong** | Static | Pong game client |
| **game-flappy-bird** | Static | Flappy Bird game client |
| **match-service** | Node.js | Matchmaking queue (ports 3004, 3010) |

### Monitoring Stack
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (at /grafana/) - Dashboards
- **Node Exporter** - Host metrics
- **cAdvisor** - Container metrics
- **Blackbox Exporter** - Endpoint probing
- **Alertmanager** - Alert routing

### Docker Networks
- `transcendence` (172.28.0.0/16) - Main service communication
- `game` (172.29.0.0/16) - Game services isolation
- `db_connection` - Database access

### Frontend Stack (Next.js 16)
- **App Router** with Turbopack
- **Prisma ORM** with PostgreSQL (PG adapter)
- **NextAuth.js v5 beta** for authentication
- **Tailwind CSS** with custom blue/black palette
- **Zod** for validation

Key patterns:
- Use `@/` alias for imports
- Prisma client from `@/prisma/generated/client`
- Data queries centralized in `app/lib/data.ts`
- UI components in `app/ui/[feature]/`

### API Gateway Routes
Public routes handle: login, register, password recovery, email verification
Private routes handle: games, matchmaking, profile management, friends, chat, 2FA setup

### Inter-Service Communication
Services communicate via internal Docker DNS. The api-gateway proxies requests to backend services using Axios.
