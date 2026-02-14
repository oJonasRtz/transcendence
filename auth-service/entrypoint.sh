#!/bin/sh
set -e

echo "🔐 [ENTRYPOINT] Loading Docker Secrets..." >&2

# Load Docker Secrets into variables
JWT_SECRET=""
COOKIE_SECRET=""

if [ -f /run/secrets/jwt_secret ]; then
  JWT_SECRET=$(cat /run/secrets/jwt_secret)
fi

if [ -f /run/secrets/cookie_secret ]; then
  COOKIE_SECRET=$(cat /run/secrets/cookie_secret)
fi

echo "✅ [ENTRYPOINT] Docker Secrets loaded successfully!" >&2
echo "🚀 [ENTRYPOINT] Starting: $@" >&2

# Execute with environment variables explicitly set
exec env \
  JWT_SECRET="$JWT_SECRET" \
  COOKIE_SECRET="$COOKIE_SECRET" \
  "$@"
