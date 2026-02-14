#!/bin/sh
# Docker Secrets to Environment Variables Converter
# This script reads Docker secrets from /run/secrets/ and exports them as environment variables
# Usage: Add as entrypoint in docker-compose.yml

set -e

# Function to read a secret and export as env var
read_secret() {
    local secret_name=$1
    local env_var_name=$2
    local secret_path="/run/secrets/${secret_name}"
    
    if [ -f "$secret_path" ]; then
        export "${env_var_name}"="$(cat "$secret_path")"
        echo "✓ Loaded secret: ${secret_name} → ${env_var_name}"
    else
        echo "⚠ Secret not found: ${secret_path} (using env var ${env_var_name} if set)"
    fi
}

echo "🔐 Loading Docker Secrets as Environment Variables..."

# Shared secrets (same for all team members)
read_secret "email_gmail_user" "EMAIL_GMAIL_USER"
read_secret "email_gmail_pass" "EMAIL_GMAIL_PASS"
read_secret "sightengine_user" "SIGHTENGINE_USER"
read_secret "sightengine_secret" "SIGHTENGINE_SECRET"
read_secret "lobby_id" "LOBBY_ID"
read_secret "lobby_pass" "LOBBY_PASS"
read_secret "grafana_admin_password" "GRAFANA_ADMIN_PASSWORD"

# Local secrets (unique per developer)
read_secret "jwt_secret" "JWT_SECRET"
read_secret "cookie_secret" "COOKIE_SECRET"
read_secret "session_secret" "SESSION_SECRET"
read_secret "sync_secret" "SYNC_SECRET"
read_secret "cron_secret" "CRON_SECRET"

echo "✅ Secrets loaded. Starting application..."

# Execute the original command (passed as arguments to this script)
exec "$@"
