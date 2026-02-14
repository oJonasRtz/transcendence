#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DOMAIN="${DOMAIN:-transcendence42.xyz}"
ALT_DOMAIN="${ALT_DOMAIN:-www.${DOMAIN}}"
EMAIL="${EMAIL:-rflseijiueno@gmail.com}"
CRON_EXPR="${CRON_EXPR:-0 3 1 * *}"
INSTALL_CRON=1

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy-aws.sh [options]

Options:
  --domain <domain>        Primary domain (default: transcendence42.xyz)
  --alt-domain <domain>    Alternate domain/SAN (default: www.<domain>)
  --no-www                 Disable alternate domain
  --email <email>          Let's Encrypt email (default: rflseijiueno@gmail.com)
  --skip-cron              Skip automatic renewal cron installation
  --cron-expr <expr>       Cron expression for renewal (default: 0 3 1 * *)
  -h, --help               Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --alt-domain)
      ALT_DOMAIN="${2:-}"
      shift 2
      ;;
    --no-www)
      ALT_DOMAIN=""
      shift
      ;;
    --email)
      EMAIL="${2:-}"
      shift 2
      ;;
    --skip-cron)
      INSTALL_CRON=0
      shift
      ;;
    --cron-expr)
      CRON_EXPR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${DOMAIN}" ]]; then
  echo "ERROR: --domain cannot be empty" >&2
  exit 1
fi

if [[ -z "${EMAIL}" ]]; then
  echo "ERROR: --email cannot be empty" >&2
  exit 1
fi

require_cmd() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: ${command_name}" >&2
    exit 1
  fi
}

require_cmd make
require_cmd docker
if [[ "${INSTALL_CRON}" -eq 1 ]]; then
  require_cmd crontab
fi

cd "${PROJECT_ROOT}"

echo "Project root: ${PROJECT_ROOT}"
echo "Primary domain: ${DOMAIN}"
if [[ -n "${ALT_DOMAIN}" ]]; then
  echo "Alt domain: ${ALT_DOMAIN}"
else
  echo "Alt domain: disabled"
fi
echo "Let's Encrypt email: ${EMAIL}"

cert_init_args=(
  aws-cert-init
  "DOMAIN=${DOMAIN}"
  "EMAIL=${EMAIL}"
)
if [[ -n "${ALT_DOMAIN}" ]]; then
  cert_init_args+=("ALT_DOMAIN=${ALT_DOMAIN}")
else
  cert_init_args+=("ALT_DOMAIN=")
fi

echo
echo "Step 1/2: Issue or refresh Let's Encrypt certificate"
make "${cert_init_args[@]}"

echo
echo "Step 2/2: Build and deploy stack with public TLS at nginx"
make aws "DOMAIN=${DOMAIN}"

if [[ "${INSTALL_CRON}" -eq 1 ]]; then
  echo
  echo "Installing renewal cron entry..."
  existing_cron="$(crontab -l 2>/dev/null || true)"
  renewal_marker="# transcendence aws cert renew"
  renewal_job="${CRON_EXPR} cd ${PROJECT_ROOT} && make aws-cert-renew DOMAIN=${DOMAIN} >> /var/log/certbot-renew.log 2>&1 ${renewal_marker}"

  {
    if [[ -n "${existing_cron}" ]]; then
      printf '%s\n' "${existing_cron}" | grep -v "transcendence aws cert renew" || true
    fi
    echo "${renewal_job}"
  } | crontab -

  echo "Renewal cron configured:"
  echo "${renewal_job}"
else
  echo
  echo "Skipped renewal cron installation (--skip-cron)."
fi

echo
echo "Deployment finished."
