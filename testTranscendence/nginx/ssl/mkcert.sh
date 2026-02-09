#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT="$DIR/server.cert"
KEY="$DIR/server.key"

# Instala mkcert se não estiver
if ! command -v mkcert &> /dev/null; then
    echo "mkcert não encontrado, instalando..."
    curl -L -o /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
    chmod +x /usr/local/bin/mkcert
else
    echo "mkcert já está instalado."
fi

# Instala a autoridade local se ainda não existir
mkcert -install

# Gera o certificado e a chave
mkcert -key-file "$KEY" -cert-file "$CERT" localhost 127.0.0.1 ::1


echo "✅ Certificado gerado:"
echo " - $CERT"
echo " - $KEY"

