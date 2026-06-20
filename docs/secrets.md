# Sierra Estates — Secrets Inventory

> **This file is intentionally gitignored.** It is a TEMPLATE for tracking
> which secrets exist, where they live, who owns them, and when they were
> last rotated. Copy this file to `docs/secrets.local.md` (gitignored by
> the `*.local.md` pattern), fill in the values you actually use, and
> share the inventory with the rest of the ops team via a secure channel
> (1Password, Bitwarden, GPG-encrypted email — NOT Slack).

## How to use this document

For each secret, fill in:
- **Name** — env var name as it appears in code
- **Location** — where the secret actually lives (Vercel, Firebase Secret Manager, Google Secret Manager, .env.local)
- **Owner** — person or team accountable for rotation
- **Last rotated** — date (YYYY-MM-DD)
- **Rotation cadence** — quarterly / annually / on-team-change / never
- **Rotation procedure** — link to runbook or short step list
- **Exposed to** — which environments/apps can read it (Vercel prod, Vercel preview, Firebase Functions, local dev, CI)

Mark any secret that has been shared in chat, screenshots, or commit history
with 🔴 and rotate immediately.

---

## Firebase — client (public, safe to expose)

| Name | Location | Owner | Last rotated | Cadence | Exposed to |
|------|----------|-------|--------------|---------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Vercel + `.env.local` | — | — | On Firebase project deletion | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Vercel + `.env.local` | — | — | n/a | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Vercel + `.env.local` | — | — | n/a | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Vercel + `.env.local` | — | — | n/a | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Vercel + `.env.local` | — | — | n/a | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Vercel + `.env.local` | — | — | n/a | Browser, server, CI |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Vercel + `.env.local` | — | — | n/a | Browser (GA4) |

## Firebase — admin (server-only, NEVER expose)

| Name | Location | Owner | Last rotated | Cadence | Rotation procedure |
|------|----------|-------|--------------|---------|---------------------|
| `FIREBASE_PROJECT_ID` | Firebase Secret Manager | — | — | n/a | — |
| `FIREBASE_CLIENT_EMAIL` | Firebase Secret Manager | — | — | On service-account rotation | Firebase Console → Settings → Service Accounts → Generate new key |
| `FIREBASE_PRIVATE_KEY` | Firebase Secret Manager | — | — | Quarterly OR on team change | 🔴 Rotate immediately if committed. Generate new admin SDK JSON, upload to Secret Manager, delete old key. |

## App secrets

| Name | Location | Owner | Last rotated | Cadence | Exposed to |
|------|----------|-------|--------------|---------|------------|
| `SBR_SECRET_KEY` (a.k.a. `SE_SECRET_KEY`) | Vercel | — | — | Quarterly | Server (used in `/api/orchestrate` proxy gate) |
| `CRON_SECRET` | Vercel | — | — | Annually | Server (used by Vercel Cron to call `/api/cron/*`) |
| `JWT_SECRET` | Vercel | — | — | Quarterly | Server |
| `ENCRYPTION_KEY` | Vercel | — | — | On compromise | Server |

## Third-party API keys

| Name | Location | Owner | Last rotated | Cadence | Notes |
|------|----------|-------|--------------|---------|-------|
| `GOOGLE_AI_API_KEY` | Vercel | — | — | Annually | Used by `lib/server/google-ai.ts` for Gemini calls |
| `PROPERTY_FINDER_API_KEY` | Vercel | — | — | On compromise | PropertyFinder.ae sync |
| `PROPERTY_FINDER_BASE_URL` | Vercel | — | — | n/a | `https://api.propertyfinder.ae/v2` |
| `TELEGRAM_BOT_TOKEN` | Vercel + Firebase Secret Manager | — | — | Annually | BotFather → /revoke → /newbot |
| `TELEGRAM_ALERT_CHAT_ID` | Vercel | — | — | On team change | Numeric chat ID for high-priority alerts |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Vercel | — | — | Annually | Meta WhatsApp Business verify token |
| `SENDGRID_API_KEY` | Vercel | — | — | Annually | SendGrid → API Keys → Revoke + Create |
| `SENDER_EMAIL` | Vercel | — | — | On domain change | `noreply@sierraestatesrealty.com` |
| `GOOGLE_SHEETS_ID` | Vercel | — | — | On sheet migration | Spreadsheet ID for ingestion |
| `N8N_API_KEY` | Vercel | — | — | Annually | n8n → API → regenerate |
| `N8N_BASE_URL` | Vercel | — | — | n/a | `http://localhost:5678` locally, internal URL in prod |

## Infrastructure

| Name | Location | Owner | Last rotated | Cadence | Notes |
|------|----------|-------|--------------|---------|-------|
| `UPSTASH_REDIS_REST_URL` | Vercel | — | — | n/a | Used by rate-limit.ts |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel + Upstash console | — | — | Annually | Upstash → REST API → Rotate |
| `VERCEL_TOKEN` | GitHub Secrets | — | — | Annually | Used by deploy-vercel workflow |
| `VERCEL_ORG_ID` | GitHub Secrets | — | — | n/a | Vercel team ID |
| `VERCEL_PROJECT_ID` | GitHub Secrets | — | — | n/a | Vercel project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | CI runner | — | — | On compromise | Service account JSON for Workload Identity |

## Recaptcha (optional)

| Name | Location | Owner | Last rotated | Cadence | Notes |
|------|----------|-------|--------------|---------|-------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Vercel + `.env.local` | — | — | Annually | Used by firebase/index.ts for App Check |

## Deployment targets

| Name | Location | Owner | Last rotated | Cadence | Notes |
|------|----------|-------|--------------|---------|-------|
| `PYTHON_API_BASE_URL` | Vercel | — | — | n/a | `http://localhost:8000` locally, Cloud Run URL in prod |
| `ADMIN_HOST` | Vercel | — | — | n/a | `admin.sierra-estates.net` when admin subdomain is set up |

---

## Quarterly rotation checklist

Run this every quarter (set a calendar reminder):

1. [ ] Rotate `SBR_SECRET_KEY`, `JWT_SECRET`, `ENCRYPTION_KEY` in Vercel
2. [ ] Rotate `CRON_SECRET` in Vercel
3. [ ] Rotate `FIREBASE_PRIVATE_KEY` (generate new service account JSON, upload to Secret Manager, delete old)
4. [ ] Rotate `GOOGLE_AI_API_KEY` (Google AI Studio → API Keys → Delete + Create)
5. [ ] Rotate `TELEGRAM_BOT_TOKEN` (BotFather → /revoke → /newbot — update webhook URL after)
6. [ ] Rotate `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (Meta Business → WhatsApp → Webhook)
7. [ ] Rotate `SENDGRID_API_KEY` (SendGrid → API Keys → Revoke + Create)
8. [ ] Rotate `N8N_API_KEY`
9. [ ] Rotate `UPSTASH_REDIS_REST_TOKEN`
10. [ ] Review access list: who has Vercel + Firebase + Google Cloud admin?
11. [ ] Review Firebase Auth users — remove departed team members
12. [ ] Update this document with new rotation dates

## On team-member departure

1. [ ] Remove from Vercel team
2. [ ] Remove from Firebase project
3. [ ] Remove from Google Cloud project
4. [ ] Remove from GitHub org
5. [ ] Rotate ALL app secrets listed above (assume their machine still has cached values)
6. [ ] Update this document

## On suspected compromise

1. [ ] Rotate EVERY secret in this document immediately, in parallel
2. [ ] Check Vercel + Firebase + Google Cloud audit logs for unusual activity
3. [ ] Rotate deploy tokens (VERCEL_TOKEN) last so deploys don't break mid-rotation
4. [ ] Notify stakeholders via Telegram alert chat
5. [ ] Post-mortem within 48h: how was the secret exposed?
