#!/usr/bin/env bash
# ============================================================
# Sierra Estates — FULL SETUP & DEPLOY
#
# Run this on your LOCAL machine (not in CI).
# It handles everything: auth, build, deploy both apps.
#
# Prerequisites:
#   - Node.js 20+
#   - pnpm 9+
#   - Firebase CLI: npm i -g firebase-tools
#   - Vercel CLI: npm i -g vercel
#
# Usage:
#   bash scripts/setup-and-deploy.sh
#
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}=========================================="
echo "  SIERRA ESTATES — FULL SETUP & DEPLOY"
echo -e "==========================================${NC}"
echo ""

# ─── Step 1: Authenticate ───
echo -e "${CYAN}── Step 1: Firebase Authentication ──${NC}"

if ! firebase projects:list &>/dev/null 2>&1; then
  echo "Opening browser for Firebase login..."
  firebase login
fi

echo -e "${GREEN}✅ Firebase authenticated${NC}"

# ─── Step 2: Select project ───
echo ""
echo -e "${CYAN}── Step 2: Select Firebase Project ──${NC}"

PROJECT="sierra-estates"
firebase use "$PROJECT" 2>/dev/null || {
  echo -e "${YELLOW}⚠️  Project '$PROJECT' not found.${NC}"
  echo "Available projects:"
  firebase projects:list 2>/dev/null
  echo ""
  read -p "Enter your Firebase project ID: " PROJECT
  firebase use "$PROJECT"
}

echo -e "${GREEN}✅ Using project: $PROJECT${NC}"

# ─── Step 3: Install dependencies ───
echo ""
echo -e "${CYAN}── Step 3: Install Dependencies ──${NC}"
pnpm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# ─── Step 4: Generate secrets (if first time) ───
echo ""
echo -e "${CYAN}── Step 4: Check Environment Secrets ──${NC}"

if [ ! -f "apps/vercel-app/.env.local" ]; then
  echo -e "${YELLOW}⚠️  No .env.local found. Generating secrets...${NC}"
  bash scripts/generate-secrets.sh
  
  echo ""
  echo "Copy the generated secrets and your Firebase credentials into:"
  echo "  apps/vercel-app/.env.local"
  echo ""
  echo "Use this template:"
  echo "  cp apps/vercel-app/.env.local.example apps/vercel-app/.env.local"
  echo ""
  read -p "Press Enter after you've filled in .env.local..."
fi

echo -e "${GREEN}✅ Environment configured${NC}"

# ─── Step 5: Build Cloud Functions ───
echo ""
echo -e "${CYAN}── Step 5: Build Cloud Functions ──${NC}"

cd functions
npm install --install-strategy=nested --legacy-peer-deps 2>/dev/null || npm install
npm run build
cd ..

echo -e "${GREEN}✅ Cloud Functions built${NC}"

# ─── Step 6: Deploy Firebase ───
echo ""
echo -e "${CYAN}── Step 6: Deploy Firebase (Rules + Functions + Hosting) ──${NC}"

echo "  → Deploying Firestore rules..."
firebase deploy --only firestore:rules --project "$PROJECT"

echo "  → Deploying Storage rules..."
firebase deploy --only storage --project "$PROJECT"

echo "  → Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project "$PROJECT" 2>/dev/null || true

echo "  → Deploying Cloud Functions..."
firebase deploy --only functions --project "$PROJECT"

echo "  → Deploying Admin Panel to Firebase Hosting..."
firebase deploy --only hosting --project "$PROJECT"

echo -e "${GREEN}✅ Firebase deployed${NC}"

# ─── Step 7: Set Firebase secrets ───
echo ""
echo -e "${CYAN}── Step 7: Set Cloud Function Secrets ──${NC}"
echo "Setting secrets for Cloud Functions..."

for SECRET_NAME in SBR_SECRET_KEY ENCRYPTION_KEY CRON_SECRET; do
  echo "  Setting $SECRET_NAME..."
  # Check if already set
  if firebase functions:secrets:access "$SECRET_NAME" --project "$PROJECT" &>/dev/null 2>&1; then
    echo "    Already set (skip)"
  else
    read -p "    Enter value for $SECRET_NAME: " SECRET_VALUE
    echo "$SECRET_VALUE" | firebase functions:secrets:set "$SECRET_NAME" --project "$PROJECT"
  fi
done

echo -e "${GREEN}✅ Cloud Function secrets configured${NC}"

# ─── Step 8: Deploy Vercel ───
echo ""
echo -e "${CYAN}── Step 8: Deploy Vercel App ──${NC}"

cd apps/vercel-app

# Check if Vercel is linked
if [ ! -d ".vercel" ]; then
  echo "Linking to Vercel project..."
  vercel link --yes
fi

echo "Deploying to production..."
vercel --prod

cd ../..

echo -e "${GREEN}✅ Vercel app deployed${NC}"

# ─── Step 9: Set custom claims ───
echo ""
echo -e "${CYAN}── Step 9: Set Custom Claims ──${NC}"
echo ""
echo "Set custom claims for each staff user:"
echo ""
echo "  node -e \""
echo "    const admin = require('firebase-admin');"
echo "    admin.initializeApp({ credential: admin.credential.applicationDefault() });"
echo "    admin.auth().setCustomUserClaims('USER_UID', { role: 'admin' });"
echo "  \""
echo ""
echo "Or use the seed endpoint after logging in:"
echo "  curl -X POST https://sierra-estates.net/api/seed/admin-setup \\"
echo "    -H 'Authorization: Bearer YOUR_ID_TOKEN'"
echo ""

# ─── Summary ───
echo ""
echo -e "${CYAN}=========================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo -e "==========================================${NC}"
echo ""
echo "Sites:"
echo "  🌐 Public site:     https://sierra-estates.net"
echo "  🔧 Admin panel:     https://$PROJECT.web.app"
echo "  🔧 Admin API:       https://europe-west1-$PROJECT.cloudfunctions.net/api"
echo ""
echo "Next steps:"
echo "  1. Configure webhook URLs in WhatsApp/Twilio/Telegram"
echo "  2. Set custom claims on all staff users"
echo "  3. Test the admin panel at https://$PROJECT.web.app"
echo "  4. Wire the client frontend when ready"
echo ""
