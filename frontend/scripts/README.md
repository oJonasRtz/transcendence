# Database Sync Scripts

This directory contains scripts for synchronizing data between the SQLite backend and Prisma PostgreSQL frontend.

## Available Scripts

### `sync-databases.js`

Manual sync script for one-time or ad-hoc synchronization.

**Usage:**
```bash
# Full sync (users + friendships)
node scripts/sync-databases.js

# Sync only users
node scripts/sync-databases.js --users-only

# Sync only friendships
node scripts/sync-databases.js --friends-only

# Show help
node scripts/sync-databases.js --help
```

**Requirements:**
- Backend services must be running (SQLite database accessible)
- Authentication is required (uses cookies from server context)
- Prisma must be configured and migrations applied

**When to use:**
- Initial setup / first-time sync
- After major backend changes
- To refresh all data from scratch

---

## API Endpoints for Sync

### Manual Sync Endpoint

**Route:** `POST /api/sync`

Trigger a sync manually via HTTP request. Protected by secret token.

**Usage:**
```bash
# Full sync
curl -X POST http://localhost:3001/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type": "full"}'

# Users only
curl -X POST http://localhost:3001/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type": "users"}'

# Friendships only
curl -X POST http://localhost:3001/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type": "friendships"}'
```

**Environment Variables:**
- `SYNC_SECRET` - Secret token for authorization (default: `dev-secret-change-in-production`)

---

### Background Sync (Cron)

**Route:** `GET /api/cron/sync`

Lightweight background sync for users only. Designed to run every 5 minutes.

**Setup with Vercel Cron:**

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "*/5 * * * *"
  }]
}
```

**Manual trigger:**
```bash
curl -X GET http://localhost:3001/api/cron/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Environment Variables:**
- `CRON_SECRET` - Secret token for cron job authorization (default: `dev-cron-secret`)

---

## Environment Variables

Add these to your `.env` file:

```env
# Backend URL
BACKEND_URL=http://localhost:3000

# Sync secrets (change in production!)
SYNC_SECRET=your-secure-random-secret-here
CRON_SECRET=your-secure-random-cron-secret-here
```

**Generate secure secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Sync Strategy

### What Gets Synced

✅ **Synced to Prisma:**
- Basic user data: username, email, avatar, isOnline, lastSeen
- Friendships: userId, friendId, status

❌ **NOT Synced (query from backend):**
- Game stats: wins, losses, rank, XP
- Match history
- Achievements
- Messages (chat)

### When to Sync

1. **On user login** - Sync individual user data
2. **Every 5 minutes** - Background sync for all online users (via cron)
3. **On friend add/remove** - Sync friendships
4. **Manual trigger** - Use `/api/sync` endpoint when needed

### Sync Flow

```
SQLite (Backend)          Prisma (Frontend)
─────────────────         ─────────────────
Users table       ──────> User model
  ↓ (JOIN)                  ↓
Auth table                  ↓
  ↓                         ↓
Transform via             Upsert by
  username                username
                            ↓
Friends table     ──────> Friendship model
  ↓                         ↓
Deduplicate               Single row
2-row model               per friendship
```

---

## Troubleshooting

### Error: "ECONNREFUSED"

**Cause:** Backend services not running

**Solution:**
```bash
cd /path/to/transcendence
docker-compose up -d
```

### Error: "Not authenticated"

**Cause:** No valid JWT token available

**Solution:**
- The sync script requires authentication context
- Use the API endpoints (`/api/sync`) instead
- Or implement a service account for the script

### Error: "Prisma Client not found"

**Cause:** Prisma not generated

**Solution:**
```bash
cd frontend
pnpm prisma generate
pnpm prisma db push
```

### Friendship duplicates in Prisma

**Cause:** Deduplication logic not working

**Solution:**
- Check `deduplicateMutualFriendships()` in `lib/transformers.ts`
- Manually clean up duplicates:
```sql
-- Find duplicates
SELECT userId, friendId, COUNT(*)
FROM Friendship
GROUP BY userId, friendId
HAVING COUNT(*) > 1;
```

---

## Initial Setup Checklist

- [ ] Backend services running (`docker-compose up`)
- [ ] Environment variables set (`.env` file)
- [ ] Prisma configured (`pnpm prisma generate && pnpm prisma db push`)
- [ ] Run initial sync (`POST /api/sync` with `type: "full"`)
- [ ] Verify data in Prisma database
- [ ] Set up background cron job (optional)
- [ ] Update login action to sync users on login

---

## Monitoring

Check sync logs in your application logs:

```bash
# Development
pnpm dev

# Look for logs like:
# [Sync API] Starting full sync...
# [Sync API] Users: 42 synced, 0 errors
# [Sync API] Friendships: 156 synced, 0 errors
# [Cron Sync] Completed in 1234ms
```

---

## See Also

- [HYBRID_SYNC_STRATEGY.md](../HYBRID_SYNC_STRATEGY.md) - Complete sync strategy documentation
- [lib/sync.ts](../app/lib/sync.ts) - Sync implementation
- [lib/backend-api.ts](../app/lib/backend-api.ts) - Backend API functions
- [lib/transformers.ts](../app/lib/transformers.ts) - Data transformation utilities
