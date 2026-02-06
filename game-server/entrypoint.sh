#!/bin/sh
set -e

echo "🔐 [ENTRYPOINT] Loading Docker Secrets..." >&2

# Load Docker Secrets into variables
LOBBY_ID=""
LOBBY_PASS=""

if [ -f /run/secrets/lobby_id ]; then
  LOBBY_ID=$(cat /run/secrets/lobby_id)
fi

if [ -f /run/secrets/lobby_pass ]; then
  LOBBY_PASS=$(cat /run/secrets/lobby_pass)
fi

echo "✅ [ENTRYPOINT] Docker Secrets loaded successfully!" >&2
echo "🚀 [ENTRYPOINT] Starting: $@" >&2

# Execute with environment variables explicitly set
exec env \
  LOBBY_ID="$LOBBY_ID" \
  LOBBY_PASS="$LOBBY_PASS" \
  "$@"
