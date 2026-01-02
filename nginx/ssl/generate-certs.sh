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

echo "🔐 Generating TLS certificate for NGINX..."

DOMAIN="localhost"
LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}')

openssl genrsa -out "$KEY" 4096

openssl req -x509 -new -nodes \
  -key "$KEY" \
  -sha256 \
  -days 3650 \
  -out "$CERT" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,IP:127.0.0.1,IP:$LOCAL_IP"

chmod 600 "$KEY"
chmod 644 "$CERT"

echo "✅ TLS certificate generated:"
echo " - $KEY"
echo " - $CERT"
