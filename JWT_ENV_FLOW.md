# JWT Environment & Flow Map

## .env Configuration Map

### Source of Truth
- `/.env` (root) is the shared source for `JWT_SECRET`.

### Services that must receive JWT_SECRET
- `auth-service`
- `api-gateway`
- `frontend`

### Docker Compose Wiring
`docker-compose.yml` passes `JWT_SECRET` into the three services using `env_file` + explicit env:
- `env_file: ./.env`
- `environment: JWT_SECRET=${JWT_SECRET}`

### Local (non-docker) dev
- `frontend/.env` must include `JWT_SECRET` if you run Next.js outside Docker.
- `auth-service/.env` and `api-gateway/.env` are still used by their apps when running locally.

### Required Keys
- `JWT_SECRET` must match across all services.
- Avoid `NEXT_PUBLIC_JWT_SECRET` (never expose JWT secret to client).

---

## Flow 1: Login/Signup JWT Creation

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Next)
  participant GW as API Gateway
  participant AUTH as Auth Service

  U->>FE: Submit login/signup
  FE->>GW: POST /api/login or /api/register
  GW->>AUTH: Validate credentials
  AUTH->>AUTH: Sign JWT using JWT_SECRET
  AUTH-->>GW: { token }
  GW-->>FE: { token }
  FE->>FE: Set httpOnly cookie "jwt"
  FE-->>U: Redirect to /dashboard
```

---

## Flow 2: Authenticated Request (Server)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Next)
  participant GW as API Gateway

  U->>FE: Request protected route
  FE->>FE: middleware verifies JWT using JWT_SECRET
  FE->>GW: Server actions call GW with Cookie: jwt=...
  GW->>GW: authHook verifies JWT using JWT_SECRET
  GW-->>FE: JSON response
  FE-->>U: Render page
```

---

## Flow 3: Authenticated Request (API proxy)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Next)
  participant NAPI as Next API Route
  participant GW as API Gateway

  U->>FE: Fetch /api/*
  FE->>NAPI: Next API route
  NAPI->>GW: Forward request with Cookie: jwt=...
  GW->>GW: authHook verifies JWT
  GW-->>NAPI: JSON response
  NAPI-->>FE: JSON response
```

---

## Flow 4: Socket Auth (Chat/Match)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (Socket.io client)
  participant GW as API Gateway (Socket.io)

  U->>FE: Open websocket
  FE->>GW: socket.io connect with cookie
  GW->>GW: verify JWT via JWT_SECRET
  GW-->>FE: connected or rejected
```

---

## Verification Checklist

- `JWT_SECRET` exists in root `.env`.
- `docker compose config` shows JWT_SECRET injected into `auth-service`, `api-gateway`, `frontend`.
- Login sets the `jwt` cookie.
- `/dashboard` loads without redirect loops.
- api-gateway logs show no JWT verification errors.

