#!/usr/bin/env bash
# Sierra Estates 1.0 — supervisor wrapper (fallback when systemd is unavailable,
# e.g. shared hosting). Keeps engine_core.py alive 24/7 with exponential backoff.
#   Usage:  nohup ./devops/run_engine.sh >/var/log/sierra-engine.log 2>&1 &
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${SIERRA_ENV_FILE:-/etc/sierra-estates/.env}"
PY="${ROOT}/.venv/bin/python"
ENTRY="${ROOT}/bots/whatsapp-scraper-bot/engine_core.py"

[ -f "$ENV_FILE" ] || { echo "FATAL: env file not found: $ENV_FILE"; exit 1; }
set -a; source "$ENV_FILE"; set +a

cd "$ROOT"
backoff=5
while true; do
  echo "[$(date -Is)] starting engine_core"
  if "$PY" -u "$ENTRY"; then
    echo "[$(date -Is)] engine exited cleanly; restarting"
    backoff=5
  else
    code=$?
    echo "[$(date -Is)] engine crashed (exit $code); retry in ${backoff}s"
  fi
  sleep "$backoff"
  backoff=$(( backoff < 300 ? backoff * 2 : 300 ))   # cap at 5 minutes
done
