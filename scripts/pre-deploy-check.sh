#!/usr/bin/env bash
# ============================================================
# Sierra Estates — Pre-Deploy Checklist & Helper
# Run this before every deployment to verify readiness.
# Usage: bash scripts/pre-deploy-check.sh
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local result="$2"  # pass, fail, warn
  local detail="$3"
  
  case "$result" in
    pass)
      echo -e "${GREEN}✅${NC} $label"
      ((PASS++))
      ;;
    fail)
      echo -e "${RED}❌${NC} $label — $detail"
      ((FAIL++))
      ;;
    warn)
      echo -e "${YELLOW}⚠️${NC}  $label — $detail"
      ((WARN++))
      ;;
  esac
}

echo ""
echo "=========================================="
echo "  SIERRA ESTATES — PRE-DEPLOY CHECK"
echo "=========================================="
echo ""

# ─── 1. Environment Variables ───
echo "── Environment Variables ──"

ENV_FILE="apps/sierra-estates-realty/.env.local"
if [ -f "$ENV_FILE" ]; then
  check ".env.local exists" "pass" ""
  
  # Check critical vars
  for VAR in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_APP_ID FIREBASE_PRIVATE_KEY SBR_SECRET_KEY; do
    if grep -q "^${VAR}=.$" "$ENV_FILE" 2>/dev/null || grep -q "^${VAR}=[^[:space:]]" "$ENV_FILE" 2>/dev/null; then
      check "$VAR is set" "pass" ""
    else
      check "$VAR is set" "fail" "Required for production"
    fi
  done
else
  check ".env.local exists" "fail" "Copy from .env.local.example and fill in values"
fi

# ─── 2. Git Status ───
echo ""
echo "── Git Status ──"

if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  check "Working tree clean" "pass" ""
else
  check "Working tree clean" "warn" "Uncommitted changes detected"
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$BRANCH" = "main" ]; then
  check "On main branch" "pass" ""
else
  check "On main branch" "warn" "Currently on: $BRANCH"
fi

# ─── 3. Build ───
echo ""
echo "── Build Check ──"

if command -v pnpm &>/dev/null; then
  check "pnpm available" "pass" ""
else
  check "pnpm available" "fail" "Install: npm install -g pnpm@9"
fi

if [ -d "node_modules" ]; then
  check "Dependencies installed" "pass" ""
else
  check "Dependencies installed" "warn" "Run: pnpm install"
fi

# ─── 4. Firebase ───
echo ""
echo "── Firebase ──"

if command -v firebase &>/dev/null; then
  check "Firebase CLI available" "pass" ""
  
  PROJECT=$(firebase use 2>/dev/null | head -1 || echo "")
  if echo "$PROJECT" | grep -q "sierra-estates"; then
    check "Firebase project set" "pass" "Project: $PROJECT"
  else
    check "Firebase project set" "warn" "Run: firebase use sierra-estates"
  fi
else
  check "Firebase CLI available" "fail" "Install: npm install -g firebase-tools"
fi

if [ -f "firestore.rules" ]; then
  check "Firestore rules file exists" "pass" ""
else
  check "Firestore rules file exists" "fail" "Missing firestore.rules"
fi

if [ -f "storage.rules" ]; then
  check "Storage rules file exists" "pass" ""
else
  check "Storage rules file exists" "fail" "Missing storage.rules"
fi

# ─── 5. Security ───
echo ""
echo "── Security ──"

# Check for leaked secrets
if git log --all --oneline 2>/dev/null | grep -qi "serviceAccount\|private_key\|API_KEY.*="; then
  check "No secrets in git history" "warn" "Possible secrets found in git history — audit needed"
else
  check "No secrets in git history" "pass" ""
fi

# Check .gitignore
if grep -q "\.env\.local" .gitignore 2>/dev/null; then
  check ".env.local in .gitignore" "pass" ""
else
  check ".env.local in .gitignore" "fail" "Add .env.local to .gitignore immediately"
fi

if grep -q "serviceAccount" .gitignore 2>/dev/null; then
  check "Service account patterns in .gitignore" "pass" ""
else
  check "Service account patterns in .gitignore" "warn" "Add *serviceAccount*.json to .gitignore"
fi

# ─── 6. Code Quality ───
echo ""
echo "── Code Quality ──"

if [ -f "apps/sierra-estates-realty/next.config.ts" ]; then
  if grep -q "ignoreBuildErrors.*false" apps/sierra-estates-realty/next.config.ts 2>/dev/null; then
    check "TypeScript build errors NOT ignored" "pass" ""
  else
    check "TypeScript build errors NOT ignored" "warn" "Consider setting ignoreBuildErrors: false"
  fi
fi

if [ -f "LICENSE" ]; then
  check "LICENSE file exists" "pass" ""
else
  check "LICENSE file exists" "warn" "Add a LICENSE file"
fi

# ─── Summary ───
echo ""
echo "=========================================="
echo -e "  ${GREEN}PASS: $PASS${NC}  ${RED}FAIL: $FAIL${NC}  ${YELLOW}WARN: $WARN${NC}"
echo "=========================================="
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}❌ DEPLOYMENT BLOCKED — Fix FAIL items above before deploying.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings detected — Review before deploying.${NC}"
  exit 0
else
  echo -e "${GREEN}✅ All checks passed — Ready to deploy!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. pnpm build"
  echo "  2. firebase deploy --only firestore:rules,storage"
  echo "  3. firebase deploy --only functions"
  echo "  4. Push to main (triggers Vercel deployment)"
  exit 0
fi
