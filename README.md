# Sierra Estates Platform — Two-App Architecture

Luxury PropTech platform for New Cairo. AI-powered lead management, property matching, and deal orchestration.

## Architecture Overview

```
┌──────────────────────────────┐     ┌──────────────────────────────────┐
│       VERCEL APP             │     │      FIREBASE ADMIN APP          │
│  (Public + Light Dashboard)  │     │  (Admin + Bots + Workflows)      │
│                              │     │                                  │
│  sierra-estates.net          │     │  admin-api.sierra-estates.net    │
│  ├─ /          Public site   │     │  ├─ /api/webhooks/*   Bots inbound│
│  ├─ /listings   Search       │     │  ├─ /api/ingest/*     Scraper     │
│  ├─ /dashboard  CRM reads    │     │  ├─ /api/agent/*      AI agents   │
│  └─ /api/*      Light APIs   │     │  ├─ /api/cron/*       Scheduled   │
│                              │     │  ├─ /api/admin/*      Admin panel │
│  READ-ONLY against Firestore │     │  └─ /api/sync/*       PF sync     │
└──────────┬───────────────────┘     └──────────┬───────────────────────┘
           │                                    │
           │         ┌──────────────┐           │
           └────────►│  FIRESTORE   │◄──────────┘
                     │  (ONE DB)    │
                     │              │
                     │  listings/   │
                     │  leads/      │
                     │  proposals/  │
                     │  bot_jobs/   │
                     │  exchange/   │
                     │  users/      │
                     └──────────────┘
                           ▲
                           │
                  ┌────────┴────────┐
                  │  FIREBASE AUTH   │
                  │  (ONE AUTH)      │
                  │  Roles: admin    │
                  │  agent employee  │
                  └─────────────────┘
```

## Hard Rules

1. **One database.** Both apps read/write the same Firestore. Never create a second DB.
2. **One auth system.** Both apps use Firebase Auth with custom claims (admin/agent/employee). Never build a second auth.
3. **Bots/scrapers write, dashboards read.** Heavy workflow stuff lives in Firebase. Vercel dashboard only subscribes to results.
4. **Admin SDK server-side only.** Never expose Firebase Admin SDK to the browser.
5. **No secrets in git.** Ever. Use Vercel env vars + Firebase Secret Manager.

## Repository Structure

```
Sierra-Estates-Final/
├── apps/
│   ├── vercel-app/              ← 🌐 PUBLIC + LIGHT DASHBOARD
│   │   ├── app/
│   │   │   ├── (marketing)/     # Public site: listings, search, about
│   │   │   ├── dashboard/       # Agent/CRM/employee dashboard (reads)
│   │   │   └── api/             # Light APIs (listings, leads, concierge)
│   │   ├── lib/                 # Client SDK, services, UI
│   │   ├── hooks/               # React hooks
│   │   ├── middleware.ts         # Auth + routing
│   │   ├── next.config.ts       # Rewrites heavy routes → Firebase Admin
│   │   └── package.json
│   │
│   ├── firebase-admin/          ← 🔧 ADMIN + BOTS + WORKFLOWS
│   │   ├── src/
│   │   │   ├── app/api/         # Heavy APIs (webhooks, bots, cron, admin)
│   │   │   └── index.ts         # Admin SDK init
│   │   └── package.json
│   │
│   ├── api/                     ← 🐍 Python FastAPI (Cloud Run)
│   ├── agents/                  ← WhatsApp scraper + deal orchestration
│   ├── admin-dashboard/         ← Legacy Vite SPA (redirects)
│   └── mass-blast/              ← WhatsApp bulk messaging
│
├── packages/                    ← 📦 SHARED (used by BOTH apps)
│   ├── db/                      # Firestore data contract (ONE source of truth)
│   │   └── src/
│   │       ├── schema.ts        # All collection types + names
│   │       └── index.ts         # BotJob, ExchangeRecord, roles
│   ├── auth/                    # Custom claims + role guards
│   │   └── src/index.ts         # requireRole(), verifyRequestAuth()
│   ├── agents-core/             # Multi-agent orchestration framework
│   ├── agents/                  # Agent definitions (Scribe/Curator/Matchmaker/Closer)
│   ├── exchange/                # Exchange Sheet client (Firestore message bus)
│   ├── memory-engine/           # Agent memory store
│   ├── config/                  # Shared configuration
│   ├── property-finder-api/     # Property Finder integration
│   └── ...
│
├── functions/                   ← 🔥 Firebase Cloud Functions
├── workflows/                   ← n8n automation workflows
├── scripts/                     ← Utility + deployment scripts
└── docs/                        ← Documentation
```

## Data Contract

Both apps depend on these Firestore collections. **Don't rename without updating both.**

| Collection | Writer | Reader | Description |
|-----------|--------|--------|-------------|
| `listings/` | Firebase Admin | Both | Property units |
| `leads/` | Firebase Admin | Both | CRM leads |
| `projects/` | Firebase Admin | Both | Development projects |
| `developers/` | Firebase Admin | Both | Developer profiles |
| `proposals/` | Firebase Admin | Vercel | AI-generated proposals |
| `viewings/` | Firebase Admin | Vercel | Scheduled inspections |
| `sales/` | Firebase Admin | Vercel | Transactions |
| `users/` | Firebase Admin | Both | Staff profiles + roles |
| `activities/` | Firebase Admin | Both | Audit log |
| `bot_jobs/` | Firebase Admin | — | Scraper/bot task queue |
| `exchange/` | Firebase Admin | — | Agent orchestration bus |
| `owner_negotiations/` | Firebase Admin | — | WhatsApp negotiation threads |

## Quick Start

### Vercel App (Public + Dashboard)
```bash
pnpm install
cp apps/vercel-app/.env.local.example apps/vercel-app/.env.local
# Fill in Firebase client + admin credentials
pnpm --filter @sierra-estates/vercel-app dev
```

### Firebase Admin App (Admin + Bots)
```bash
firebase use sierra-estates
firebase deploy --only firestore:rules,storage
firebase deploy --only functions
```

### Both at once
```bash
pnpm dev               # Starts Vercel app on :3000
docker-compose -f docker-compose.n8n.yml up -d  # n8n on :5678
```

## API Routes by App

### Vercel App (lightweight, public-facing)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/listings` | GET | Public property search |
| `/api/leads` | POST | Create lead (public form) |
| `/api/leads/request-viewing` | POST | Request property viewing |
| `/api/viewing-requests` | GET/POST | Viewing requests |
| `/api/crm/leads` | GET | CRM leads list (dashboard) |
| `/api/crm/property-finder` | GET | PF integration status |
| `/api/concierge/*` | POST | Client concierge |
| `/api/chat` | POST | Client chat |
| `/api/wealth/*` | GET | Portfolio/ROI dashboard |

### Firebase Admin App (heavy, write-side)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhooks/whatsapp` | GET/POST | WhatsApp bot inbound |
| `/api/webhooks/property-finder` | POST | PF webhook (HMAC) |
| `/api/ingest/whatsapp` | POST | Scraper intake |
| `/api/telegram/*` | GET/POST | Telegram bot |
| `/api/whatsapp/*` | POST | WhatsApp bot |
| `/api/agent/hub` | POST | Multi-agent hub |
| `/api/orchestrate` | POST | Full S1–S10 pipeline |
| `/api/closer/initiate` | POST | Deal closing |
| `/api/matching` | POST | AI matching engine |
| `/api/cron/*` | POST | Scheduled jobs |
| `/api/admin/*` | POST | Admin operations |
| `/api/sync/*` | GET/POST | PF sync management |
| `/api/proposals` | POST | Generate proposals |
| `/api/seed/*` | POST | Database seeding |

## Deployment

### Vercel (auto-deploys on push to main)
- Root Directory: `apps/vercel-app`
- Framework: Next.js
- Env vars: See `.env.local.example`

### Firebase (manual or CI)
```bash
firebase deploy --only firestore:rules,storage   # Security rules
firebase deploy --only functions                   # Cloud Functions
```

## Security

- TypeScript strict mode with `ignoreBuildErrors: false`
- ONE Firebase Auth with custom claims (admin/agent/employee)
- Firestore rules staff-gated by `users/{uid}.role`
- HMAC webhook verification
- Rate limiting on public endpoints
- Pino logger with automatic sensitive field redaction
- CORS restricted by `ALLOWED_ORIGNS`

## License

Proprietary — Sierra Estates Inc. See [LICENSE](./LICENSE).
