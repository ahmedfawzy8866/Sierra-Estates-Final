#!/usr/bin/env bash
# ============================================================
# Sierra Estates — Generate Secure Secrets
# Run this to generate all the secret keys you need.
# Usage: bash scripts/generate-secrets.sh
# ============================================================

set -euo pipefail

echo ""
echo "=========================================="
echo "  SIERRA ESTATES — SECRET GENERATOR"
echo "=========================================="
echo ""
echo "Copy these values into your Vercel environment variables"
echo "and/or Firebase Secret Manager."
echo ""

generate_secret() {
  local name="$1"
  local value
  value=$(openssl rand -hex 32)
  echo "$name=$value"
}

echo "── Internal Auth Secrets ──"
generate_secret "SBR_SECRET_KEY"
generate_secret "CRON_SECRET"
generate_secret "JWT_SECRET"
generate_secret "ENCRYPTION_KEY"

echo ""
echo "── WhatsApp Verify Token ──"
generate_secret "WHATSAPP_VERIFY_TOKEN"

echo ""
echo "── Telegram Webhook Secret ──"
generate_secret "TELEGRAM_WEBHOOK_SECRET"

echo ""
echo "⚠️  IMPORTANT:"
echo "  - NEVER commit these to git"
echo "  - Set them in Vercel Dashboard → Settings → Environment Variables"
echo "  - For Firebase Functions, use: firebase functions:secrets:set SECRET_NAME"
echo "  - Rotate quarterly or after any suspected exposure"
echo ""
