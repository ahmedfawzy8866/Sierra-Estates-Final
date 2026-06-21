# TODO — Sierra Estates Feature & Fix Backlog

Aligned with STATUS.md. Sorted by deployment-readiness (pre-deploy → post-deploy).

## ✅ Sierra Estates 2026 Completed
- [x] Split-Hero with Virtual Tour
- [x] AI Smart Filter
- [x] CRM Leads API
- [x] Property Finder Sync API
- [x] Careers Page (Framer Motion)
- [x] Design System (`design.css`)

## 🆕 Next Logical Steps
- [ ] Connect AI Smart Filter to real Firestore query
- [ ] Integrate real Virtual Tour SDK
- [ ] Add unit tests for CRM leads API
- [ ] Mobile responsive fixes for PremiumHero

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
- [ ] **Edge rate-limiting**: Move from in-memory to Upstash Redis for multi-instance consistency
- [ ] **Request/response validation**: Add zod schemas to public endpoints (leads, listings, concierge) to prevent API contract drift
- [ ] **Refresh stale docs**: Audit issue/PR descriptions for outdated TODO/STATUS refs
- [ ] **Real AI service**: Replace MockAIService with actual implementation (or switch to LLM vendor)
- [ ] **Consolidate secrets**: Move web app from Vercel to Firebase Hosting + Functions for unified secrets/deployment (lower priority)

## 🐛 Known Issues (low-priority)
- i18n: next-intl wired but underutilized in some flows
- Test coverage: 47 tests passing, but overall coverage ~45%; expand for critical paths

## 📚 Documentation
- [ ] Update CLAUDE.md if stack/conventions change
- [ ] Keep STATUS.md + TODO.md in sync with actual state
- [ ] Archive closed issues/PRs if their TODO/STATUS refs become confusing

## 📱 WhatsApp Outreach (Twilio) — schema landed, sending still stubbed
- [x] Firestore schema for quota-tracked outreach added: `WhatsAppNumber`, `WhatsAppMessageJob`,
      `OwnerNegotiation`, `WhatsAppOutreachConfig` in `lib/models/schema.ts` (collections:
      `whatsapp_numbers`, `whatsapp_message_queue`, `owner_negotiations`, `system_config`)
- [ ] Replace `WhatsAppParserService.dispatchBulkOwnerOutreach`'s fire-and-forget
      `triggerN8nWebhook('bulk-owner-outreach', ...)` call (no matching n8n template exists)
      with: write `WhatsAppMessageJob` docs → a queue worker that claims an eligible
      `whatsapp_numbers` doc (window/daily quota not exhausted, within 12pm-8pm
      `Africa/Cairo`) → sends via Twilio WhatsApp API → updates job + number counters
- [ ] Wire Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, 4 WhatsApp-enabled sender
      numbers (or one Messaging Service with 4 senders); register `/api/webhooks/twilio-status`
      for delivery/read callbacks → updates `WhatsAppMessageJob.twilioStatus`
- [ ] Replace the WhatsApp Sender admin page's fake quota math
      (`contactedTodayCount * 12` in `app/admin/whatsapp-sender/page.tsx`) with a live
      read of the 4 `whatsapp_numbers` docs
- [ ] Decide fate of the inbound generic-gateway webhook (`app/api/whatsapp/webhook`,
      Ultramsg/Wati-shaped) now that sending is Twilio — keep for inbound parsing only,
      or also move inbound to Twilio's webhook format
- [ ] `sendPortfolioViaWhatsApp` (client buy/rent recommendations, single-send) should also
      route through the new `whatsapp_message_queue` so it's subject to the same
      number/quota accounting as bulk owner outreach, not a separate untracked path

## 🧹 Repo Cleanup (found during WhatsApp/Firebase analysis)
- [ ] Two divergent `firestore.rules`: deployed root one models staff via a legacy
      `admins/{uid}` collection; the newer `apps/sierra-estates-realty/firestore.rules`
      (staff via `users/{uid}.role`, matches `CLAUDE.md`'s documented auth model) is not
      referenced by any `firebase.json` and has never been deployed. Pick one model and
      deploy it — see `NEXT_STEPS.md` "URGENT — deploy security rules".
- [ ] `apps/{admin-dashboard,sierra-blu-admin-portal,sierra-blu-realty,frontend}` are
      undeployed duplicates of `apps/sierra-estates-realty` — same dead-weight call as
      `RECOMMENDATIONS.md` item 7, now confirmed during this pass.

## 🐍 Python
- [ ] Schedule analytics-report.py via GitHub Actions cron
- [ ] Add unit tests for LeadScorer class
- [ ] Connect lead-scorer.py to live Firestore in production
- [ ] WhatsApp template message approval workflow

## 🎨 Frontend
- [ ] Wire LeadScoreBadge into CRM dashboard
- [ ] Add StatsCard to admin analytics page
- [ ] Mobile responsive pass for PremiumHero
