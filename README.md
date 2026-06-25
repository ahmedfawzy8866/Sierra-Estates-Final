# Sierra Estates Platform — Unified Monorepo

Luxury PropTech platform for the New Cairo real estate market. AI-powered lead management, property matching, and deal orchestration.

## Stack

- **Frontend + API**: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 (strict) · Tailwind 4
- **Database**: Firebase Firestore + Storage + Auth (Client SDK 12 + Admin SDK 13)
- **AI Agents**: 4-agent pipeline (Scribe → Curator → Matchmaker → Closer)
- **Automation**: n8n (Docker) + GitHub Actions + Python FastAPI (Cloud Run)
- **Observability**: OpenTelemetry + Arize
- **Build**: pnpm 9 + Turborepo
- **i18n**: English / Arabic

## Repository Structure

```
Sierra-Estates-Final/
├── apps/
│   ├── sierra-estates-realty/    ← Main Next.js app (public site + admin + ALL API routes)
│   │   ├── app/
│   │   │   ├── admin/            # Staff admin dashboard (Firebase Auth gated)
│   │   │   ├── api/              # 20+ REST API routes
│   │   │   └── (marketing)/      # Public site (listings, about, contact)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Core: agents, firebase, services, AI, auth
│   │   │   ├── agents/           # Scribe, Curator, Matchmaker, Closer
│   │   │   ├── firebase/         # Client SDK + Firestore helpers
│   │   │   ├── server/           # Admin SDK, auth-guard, rate-limit, logger
│   │   │   └── ...               # AI, config, validation, integrations
│   │   ├── middleware.ts          # Auth + admin host-split middleware
│   │   └── public/               # Static assets
│   ├── api/                      # Python FastAPI (PropertyFinder sync + bot)
│   ├── admin-dashboard/          # Vite SPA (redirects to Vercel /admin)
│   ├── agents/                   # WhatsApp scraper + deal orchestration
│   └── mass-blast/               # WhatsApp bulk messaging tool
├── packages/
│   ├── agents-core/              # Multi-agent orchestration framework
│   ├── agents/                   # Agent definitions (Scribe/Curator/Matchmaker/Closer)
│   ├── db/                       # Firestore models & schema
│   ├── auth/                     # Authentication utilities
│   ├── config/                   # Shared configuration
│   ├── exchange/                 # Exchange Sheet client (Firestore message bus)
│   ├── memory-engine/            # Agent memory store (vector + KV)
│   ├── property-finder-api/      # Property Finder integration
│   ├── batch/                    # Batch processing & cron jobs
│   ├── api/                      # Shared API utilities
│   ├── ui/                       # Shared UI components
│   └── obedian/                  # Obsidian vault integration
├── functions/                    # Firebase Cloud Functions (Node.js 20)
├── workflows/                    # n8n automation workflows
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
├── artifacts/                    # Deployment artifacts
└── admin-panel/                  # Admin panel dist (legacy)
```

## Quick Start

### Prerequisites
- **Node.js** 20+
- **pnpm** 9+
- **Firebase CLI** (for deployment)
- **Docker** (optional, for n8n)

### Installation

```bash
pnpm install
cp apps/sierra-estates-realty/.env.local.example apps/sierra-estates-realty/.env.local
# Fill in your Firebase credentials in .env.local
pnpm dev               # Next.js API on :3000
docker-compose -f docker-compose.n8n.yml up -d  # n8n on :5678
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/agent/hub` | POST | Multi-agent hub (Scribe/Curator/Matchmaker/Closer) |
| `/api/closer/initiate` | POST | Stage 9 closer agent |
| `/api/ingest/whatsapp` | POST | WhatsApp message ingestion |
| `/api/leads` | POST | Create investment stakeholder |
| `/api/leads/request-viewing` | POST | Request property viewing |
| `/api/listings` | GET | Fetch portfolio assets |
| `/api/matching` | POST | Run AI matching engine |
| `/api/orchestrate` | POST | Full S1–S10 pipeline |
| `/api/properties/sync` | POST | Property Finder sync |
| `/api/property-finder` | GET/POST/PUT/DELETE | PF gateway |
| `/api/proposals` | POST | Generate proposal |
| `/api/telegram/webhook` | POST | Telegram bot handler |
| `/api/viewing-requests` | GET/POST | Viewing requests |
| `/api/webhooks/property-finder` | POST | PF webhook (HMAC verified) |
| `/api/webhooks/whatsapp` | GET/POST | WhatsApp webhook |

## Intelligence Pipeline

```
WhatsApp Groups
    └─→ /api/webhooks/whatsapp (Scribe agent — S1/S2)
            └─→ Firestore rawScrapeData
                    └─→ processDataForApp (Cloud Function)
                            └─→ Matching Engine (S6/S7/S8)
                                    └─→ Stage 9 Closer Agent
                                            └─→ Telegram alerts + Proposals
```

## Deployment

### Vercel (Web App + API)
- Root Directory: `apps/sierra-estates-realty`
- Framework: Next.js (auto-detected)
- Env vars: See `.env.local.example`

### Firebase (Infrastructure)
```bash
firebase deploy --only firestore:rules,storage    # Deploy security rules
firebase deploy --only functions                   # Deploy Cloud Functions
```

## Environment Variables

See `apps/sierra-estates-realty/.env.local.example` for the complete list.

**Critical secrets to set before going live:**
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_PRIVATE_KEY` — Admin SDK (server-only)
- `SBR_SECRET_KEY` — Webhook/service auth (`openssl rand -hex 32`)
- `GOOGLE_AI_API_KEY` — AI provider
- `TELEGRAM_BOT_TOKEN` — Alert notifications

## Security

- TypeScript strict mode with `ignoreBuildErrors: false`
- Firebase Auth + custom role model (admin/manager/agent)
- Firestore security rules (staff-gated)
- HMAC webhook verification
- Rate limiting on public endpoints
- CORS & CSP headers
- Secrets via Google Secret Manager + Vercel env vars
- Pino logger with automatic sensitive field redaction

## Documentation

- `ARCHITECTURE.md` — System design & data flows
- `API.md` — REST API specifications
- `DEPLOYMENT.md` — Deployment procedures & runbooks
- `CLAUDE.md` — AI coding session context
- `CONTRIBUTING.md` — Developer setup & workflow
- `STATUS.md` — Current project status
- `RECOMMENDATIONS.md` — Prioritized improvement list

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript strict mode
3. Add tests for new functionality
4. Run linter & tests: `pnpm lint && pnpm type-check`
5. Submit pull request with description

## License

Proprietary — Sierra Estates Inc. See [LICENSE](./LICENSE).
