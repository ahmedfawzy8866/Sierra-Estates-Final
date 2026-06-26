# Sierra Estates — Two-App Architecture

## System Overview

```
                        INTERNET / CLIENTS
                               │
                ┌──────────────┴──────────────┐
                │                             │
          WhatsApp / Telegram              Browser
          Webhooks / Bots               (Public + Dashboard)
                │                             │
                ▼                             ▼
    ┌────────────────────────┐    ┌───────────────────────────┐
    │   FIREBASE ADMIN APP   │    │      VERCEL APP            │
    │   (admin-api.*.net)    │    │   (sierra-estates.net)     │
    │                        │    │                            │
    │  Webhooks inbound      │    │  Public site (listings)    │
    │  Bot orchestration     │    │  CRM/Agent dashboard       │
    │  Cron / scheduled jobs │    │  Lead capture forms        │
    │  Admin panel APIs      │    │  Concierge service         │
    │  Property Finder sync  │    │  Wealth/ROI dashboard      │
    │  AI Agent pipeline     │    │                            │
    │                        │    │  READ-ONLY against Firestore│
    │  WRITES to Firestore   │    │  Rewrites heavy → Firebase │
    └──────────┬─────────────┘    └──────────┬────────────────┘
               │                             │
               ▼                             ▼
    ┌──────────────────────────────────────────────────────────┐
    │                   SHARED FIRESTORE                       │
    │                   (ONE DATABASE)                         │
    │                                                          │
    │  listings/  leads/  proposals/  viewings/  sales/       │
    │  projects/  developers/  users/  activities/            │
    │  bot_jobs/  exchange/  owner_negotiations/              │
    └──────────────────────────────────────────────────────────┘
               ▲                             ▲
               │                             │
    ┌──────────┴─────────────────────────────┴────────────────┐
    │                   SHARED FIREBASE AUTH                   │
    │                   (ONE AUTH SYSTEM)                      │
    │                                                          │
    │  Custom Claims: admin | agent | employee                 │
    └──────────────────────────────────────────────────────────┘
```

## Why Two Apps?

| Concern | Vercel App | Firebase Admin App |
|---------|-----------|-------------------|
| **Speed** | Needs to be fast (public-facing) | Can be slower (admin/bots) |
| **Security surface** | Minimal — only reads | Full write access to DB |
| **Deploy cycle** | Frequent UI changes | Stable backend |
| **Scaling** | CDN-cached reads | Heavy compute (AI, scrapers) |
| **Cost** | Vercel free tier possible | Firebase pay-as-you-go |
| **Failure blast radius** | Public site down | Admin tools down (public OK) |

## Data Flow

### Write Path (Firebase Admin App)
```
WhatsApp Group Message
    └─→ /api/webhooks/whatsapp (Scribe agent — S1/S2)
            └─→ Firestore rawScrapeData
                    └─→ processDataForApp (Cloud Function)
                            └─→ Matching Engine (S6/S7/S8)
                                    └─→ Closer Agent (S9/S10)
                                            └─→ Telegram alerts + Proposals
```

### Read Path (Vercel App)
```
Browser → sierra-estates.net
    └─→ /listings → Firestore read (listings collection)
    └─→ /dashboard → Firestore read (leads, activities)
    └─→ /api/leads → Firestore write (new lead form)
    └─→ /api/wealth/* → Firestore read (portfolio data)
```

### Cross-App Communication
```
Vercel App                            Firebase Admin App
    │                                      │
    │  Next.js rewrites (/api/orchestrate) │
    ├─────────────────────────────────────►│
    │  Proxied to admin-api.*.net         │
    │                                      │
    │  Firestore onSnapshot()              │
    ├─────────────────────────────────────►│
    │  Dashboard reads bot_jobs/exchange   │
    │  for live status updates             │
    │                                      │
```

## Authentication Flow

```
1. User logs in → Firebase Auth (both apps use same project)
2. Custom claims set: { role: 'admin' | 'agent' | 'employee' }
3. Vercel middleware checks claims:
   - /dashboard/* → requires agent or admin
   - /admin/* → requires admin (rewrite to Firebase Admin)
4. Firebase Admin API checks claims:
   - verifyIdToken() → extract role → authorize action
```

## Hard Rules

1. **ONE Firestore DB.** Both apps connect to the same `sierra-estates` project.
2. **ONE Firebase Auth.** Same users, same custom claims, same login.
3. **Bots write, dashboards read.** The Vercel app never runs scraper/agent logic.
4. **Admin SDK server-side only.** Never in browser code.
5. **No secrets in git.** Vercel env vars + Firebase Secret Manager only.
6. **Data contract is sacred.** Collection names and document shapes defined in `packages/db/src/schema.ts`. Don't rename without updating BOTH apps.
