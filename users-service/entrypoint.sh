#!/bin/sh
set -e

# Export Docker Secrets as environment variables
if [ -f /run/secrets/cookie_secret ]; then
  export COOKIE_SECRET=$(cat /run/secrets/cookie_secret)
fi

# Execute the original command
exec "$@"
