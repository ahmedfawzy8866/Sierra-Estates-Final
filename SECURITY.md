# Sierra Estates — Security Hardening Guide

## Pre-Deployment Security Checklist

### 1. Firebase Security Rules (CRITICAL — Do First)

Production Firestore currently allows `read, write: if request.auth != null`.
The hardened rules are in the repo — deploy them:

```bash
firebase use sierra-estates
firebase deploy --only firestore:rules,storage
```

**Verify**: Every staff user must have a `users/{uid}` doc with `role` in `{admin, manager, agent}`.

### 2. Rotate Compromised API Keys

If any API key was committed to git history (even in old commits), rotate it:

1. **Firebase Web API Key** — Go to Google Cloud Console → APIs & Services → Credentials
   - Delete the old key
   - Create a new key with HTTP referrer restrictions (sierra-estates.net)
   - Update `NEXT_PUBLIC_FIREBASE_API_KEY` in Vercel
2. **All other API keys** — If in doubt, rotate

### 3. Enable Firebase App Check

Prevents abusive direct client-SDK traffic:

```bash
firebase appcheck:sites:config:update --project sierra-estates
```

### 4. Set All Environment Secrets

**In Vercel Dashboard** (Settings → Environment Variables):

| Category | Variables |
|----------|-----------|
| Firebase Client | `NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` |
| Firebase Admin | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |
| Internal Auth | `SBR_SECRET_KEY`, `CRON_SECRET`, `JWT_SECRET`, `ENCRYPTION_KEY` |
| AI | `GOOGLE_AI_API_KEY`, `AI_PROVIDER` |
| Integrations | `TELEGRAM_BOT_TOKEN`, `WHATSAPP_*`, `PROPERTY_FINDER_API_KEY` |

**Generate secrets:**
```bash
bash scripts/generate-secrets.sh
```

**For Firebase Cloud Functions:**
```bash
firebase functions:secrets:set SBR_SECRET_KEY
firebase functions:secrets:set ENCRYPTION_KEY
firebase deploy --only functions
```

### 5. Telegram Webhook Security

Register with secret token:
```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://sierra-estates.net/api/telegram/webhook" \
  -d "secret_token=${TELEGRAM_WEBHOOK_SECRET}"
```

### 6. Branch Protection

```bash
bash scripts/setup-branch-protection.sh
```

Or manually at: https://github.com/ahmedfawzy8866/Sierra-Estates-Final/settings/branches

### 7. Rate Limiting

Public endpoints already have rate limiting. For multi-instance consistency,
set Upstash Redis credentials:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 8. CORS Configuration

Set `ALLOWED_ORIGNS` in Vercel to restrict API access:
```
ALLOWED_ORIGNS=https://sierra-estates.net,https://admin.sierra-estates.net
```

## Ongoing Security Maintenance

### Quarterly
- [ ] Rotate `SBR_SECRET_KEY`, `JWT_SECRET`, Firebase admin key
- [ ] Review Firestore rules for new collections
- [ ] Audit GitHub Actions secrets

### After Any Incident
- [ ] Rotate all secrets immediately
- [ ] Review Firestore audit logs
- [ ] Check for unauthorized `users/{uid}` docs

## Vulnerability Reporting

Report security issues to: security@sierra-estates.net
