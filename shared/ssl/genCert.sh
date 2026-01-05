#!/bin/sh
set -e

CERT_DIR="$(dirname "$0")"
KEY="$CERT_DIR/server.key"
CERT="$CERT_DIR/server.cert"

mkdir -p "$CERT_DIR"

if [ -f "$KEY" ] && [ -f "$CERT" ]; then
  echo "✅ TLS certificate already exists. Skipping."
  exit 0
fi

echo "🔐 Generating TLS certificate..."

DOMAIN="localhost"
LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}')
SAN_LIST="DNS:localhost,\
DNS:api-gateway,\
DNS:auth-service,\
DNS:users-service,\
DNS:match-service,\
DNS:game-server,\
DNS:chat-service,\
DNS:sqlite-db,\
IP:127.0.0.1,\
IP:$LOCAL_IP"

openssl genrsa -out "$KEY" 4096

openssl req -x509 -new -nodes \
  -key "$KEY" \
  -sha256 \
  -days 3650 \
  -out "$CERT" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=$SAN_LIST"

chmod 600 "$KEY"
chmod 644 "$CERT"

echo "✅ TLS certificate generated:"
echo " - $SAN_LIST"
echo " - $KEY"
echo " - $CERT"
