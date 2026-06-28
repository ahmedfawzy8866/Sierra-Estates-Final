#!/usr/bin/env bash
# ============================================================
# Sierra Estates — Vercel Deployment Script
#
# Deploys the public client site + light dashboard.
# Run this from the repo root.
#
# Usage: bash scripts/deploy-vercel.sh
# ============================================================

set -euo pipefail

echo ""
echo "=========================================="
echo "  SIERRA ESTATES — VERCEL DEPLOYMENT"
echo "=========================================="
echo ""

APP_DIR="apps/vercel-app"

# ─── Step 0: Check prerequisites ───
if ! command -v vercel &>/dev/null; then
  echo "❌ Vercel CLI not installed. Run: npm install -g vercel"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Vercel app directory not found: $APP_DIR"
  exit 1
fi

# ─── Step 1: Check env vars ───
echo "── Checking environment ──"

if [ -f "$APP_DIR/.env.local" ]; then
  echo "✅ .env.local found"
else
  echo "⚠️  No .env.local found. Copy from .env.local.example and fill in values."
  echo "   cp $APP_DIR/.env.local.example $APP_DIR/.env.local"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# ─── Step 2: Install dependencies ───
echo ""
echo "── Installing dependencies ──"
pnpm install 2>/dev/null || npm install

# ─── Step 3: Build ───
echo ""
echo "── Building Vercel app ──"
cd "$APP_DIR"
pnpm build 2>/dev/null || npm run build
cd ../..

echo "✅ Build complete"

# ─── Step 4: Deploy ───
echo ""
echo "── Deploying to Vercel ──"
echo ""
echo "IMPORTANT: When Vercel prompts for settings:"
echo "  Root Directory: apps/vercel-app"
echo "  Framework: Next.js"
echo "  Build Command: pnpm build"
echo "  Output Directory: .next"
echo ""

cd "$APP_DIR"
vercel --prod
cd ../..

echo ""
echo "✅ Vercel deployment complete!"
echo ""
echo "Your site: https://sierra-estates.net"
echo ""
