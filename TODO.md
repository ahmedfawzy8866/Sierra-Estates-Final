# TODO — Sierra Estates Feature & Fix Backlog

Aligned with STATUS.md. Sorted by deployment-readiness (pre-deploy → post-deploy).

## ✅ Sierra Estates 2026 Completed

- [x] Split-Hero with Virtual Tour
- [x] AI Smart Filter
- [x] CRM Leads API
- [x] Property Finder Sync API
- [x] Careers Page (Framer Motion)
- [x] Design System (`design.css`)
- [x] PropertyFinder Atlas sync engine (paginated, dedup, override protection)
- [x] Twilio WhatsApp integration (4-number load balancing, rate limits, queue)
- [x] CORS middleware for all API routes
- [x] Rate limiting middleware for all API routes (public/admin/sync/webhook tiers)
- [x] Environment config validation (Zod schemas, feature gates)
- [x] Admin DataSyncHubPage upgraded with real API endpoints
- [x] Owner Negotiations admin page (chat threads, initiate, search)
- [x] AI service factory (auto-selects Gemini or Mock based on env)
- [x] Smart Filter API (AI-powered NL → Firestore query)
- [x] Unit tests for CRM leads API (14 tests) + PF sync engine (30+ tests)
- [x] LeadScoreBadge + StatsCard components for admin
- [x] Mobile responsive fixes for PremiumHero
- [x] Sidebar updated with Negotiations nav item

## 🆕 Next Logical Steps

- [x] Connect AI Smart Filter to frontend UI component
- [ ] Integrate real Virtual Tour SDK
- [ ] Add more unit tests for PF sync engine edge cases
- [ ] Wire LeadScoreBadge into LeadsPage lead cards

## 🚨 Pre-Deployment (blocking)

- [ ] **Deploy Firestore rules** to production: `firebase deploy --only firestore:rules,storage` (requires local Firebase credentials; user action)
- [ ] **Set environment secrets** in Vercel + Google Secret Manager (never in chat/git)
  - [ ] NEXT_PUBLIC_FIREBASE_* (public; safe to commit)
  - [ ] SBR_SECRET_KEY (rotate from current value)
  - [ ] JWT_SECRET, ENCRYPTION_KEY (rotate if ever shared)
  - [ ] Firebase admin JSON key (keep in Secret Manager, never in code)
  - [ ] Third-party API keys: Google Sheets, Airtable, Telegram, WhatsApp, etc.
- [ ] **Verify staff users exist** in Firestore: every staff member needs `users/{uid}` doc with role ∈ {admin, manager, agent}
- [ ] **Smoke-test on staging** (or skip if confidence is high)
- [ ] **CI green**: type-check, lint (including config validation), tests all pass

## 📦 Post-Deployment (operational)

- [ ] **Monitor**: Set up alerts in OpenTelemetry/Arize for error rates, latency, custom metrics
- [ ] **Rate-limit tuning**: Monitor public endpoints for false-positives; adjust windowMs/maxRequests if needed
- [ ] **Log retention**: Set Firestore/Storage backup cadence; archive old logs
- [ ] **Rotate credentials**: Quarterly rotation of SBR_SECRET_KEY, JWT_SECRET, Firebase admin key

## 💡 Enhancement Candidates (safe, high-value, not blocking)

- [x] **Edge rate-limiting**: Upstash Redis support built into rate-limit.ts (auto-detects env vars)
- [x] **Request/response validation**: Zod env config validation in lib/server/env-config.ts
- [ ] **Refresh stale docs**: Audit issue/PR descriptions for outdated TODO/STATUS refs
- [x] **Real AI service**: AI service factory auto-selects Gemini or Mock based on GOOGLE_AI_API_KEY
- [ ] **Consolidate secrets**: Move web app from Vercel to Firebase Hosting + Functions for unified secrets/deployment (lower priority)

## 🐛 Known Issues (low-priority)

- i18n: next-intl wired but underutilized in some flows
- Test coverage: 47+ tests passing; expand for critical paths

## 📚 Documentation

- [ ] Update CLAUDE.md if stack/conventions change
- [ ] Keep STATUS.md + TODO.md in sync with actual state
- [ ] Archive closed issues/PRs if their TODO/STATUS refs become confusing

## 📱 WhatsApp Outreach — 4 real Twilio numbers provisioned (Egypt)

- [x] Service layer wired: `lib/server/whatsapp-queue.ts` (load-balanced
      per-number claim, 30/2hr window + 120/day/number + 480/day total,
      12pm-8pm Africa/Cairo gate), `lib/server/twilio-client.ts` (REST send +
      official `validateRequest` signature check), `app/api/cron/whatsapp-dispatch`
      (drain worker), `app/api/webhooks/twilio-status` (delivery/read receipts).
- [x] Owner negotiations wired end-to-end: `startOrContinueOwnerNegotiation` /
      `findActiveOwnerNegotiationByPhone` / `appendOwnerNegotiationMessage` in
      whatsapp-queue.ts; `OmnichannelChatService.handleIncomingMessage` routes
      an inbound reply to the negotiation thread BEFORE generic lead handling;
      minimal entry point at `app/api/admin/owner-negotiations` (GET list /
      POST initiate).
- [x] New `app/api/webhooks/twilio-inbound` route: the *only* inbound route
      that correctly parses Twilio's `application/x-www-form-urlencoded`
      payload (the older `webhooks/whatsapp` and `ingest/whatsapp` routes call
      `req.json()` unconditionally and would 500 on real Twilio traffic — left
      those alone since they're the scraper bot's/other gateways' targets, not
      Twilio's).
- [x] Tests: `__tests__/whatsapp-queue.test.ts` (load-balancing across the 4
      senders, daily-cap-skip, stale-window-reset, all 4 operating-hour
      boundaries), `__tests__/omnichannel-routing.test.ts` (negotiation-first
      routing priority).
- [ ] **Ops — set in Vercel** (the 4 real numbers + Twilio creds are in a
      local-only `.env.local`, never committed): `WABA_NUMBER_1..4`,
      `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, optionally
      `TWILIO_MESSAGING_SERVICE_SID` (only set this if NOT registering the 4
      numbers as individual senders — using a Messaging Service makes Twilio
      pick the sender, which breaks the per-number 30/2hr accounting above).
- [ ] **Ops — Twilio Console**: complete WhatsApp Business sender
      registration for the 4 numbers; set each sender's (or the Messaging
      Service's) inbound webhook to `${NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio-inbound`
      and the status callback is set automatically per-send (no console config
      needed for that one).
- [ ] **Ops — cron tier**: `*/10` dispatch schedule in `vercel.json` needs
      Vercel Pro (Hobby = daily-only cron); alternative is calling
      `/api/cron/whatsapp-dispatch` from an external scheduler with
      `Authorization: Bearer $CRON_SECRET`.
- [ ] Deploy `firestore.indexes.json` (now includes 2 new `owner_negotiations`
      composite indexes) — `firebase deploy --only firestore:indexes`.
- [x] Build an admin UI page for owner negotiations (OwnerNegotiationsPage.tsx with chat threads)

## 🧹 Repo Cleanup

- [x] Divergent `firestore.rules` resolved: `firebase.json` now deploys the
      staff-gated `apps/sierra-estates-realty/firestore.rules`
      (`users/{uid}.role`); the legacy root `admins/{uid}` rules file is deleted.
- [x] `apps/{admin-dashboard,sierra-blu-admin-portal,sierra-blu-realty}` excluded
      from `pnpm-workspace.yaml` (stopped participating in CI; kept on disk).
- [x] `apps/frontend` does not exist — was already cleaned up.

## 🐍 Python

- [ ] Schedule analytics-report.py via GitHub Actions cron
- [ ] Add unit tests for LeadScorer class
- [ ] Connect lead-scorer.py to live Firestore in production
- [ ] WhatsApp template message approval workflow

## 🎨 Frontend

- [ ] Wire LeadScoreBadge into CRM dashboard
- [ ] Add StatsCard to admin analytics page
- [ ] Mobile responsive pass for PremiumHero

## 🤖 WhatsApp Bot

- [x] **Client Whitelist Filter**: Implemented whitelist checking (`whitelist.json`) in `apps/agents/whatsapp-bot/index.ts` to prevent responding to personal contacts.
- [x] **Admin Commands**: Added `!whitelist <on|off|add|remove|list|status>` commands for real-time whitelist management.
- [x] **Excel/CSV Import Utility**: Created `import-whitelist.ts` script to batch-import client numbers from `clients.csv`.
