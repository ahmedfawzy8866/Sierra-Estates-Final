# Sierra Estates — Post-Deployment Setup Guide

This guide covers the manual steps needed after the code fixes have been deployed.

## 1. 🔑 Set WEBHOOK_SHARED_SECRET in Vercel

A secure secret has been generated for you: **use a new one from the command below**

```bash
# Generate a fresh secret (run this locally)
openssl rand -base64 32 | tr -d '/+=' | head -c 32

# Set it in Vercel (choose one method)
# Method A: Vercel Dashboard
#   1. Go to https://vercel.com/dashboard
#   2. Select your Sierra Estates project
#   3. Settings → Environment Variables
#   4. Add: WEBHOOK_SHARED_SECRET = <your-generated-secret>
#   5. Select Production + Preview + Development
#   6. Click Save, then Redeploy

# Method B: Vercel CLI
vercel login
cd apps/vercel-app
vercel env add WEBHOOK_SHARED_SECRET
# Paste your generated secret when prompted
vercel --prod  # Redeploy to apply
```

## 2. 👤 Seed Admin Emails to Firestore

Choose one of these methods:

### Method A: Firebase Console (Easiest — No CLI needed)

1. Open **[Firebase Console](https://console.firebase.google.com)** → Project `sierra-blu`
2. Go to **Firestore Database**
3. Click **"Start collection"** or find the `admins` collection
4. Add these documents (use the **email as the Document ID**):

| Document ID (email) | Fields |
|---|---|
| `A.fawzy8866@gmail.com` | `email: "A.fawzy8866@gmail.com"`, `role: "super_admin"`, `name: "Ahmed Fawzy"`, `createdAt: <current timestamp>`, `createdBy: "manual-seed"` |
| `emeraldestatesegypt@gmail.com` | `email: "emeraldestatesegypt@gmail.com"`, `role: "admin"`, `name: "Emerald Estates"`, `createdAt: <current timestamp>`, `createdBy: "manual-seed"` |

### Method B: Bootstrap Script (Requires Service Account Key)

```bash
# 1. Download service account key from Firebase Console:
#    Project Settings → Service Accounts → Generate New Private Key

# 2. Set the env var and run the script
export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
node scripts/bootstrap-admins.js
```

### Method C: Cloud Function (Auto-deploys with Firebase)

```bash
firebase login
firebase deploy --only functions:adminSeed

# Invoke the function with a valid Firebase ID token:
curl -X POST \
  "https://europe-west1-sierra-blu.cloudfunctions.net/adminSeed" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

## 3. 🔄 Rotate Your GitHub PAT

Your GitHub Personal Access Token was exposed in a previous chat session.
**Rotate it immediately:**

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens**
2. Delete the old token
3. Generate a new one with the same permissions
4. Update your local git credentials:
   ```bash
   git remote set-url origin https://<NEW_PAT>@github.com/ahmedfawzy8866/Sierra-Estates-Final.git
   ```

## 4. ✅ Verify Everything Works

After completing steps 1-3:

1. **Webhook auth**: Send a test POST to `/api/webhooks/whatsapp` without auth → should get 401
2. **Rate limiting**: Check Vercel function logs for `[rate-limit] Upstash Redis connected`
3. **Cron**: Check Vercel function logs for `drain-whatsapp` invocations every 2 minutes
4. **Admin access**: Sign in as admin → verify Firestore rules allow access
5. **Input validation**: POST invalid JSON to `/api/leads` → should get 400 with field errors
