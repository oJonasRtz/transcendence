# JWT Secret Standardization

## Flow (current)
1. auth-service signs JWT using `JWT_SECRET` and returns token on login/signup.
2. frontend stores token in `jwt` cookie (httpOnly).
3. api-gateway verifies `jwt` cookie for protected routes and sockets.
4. frontend middleware verifies `jwt` for route protection.

## Single Source of Truth
- `JWT_SECRET` lives in repo root `.env`.
- docker-compose passes `JWT_SECRET` into:
  - `auth-service`
  - `api-gateway`
  - `frontend`

## Guardrails
- auth-service and api-gateway fail fast if `JWT_SECRET` is missing.
- frontend middleware/auth utilities throw if `JWT_SECRET` is missing.

## Verification Checklist
1. `docker compose config` shows `JWT_SECRET` in auth-service/api-gateway/frontend.
2. Login succeeds and sets `jwt` cookie.
3. Protected routes (`/dashboard`, `/settings`) do not redirect when cookie is present.
4. api-gateway logs show no JWT verification errors.

## Notes
- Local dev (non-docker) still uses `frontend/.env` for `JWT_SECRET`.
- Avoid introducing `NEXT_PUBLIC_JWT_SECRET` to prevent exposing secrets to the client.
