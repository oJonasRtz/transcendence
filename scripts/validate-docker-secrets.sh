#!/bin/bash
# Quick validation script for Docker Secrets implementation

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Docker Secrets Implementation Validation"
echo "==========================================="
echo ""

# Check if team-secrets.txt exists
if [ -f "team-secrets.txt" ]; then
    echo -e "${GREEN}✓${NC} team-secrets.txt exists"
else
    echo -e "${RED}✗${NC} team-secrets.txt NOT FOUND"
    echo "  → Run: cp team-secrets.template.txt team-secrets.txt (if exists)"
    echo "  → Or request from team via Discord"
fi

# Check if setup script exists and is executable
if [ -x "scripts/setup-secrets.sh" ]; then
    echo -e "${GREEN}✓${NC} setup-secrets.sh is executable"
else
    echo -e "${YELLOW}⚠${NC} setup-secrets.sh is not executable"
    echo "  → Run: chmod +x scripts/setup-secrets.sh"
fi

# Check docker-compose.yml syntax
if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} docker-compose.yml syntax is valid"
else
    echo -e "${RED}✗${NC} docker-compose.yml has syntax errors"
    docker compose config 2>&1 | head -10
fi

# Check if secrets directory exists
if [ -d "secrets" ]; then
    SECRET_COUNT=$(ls -1 secrets/*.txt 2>/dev/null | wc -l)
    if [ "$SECRET_COUNT" -eq 12 ]; then
        echo -e "${GREEN}✓${NC} All 12 secret files exist in secrets/"
    else
        echo -e "${YELLOW}⚠${NC} Found $SECRET_COUNT secret files (expected 12)"
        echo "  → Run: ./scripts/setup-secrets.sh"
    fi
else
    echo -e "${YELLOW}⚠${NC} secrets/ directory does not exist"
    echo "  → Run: ./scripts/setup-secrets.sh"
fi

# Check .gitignore
if grep -q "team-secrets.txt" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} team-secrets.txt is in .gitignore"
else
    echo -e "${RED}✗${NC} team-secrets.txt NOT in .gitignore (SECURITY RISK!)"
fi

if grep -q "secrets/" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} secrets/ is in .gitignore"
else
    echo -e "${RED}✗${NC} secrets/ NOT in .gitignore (SECURITY RISK!)"
fi

# Check services with entrypoints
echo ""
echo "📋 Services with Docker Secrets entrypoints:"
SERVICES_WITH_ENTRYPOINT=$(grep -B10 "entrypoint:" docker-compose.yml | grep -E "^\s+[a-z-]+:" | sed 's/://g' | sed 's/^[ \t]*//' | sort -u)
echo "$SERVICES_WITH_ENTRYPOINT" | while read service; do
    echo -e "   ${GREEN}✓${NC} $service"
done

echo ""
echo "================================"
echo ""

# Final recommendation
if [ -d "secrets" ] && [ "$SECRET_COUNT" -eq 12 ]; then
    echo -e "${GREEN}✅ Ready to build and run!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. docker compose build"
    echo "  2. docker compose up -d"
    echo "  3. docker compose logs -f"
else
    echo -e "${YELLOW}⚠ Setup required before running${NC}"
    echo ""
    echo "Run this first:"
    echo "  ./scripts/setup-secrets.sh"
fi
