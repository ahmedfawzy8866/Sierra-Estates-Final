# Sierra Estates — Deployment Guide

## Two-App Deployment Architecture

```
Vercel → apps/vercel-app (Next.js)
  sierra-estates.net           Public site + light dashboard
  sierra-estates.net/api/*     Read-only APIs + rewrites to Firebase

Firebase → apps/firebase-admin (Cloud Functions)
  admin-api.sierra-estates.net Admin APIs + bots + scrapers + cron
```

## Deploy Vercel App

### One-Time Setup
1. Connect GitHub repo to Vercel
2. **Root Directory**: `apps/vercel-app`
3. Framework: Next.js (auto-detected)
4. Set environment variables (see `.env.local.example`)
5. Key vars:
   - `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
   - `FIREBASE_PRIVATE_KEY` — Admin SDK (server-side)
   - `FIREBASE_ADMIN_URL` — Firebase Admin API base URL
   - `SBR_SECRET_KEY` — Webhook auth secret

### Deploy
```bash
# Push to main triggers auto-deploy
git push origin main

# Or manual deploy
cd apps/vercel-app && vercel --prod
```

## Deploy Firebase Admin App

### One-Time Setup
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Select project: `firebase use sierra-estates`
4. Set secrets:
   ```bash
   firebase functions:secrets:set SBR_SECRET_KEY
   firebase functions:secrets:set ENCRYPTION_KEY
   ```

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## Set Custom Claims

After deploying, set custom claims on each user:

```bash
# Using Firebase Admin SDK
node -e "
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  admin.auth().setCustomUserClaims('USER_UID', { role: 'admin' });
"

# Or via the seed endpoint
curl -X POST https://sierra-estates.net/api/seed/admin-setup \
  -H 'Authorization: Bearer YOUR_ID_TOKEN'
```

## Independent Deploy Verification

After deploying each app independently, verify:

### Vercel App
```bash
curl https://sierra-estates.net/api/listings   # Should return listings
curl https://sierra-estates.net/api/leads       # Should accept POST
```

### Firebase Admin App
```bash
curl https://admin-api.sierra-estates.net/api/health  # Health check
curl -X POST https://sierra-estates.net/api/webhooks/whatsapp \
  -H 'X-SBR-SECRET-KEY: YOUR_KEY'  # Proxied via Vercel rewrite
```

## Rollback

### Vercel
- Dashboard → Deployments → Redeploy previous
- Or: `vercel rollback`

### Firebase
```bash
firebase hosting:rollback
firebase deploy --only functions --force  # Redeploy previous function code
```
