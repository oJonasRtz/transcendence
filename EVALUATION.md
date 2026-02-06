# Evaluation Guide

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd transcendence

# Start all services
make up

# Access at https://localhost
```

**That's it!** The application will be running on your machine in ~5-10 minutes.

---

## What Happens

When you run `make up`, the system automatically:

1. ✅ Generates TLS certificates for HTTPS
2. ✅ Builds all Docker images from source
3. ✅ Starts 12+ microservices
4. ✅ Sets up the database
5. ✅ Configures monitoring (Prometheus + Grafana)

**No manual configuration needed** - everything is automated.

---

## Access Points

### Main Application
- **URL**: https://localhost
- **Certificate**: Self-signed (click "Advanced" → "Proceed" in your browser)

### Features to Test
- User registration and login
- 2FA authentication
- Profile management with avatar upload
- Friend system
- Real-time chat (public rooms + DMs)
- Pong game (matchmaking + tournaments)
- Flappy Bird game
- Leaderboards and statistics

### Monitoring Dashboard
- **URL**: https://localhost/grafana/
- **Default credentials**: admin / admin (change on first login)

---

## Prerequisites

- **Docker** and **Docker Compose v2**
- **Make**
- **4GB+ RAM** recommended
- **10GB+ free disk space**

---

## Stopping Services

```bash
make down
```

---

## Troubleshooting

### "docker: command not found"
- Install Docker: https://docs.docker.com/engine/install/
- Start Docker daemon: `sudo systemctl start docker`
- Add user to docker group: `sudo usermod -aG docker $USER` (logout/login required)

### Port already in use
- Check what's using ports 80/443:
  ```bash
  sudo lsof -i :80
  sudo lsof -i :443
  ```
- Stop conflicting services or change ports in docker-compose.yml

### Build fails
- Ensure 4GB+ RAM available
- Check disk space: `df -h`
- Clean Docker cache: `docker system prune -a`

### Services won't start
- Check logs:
  ```bash
  docker compose logs -f
  docker compose ps
  ```

---

## Architecture

The deployed system includes:

- **nginx**: Reverse proxy with HTTPS
- **frontend**: Next.js React application
- **api-gateway**: Fastify API server
- **auth-service**: JWT authentication + 2FA
- **users-service**: Profile management
- **chat-service**: Real-time messaging (Socket.io)
- **game-server**: WebSocket game state
- **game-pong**: Pong game engine
- **game-flappy-bird**: Flappy Bird game engine
- **match-service**: Matchmaking + tournaments
- **sqlite-db**: Database service
- **monitoring**: Prometheus + Grafana + Alertmanager

All services communicate via internal Docker networks.
