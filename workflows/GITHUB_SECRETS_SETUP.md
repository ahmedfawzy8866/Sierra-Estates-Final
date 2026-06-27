# GitHub Secrets Setup for CI/CD

All API credentials are stored as **GitHub Secrets** (encrypted) instead of .env files in the repo.

## How to Add Secrets

1. Go to: https://github.com/ahmedfawzy8866/Sierra-Estates-Final
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret below

---

## Secrets by Workflow

### CI Pipeline (`.github/workflows/ci.yml`)
Runs on every push/PR to `main`.

| Secret | Required | Description |
|--------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Recommended | Firebase web client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Recommended | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Recommended | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Recommended | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Recommended | Firebase app ID |

> **Note:** CI has fallback placeholders so it won't block if missing, but set all 6 for proper validation.

---

### Deploy Pipeline (`.github/workflows/deploy.yml`)
Runs on every push to `main`.

| Secret | Required | Description |
|--------|----------|-------------|
| `VERCEL_TOKEN` | **Yes** | Vercel API token |
| `VERCEL_ORG_ID` | **Yes** | Vercel organization ID |
| `VERCEL_CLIENT_PROJECT_ID` | **Yes** | Vercel project ID for client portal |
| `FIREBASE_SERVICE_ACCOUNT` | **Yes** | Full Firebase service account JSON |
| `SENTRY_DSN` | Recommended | Sentry server-side DSN for error monitoring |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Sentry client-side DSN |

**How to get Vercel credentials:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login` and `vercel link` in your project
3. Copy from `.vercel/project.json`: `orgId` and `projectId`
4. Token from https://vercel.com/account/tokens

---

### Firebase Deploy (`.github/workflows/deploy-firebase.yml`)
Manual trigger only (Actions tab → Run workflow).

| Secret | Required | Description |
|--------|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_SIERRA_BLU` | **Yes** | Firebase SA JSON with Hosting Admin + Cloud Run Admin roles |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Recommended | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Recommended | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Recommended | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Recommended | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Recommended | Firebase web config |

**How to create the Firebase service account:**
1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select the `sierra-estates` project
3. Create SA → name `github-actions-deploy`
4. Grant: **Firebase Hosting Admin**, **Cloud Run Admin**, **Service Account User**
5. Create JSON key → copy entire JSON → paste into secret

---

### External Workflows (`.github/workflows/external-workflows.yml`)
Scheduled cron + manual trigger.

| Secret | Required | Used By |
|--------|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | **Yes** | All workflows |
| `BROKER_INBOX_SHEET_ID` | **Yes** | All workflows |
| `PROPERTY_FINDER_API_BASE` | Owner Search | `owner-search` |
| `PROPERTY_FINDER_JWT_TOKEN` | Owner Search | `owner-search` |
| `WHATSAPP_API_URL` | Owner Contact | `owner-contact` |
| `WHATSAPP_API_TOKEN` | Owner Contact | `owner-contact` |
| `SENDGRID_API_KEY` | Email Sender | `email-sender` |
| `SENDGRID_FROM_EMAIL` | Email Sender | `email-sender` |
| `FIREBASE_PROJECT_ID` | Unit Adder | `unit-adder` |
| `FIREBASE_PRIVATE_KEY` | Unit Adder | `unit-adder` |
| `FIREBASE_CLIENT_EMAIL` | Unit Adder | `unit-adder` |

---

## Complete Secrets Checklist (22 total)

```
# ─── Vercel Deployment ───
[ ] VERCEL_TOKEN
[ ] VERCEL_ORG_ID
[ ] VERCEL_CLIENT_PROJECT_ID
[ ] VERCEL_ADMIN_PROJECT_ID

# ─── Firebase (Client SDK — public config) ───
[ ] NEXT_PUBLIC_FIREBASE_API_KEY
[ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
[ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
[ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
[ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
[ ] NEXT_PUBLIC_FIREBASE_APP_ID

# ─── Firebase (Admin/Server) ───
[ ] FIREBASE_SERVICE_ACCOUNT
[ ] FIREBASE_SERVICE_ACCOUNT_SIERRA_BLU

# ─── Google Cloud / Sheets ───
[ ] GOOGLE_SERVICE_ACCOUNT_KEY
[ ] BROKER_INBOX_SHEET_ID

# ─── Property Finder API ───
[ ] PROPERTY_FINDER_API_BASE
[ ] PROPERTY_FINDER_JWT_TOKEN

# ─── WhatsApp (Meta Cloud API) ───
[ ] WHATSAPP_API_URL
[ ] WHATSAPP_API_TOKEN

# ─── Email (SendGrid) ───
[ ] SENDGRID_API_KEY
[ ] SENDGRID_FROM_EMAIL

# ─── Firebase (Unit Adder) ───
[ ] FIREBASE_PROJECT_ID
[ ] FIREBASE_PRIVATE_KEY
[ ] FIREBASE_CLIENT_EMAIL
```

---

## Verification

1. Go to: https://github.com/ahmedfawzy8866/Sierra-Estates-Final/settings/secrets/actions
2. Verify all 22 secrets listed
3. Trigger CI: **Actions → CI → Run workflow**
4. Trigger deploy: **Actions → Deploy Sierra Estates 3.0 → Run workflow**

---

## Cron Schedule (External Workflows)

| Workflow | UTC | Cairo (UTC+2) |
|----------|-----|----------------|
| Owner Search | 9:00 AM daily | 11:00 AM |
| Owner Contact | 10:00 AM daily | 12:00 PM |
| Email Sender | 8:00 AM daily | 10:00 AM |
| Unit Adder | Every 30 min | Every 30 min |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "PERMISSION_DENIED" on Sheets | Grant Editor access to SA email on the Sheet |
| "Invalid credential" | Re-copy entire JSON content (not file path) |
| "401 Unauthorized" (Vercel) | Regenerate token at vercel.com/account/tokens |
| "403 Forbidden" (Firebase) | Ensure SA has Hosting Admin + Cloud Run Admin roles |
| Workflow doesn't run | Actions tab → ensure workflows are enabled |
| Build fails on missing env | Ensure all 6 NEXT_PUBLIC_FIREBASE_* secrets are set |