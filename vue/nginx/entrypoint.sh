#!/bin/sh
set -eu

CERT_DIR='/etc/nginx/certs'
FULLCHAIN_FILE="${CERT_DIR}/fullchain.cer"
KEY_FILE="${CERT_DIR}/private.key"

mkdir -p "${CERT_DIR}"

if [ ! -s "${FULLCHAIN_FILE}" ] || [ ! -s "${KEY_FILE}" ]; then
  openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 1 -keyout "${KEY_FILE}" -out "${FULLCHAIN_FILE}" -subj '/CN=localhost'
fi

exec nginx -g 'daemon off;'
