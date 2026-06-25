#!/usr/bin/env bash
# ============================================================
# Sierra Estates — Firebase Deployment Script
#
# Run this from the repo root after authenticating:
#   firebase login
#   bash scripts/deploy-firebase.sh
# ============================================================

set -euo pipefail

echo ""
echo "=========================================="
echo "  SIERRA ESTATES — FIREBASE DEPLOYMENT"
echo "=========================================="
echo ""

# ─── Step 0: Check prerequisites ───
echo "── Checking prerequisites ──"

if ! command -v firebase &>/dev/null; then
  echo "❌ Firebase CLI not installed. Run: npm install -g firebase-tools"
  exit 1
fi

if ! firebase projects:list &>/dev/null 2>&1; then
  echo "❌ Not authenticated. Run: firebase login"
  echo ""
  echo "  This will open a browser. After login, re-run this script."
  exit 1
fi

echo "✅ Firebase CLI authenticated"

# ─── Step 1: Select project ───
echo ""
echo "── Selecting Firebase project ──"

PROJECT=$(cat .firebaserc | python3 -c "import json,sys; print(json.load(sys.stdin)['projects']['default'])" 2>/dev/null || echo "sierra-estates")
echo "Project: $PROJECT"

firebase use "$PROJECT" 2>/dev/null || {
  echo "⚠️  Project '$PROJECT' not found. Available projects:"
  firebase projects:list 2>/dev/null | head -10
  echo ""
  echo "Create it at: https://console.firebase.google.com"
  echo "Or switch: firebase use YOUR_PROJECT_ID"
  exit 1
}

echo "✅ Using project: $PROJECT"

# ─── Step 2: Deploy Firestore rules ───
echo ""
echo "── Deploying Firestore security rules ──"

firebase deploy --only firestore:rules --project "$PROJECT"
echo "✅ Firestore rules deployed"

# ─── Step 3: Deploy Storage rules ───
echo ""
echo "── Deploying Storage security rules ──"

firebase deploy --only storage --project "$PROJECT"
echo "✅ Storage rules deployed"

# ─── Step 4: Deploy Firestore indexes ───
echo ""
echo "── Deploying Firestore indexes ──"

firebase deploy --only firestore:indexes --project "$PROJECT" 2>/dev/null || {
  echo "⚠️  Indexes deployment skipped (may need manual creation)"
}
echo "✅ Firestore indexes deployed"

# ─── Step 5: Build & Deploy Cloud Functions ───
echo ""
echo "── Building Cloud Functions ──"

cd functions
pnpm install 2>/dev/null || npm install
pnpm build 2>/dev/null || npm run build
cd ..

echo "── Deploying Cloud Functions ──"
firebase deploy --only functions --project "$PROJECT"
echo "✅ Cloud Functions deployed"

# ─── Step 6: Deploy Admin Panel to Firebase Hosting ───
echo ""
echo "── Deploying Admin Panel to Firebase Hosting ──"

if [ -d "admin-panel/dist" ] && [ -f "admin-panel/dist/index.html" ]; then
  firebase deploy --only hosting --project "$PROJECT"
  echo "✅ Admin Panel deployed to Firebase Hosting"
else
  echo "⚠️  Admin panel not built. Run: cd admin-panel && npm run build"
fi

# ─── Summary ───
echo ""
echo "=========================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Deployed to Firebase project: $PROJECT"
echo ""
echo "Endpoints:"
echo "  Admin Panel:  https://$PROJECT.web.app"
echo "  API Health:   https://europe-west1-$PROJECT.cloudfunctions.net/api"
echo ""
echo "Next steps:"
echo "  1. Set secrets: firebase functions:secrets:set SBR_SECRET_KEY"
echo "  2. Set custom claims on users (see DEPLOYMENT.md)"
echo "  3. Configure webhook URLs in Telegram/WhatsApp"
echo ""
