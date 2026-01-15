# AI Agent Guide

## Big Picture Architecture
- Nginx is the entrypoint; `/` goes to the Next.js frontend, `/socket.io/` to api-gateway, `/pong-ws/` to game-server, and `/match(-ws)/` to match-service; see `nginx/nginx.conf`.
- API gateway (Fastify) fronts auth/users/chat and serves legacy static assets at `/public/*`; see `api-gateway/README.md` and `docker-compose.yml`.
- Games are separate services: game-server manages WS state, game-pong/flappy-bird build static clients; the frontend embeds them via iframe/WS (`frontend/app/ui/dashboard/flappy-bird-game.tsx`, `game-pong/src/controllers/Connection.class.ts`).

## Frontend ↔ Backend Integration (Next.js App Router)
- Server actions in `frontend/app/actions/*.ts` call API gateway endpoints directly with cookies (e.g., `frontend/app/actions/auth.ts` hits `/api/login` and sets the `jwt` cookie; `frontend/app/actions/game.ts` uses `/joinQueue`).
- Next API routes in `frontend/app/api/**/route.ts` proxy `/api/*` endpoints to API gateway for 2FA/email/captcha flows and keep secrets server-side.
- "Hybrid" data fetches for legacy SQLite-backed endpoints live in `frontend/app/lib/backend-api.ts` (e.g., `/seeAllUsers`, `/seeProfile`) and are `cache: 'no-store'`.
- `BACKEND_URL` overrides the legacy endpoints used by `frontend/app/lib/backend-api.ts`.
- Auth gating is centralized in `frontend/middleware.ts`: protected routes require a valid `jwt` cookie verified with `JWT_SECRET`.
- Chat uses Socket.io client pointed at `NEXT_PUBLIC_API_GATEWAY_URL` or `window.location.origin`; see `frontend/app/chat/page.tsx`.
- Next rewrites only `/public/*` to api-gateway; legacy route proxying is intentionally commented out in `frontend/next.config.ts`.

## Conventions & Shared State
- Validation schemas mirror backend rules in `frontend/app/lib/validations.ts` (regexes are copied from auth-service).
- Cookies used across flows: `jwt`, `captcha_id`, `pending_2fa_token`; see `frontend/app/actions/auth.ts` and `frontend/app/lib/captcha.ts`.
- Prisma is stubbed in `frontend/app/lib/prisma.ts` (returns empty/no-op results), so do not expect real DB reads there.
- Auth/JWT envs are shared across services; see `docs/jwt_flow.md` for required vars and the no-fallback policy.

## Developer Workflows
- Full stack via Docker: `make up` (root `docker-compose.yml`, `.env` with `JWT_SECRET`).
- Frontend dev server: `pnpm dev` in `frontend` runs on port `3042`; set `NEXT_PUBLIC_API_GATEWAY_URL` for gateway calls.
- For detailed auth/email/captcha flows, refer to `docs/login.md`, `docs/signup.md`, `docs/captcha.md`.
