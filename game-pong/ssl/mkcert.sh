#!/bin/bash
set -e

CERT="server.cert"
KEY="server.key"

# Instala a autoridade local se ainda não existir
mkcert -install

# Gera o certificado e a chave
mkcert -key-file "$KEY" -cert-file "$CERT" localhost 127.0.0.1 ::1

echo "✅ Certificado gerado:"
echo " - $CERT"
echo " - $KEY"
