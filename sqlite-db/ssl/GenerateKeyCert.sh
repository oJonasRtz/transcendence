#!/bin/bash
set -e

# Gera a chave privada
openssl genrsa -out server.key 2048

# Gera o certificado autoassinado usando a chave
openssl req -new -x509 -key server.key -out server.cert -days 365
