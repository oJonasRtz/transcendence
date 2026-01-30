#!/bin/sh
set -eu

cd /app

if [ "${SKIP_PNPM_INSTALL:-}" = "1" ]; then
  exec "$@"
fi

if [ ! -f package.json ] || [ ! -f pnpm-lock.yaml ]; then
  echo "docker-entrypoint: missing package.json or pnpm-lock.yaml; skipping pnpm install" >&2
  exec "$@"
fi

HASH_FILE="node_modules/.deps-hash"

CURRENT_HASH="$(node - <<'NODE'
const crypto = require('crypto');
const fs = require('fs');

const pkg = fs.readFileSync('package.json');
const lock = fs.readFileSync('pnpm-lock.yaml');
const hash = crypto.createHash('sha256').update(pkg).update('\n').update(lock).digest('hex');
process.stdout.write(hash);
NODE
)"

STORED_HASH=""
if [ -f "$HASH_FILE" ]; then
  STORED_HASH="$(cat "$HASH_FILE" 2>/dev/null || true)"
fi

if [ ! -d node_modules ] || [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
  echo "docker-entrypoint: installing frontend deps (lock/package changed)" >&2
  pnpm install --frozen-lockfile
  mkdir -p node_modules
  echo "$CURRENT_HASH" > "$HASH_FILE"
fi

exec "$@"

