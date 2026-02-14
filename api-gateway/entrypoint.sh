#!/bin/sh
set -e

echo "🔐 [ENTRYPOINT] Loading Docker Secrets..." >&2

# Load Docker Secrets into variables
JWT_SECRET=""
COOKIE_SECRET=""
SESSION_SECRET=""
EMAIL_GMAIL_USER=""
EMAIL_GMAIL_PASS=""
SIGHTENGINE_USER=""
SIGHTENGINE_SECRET=""

if [ -f /run/secrets/jwt_secret ]; then
  JWT_SECRET=$(cat /run/secrets/jwt_secret)
fi

if [ -f /run/secrets/cookie_secret ]; then
  COOKIE_SECRET=$(cat /run/secrets/cookie_secret)
fi

if [ -f /run/secrets/session_secret ]; then
  SESSION_SECRET=$(cat /run/secrets/session_secret)
fi

if [ -f /run/secrets/email_gmail_user ]; then
  EMAIL_GMAIL_USER=$(cat /run/secrets/email_gmail_user)
fi

if [ -f /run/secrets/email_gmail_pass ]; then
  EMAIL_GMAIL_PASS=$(cat /run/secrets/email_gmail_pass)
fi

if [ -f /run/secrets/sightengine_user ]; then
  SIGHTENGINE_USER=$(cat /run/secrets/sightengine_user)
fi

if [ -f /run/secrets/sightengine_secret ]; then
  SIGHTENGINE_SECRET=$(cat /run/secrets/sightengine_secret)
fi

echo "✅ [ENTRYPOINT] Docker Secrets loaded successfully!" >&2
echo "🚀 [ENTRYPOINT] Starting: $@" >&2

# Execute with environment variables explicitly set
exec env \
  JWT_SECRET="$JWT_SECRET" \
  COOKIE_SECRET="$COOKIE_SECRET" \
  SESSION_SECRET="$SESSION_SECRET" \
  EMAIL_GMAIL_USER="$EMAIL_GMAIL_USER" \
  EMAIL_GMAIL_PASS="$EMAIL_GMAIL_PASS" \
  SIGHTENGINE_USER="$SIGHTENGINE_USER" \
  SIGHTENGINE_SECRET="$SIGHTENGINE_SECRET" \
  "$@"
