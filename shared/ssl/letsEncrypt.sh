#!/bin/bash
set -e

# Dependências
# Você precisa instalar o lego (cliente ACME em Go) antes.
# Exemplo de instalação (no Linux):
#   curl -sL https://github.com/go-acme/lego/releases/download/v4.7.0/lego_v4.7.0_linux_amd64.tar.gz \
#     | tar xz
#   sudo mv lego /usr/local/bin/

if ! command -v lego &> /dev/null; then
    echo "Instalando Lego ACME client..."

    curl -sL https://github.com/go-acme/lego/releases/download/v4.7.0/lego_v4.7.0_linux_amd64.tar.gz | tar xz
    mv lego /usr/local/bin/
fi

IP=$(hostname -I | awk '{print $1}')
EMAIL="jonas@temp.com"
if [ -z "$IP" ] || [ -z "$EMAIL" ]; then
  echo "Uso: $0 <IP> <email>"
  exit 1
fi

# Diretório para lego armazenar dados
LEGO_DIR="./lego-data"

# Executa o lego para solicitar cert para IP
lego --server "https://acme-staging-v02.api.letsencrypt.org/directory" \
     --email "$EMAIL" \
     --domains "$IP" \
     --http \
     --profile shortlived \
     --path "$LEGO_DIR" run

# Após emissão, os arquivos ficarão em lego-data/certificates
CERT_FILE="$LEGO_DIR/certificates/$IP.crt"
KEY_FILE="$LEGO_DIR/certificates/$IP.key"

echo "Certificado gerado:"
echo "  Cert: $CERT_FILE"
echo "  Key:  $KEY_FILE"
