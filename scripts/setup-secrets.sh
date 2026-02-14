#!/bin/bash
# Docker Secrets Setup Script
# Creates Docker secret files from team configuration or prompts

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS_DIR="${PROJECT_ROOT}/secrets"
TEAM_SECRETS_FILE="${PROJECT_ROOT}/team-secrets.txt"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔐 Docker Secrets Setup for Transcendence Project"
echo "=================================================="
echo ""

# Create secrets directory
mkdir -p "$SECRETS_DIR"

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

# Function to write secret to file
write_secret() {
    local name=$1
    local value=$2
    local file="${SECRETS_DIR}/${name}.txt"
    
    echo -n "$value" > "$file"
    chmod 600 "$file"
    echo -e "${GREEN}✓${NC} Created: secrets/${name}.txt"
}

# Generate local secrets (unique per developer)
echo "📝 Generating LOCAL secrets (unique for you)..."
write_secret "jwt_secret" "$(generate_secret)"
write_secret "cookie_secret" "$(generate_secret)"
write_secret "session_secret" "$(generate_secret)"
write_secret "sync_secret" "$(generate_secret)"
write_secret "cron_secret" "$(generate_secret)"
echo ""

# Handle shared secrets
echo "📤 Setting up SHARED secrets (same for all team)..."
if [ -f "$TEAM_SECRETS_FILE" ]; then
    echo -e "${YELLOW}Found team-secrets.txt${NC}"
    
    # Read shared secrets from file
    EMAIL_GMAIL_USER=$(grep '^EMAIL_GMAIL_USER=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    EMAIL_GMAIL_PASS=$(grep '^EMAIL_GMAIL_PASS=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    SIGHTENGINE_USER=$(grep '^SIGHTENGINE_USER=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    SIGHTENGINE_SECRET=$(grep '^SIGHTENGINE_SECRET=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    LOBBY_ID=$(grep '^LOBBY_ID=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    LOBBY_PASS=$(grep '^LOBBY_PASS=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    GRAFANA_ADMIN_PASSWORD=$(grep '^GRAFANA_ADMIN_PASSWORD=' "$TEAM_SECRETS_FILE" | cut -d'=' -f2)
    
    write_secret "email_gmail_user" "$EMAIL_GMAIL_USER"
    write_secret "email_gmail_pass" "$EMAIL_GMAIL_PASS"
    write_secret "sightengine_user" "$SIGHTENGINE_USER"
    write_secret "sightengine_secret" "$SIGHTENGINE_SECRET"
    write_secret "lobby_id" "$LOBBY_ID"
    write_secret "lobby_pass" "$LOBBY_PASS"
    write_secret "grafana_admin_password" "$GRAFANA_ADMIN_PASSWORD"
else
    echo -e "${YELLOW}team-secrets.txt not found. Please enter shared secrets:${NC}"
    
    read -p "EMAIL_GMAIL_USER: " EMAIL_GMAIL_USER
    read -p "EMAIL_GMAIL_PASS: " EMAIL_GMAIL_PASS
    read -p "SIGHTENGINE_USER: " SIGHTENGINE_USER
    read -p "SIGHTENGINE_SECRET: " SIGHTENGINE_SECRET
    read -p "LOBBY_ID: " LOBBY_ID
    read -p "LOBBY_PASS: " LOBBY_PASS
    read -p "GRAFANA_ADMIN_PASSWORD: " GRAFANA_ADMIN_PASSWORD
    
    write_secret "email_gmail_user" "$EMAIL_GMAIL_USER"
    write_secret "email_gmail_pass" "$EMAIL_GMAIL_PASS"
    write_secret "sightengine_user" "$SIGHTENGINE_USER"
    write_secret "sightengine_secret" "$SIGHTENGINE_SECRET"
    write_secret "lobby_id" "$LOBBY_ID"
    write_secret "lobby_pass" "$LOBBY_PASS"
    write_secret "grafana_admin_password" "$GRAFANA_ADMIN_PASSWORD"
fi

echo ""
echo -e "${GREEN}✅ All secrets created successfully!${NC}"
echo ""
echo "📁 Secret files location: ${SECRETS_DIR}/"
echo "🔒 File permissions: 600 (read/write for owner only)"
echo ""
echo "Next steps:"
echo "  1. Run: docker compose build"
echo "  2. Run: docker compose up -d"
echo "  3. Check logs: docker compose logs -f"
