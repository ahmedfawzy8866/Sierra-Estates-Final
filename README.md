# Sierra Estates Platform - Unified Monorepo

Clean backend-only monorepo for the Sierra Estates luxury PropTech platform (New Cairo market). No frontend code; this repo contains only API routes, services, agents, Firebase functions, and automation workflows.

## Stack

> **Migration complete**: Code and history from several legacy repositories have been consolidated here under the Sierra Estates brand. See [MIGRATION.md](./MIGRATION.md) for details.

## 📦 Repository Structure

```
Sierra-Estates-Final/
├── apps/
│   ├── sierra-estates-realty/  # Main backend/API + admin dashboard (Next.js 16 + Turbopack)
│   │   ├── app/               # App Router pages & API routes (/api/*)
│   │   │   ├── admin/         # Admin dashboard (staff-gated)
│   │   │   ├── api/           # REST API endpoints
│   │   │   └── (marketing)/   # Public site (listings, about, contact)
│   │   ├── components/        # React components (admin UI, shared)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities, services, models, agents
│   │   └── public/            # Static assets
│   ├── api/                   # Python service (Docker/Cloud Run) — PropertyFinder sync + bot integration
│   │   ├── main.py            # FastAPI entry point
│   │   ├── requirements.txt   # Python dependencies
│   │   └── Dockerfile         # Container definition
├── packages/
│   ├── agents-core/           # Multi-agent framework & AI services
│   ├── db/                    # Firestore models & schema
│   ├── config/                # Shared configuration
│   └── obedian/               # Obsidian vault integration
├── functions/                 # Firebase Cloud Functions (Node.js 20)
│   └── src/
│       └── index.ts           # collectData, processDataForApp
├── workflows/                 # Node scripts for external data sync (triggered by GitHub Actions)
├── scripts/
│   └── sync-obsidian.ps1      # Sync workflow documentation to Obsidian vault
├── .github/workflows/         # CI/CD pipelines (lint, type-check, test, build)
├── firestore.rules            # Production Firestore security rules
├── storage.rules              # Production Storage security rules
├── pnpm-workspace.yaml        # Monorepo workspace config
├── turbo.json                 # Turborepo build cache config
├── package.json               # Root workspace dependencies
├── firebase.json              # Firebase Functions + Firestore + Storage config
├── vercel.json                # Vercel deployment config (root dir)
├── CLAUDE.md                  # Codebase guidelines & architecture decisions
├── docs/
│   ├── API_CONTRACT.md        # API specification for separate frontend repo
│   └── obsidian-vault/        # Architecture & operational documentation
└── NEXT_STEPS.md              # Outstanding tasks & migration checklist
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **pnpm** 9+
- **Firebase CLI** (for deployment)
- **Docker** (optional, for local Firebase emulation)

### Installation

```bash
pnpm install
cp .env.example .env   # fill in your credentials
pnpm dev               # Next.js API on :3000
docker-compose -f docker-compose.n8n.yml up -d  # n8n on :5678
```

## Project Structure

```
.
├── backend/                    # Next.js 15 API-only app
│   └── src/
│       ├── app/api/            # 20 REST API routes
│       └── lib/
│           ├── agents/         # AI agent definitions
│           ├── firebase/       # Firebase client init
│           ├── models/         # Firestore schemas
│           ├── server/         # Admin SDK, auth, AI
│           ├── services/       # 15 business-logic services
│           └── types/          # Shared TypeScript types
├── apps/
│   ├── api/                    # Python FastAPI
│   └── agents/
│       ├── stage-9-closer/     # Deal orchestration (S9–S10)
│       └── whatsapp-scraper/   # WhatsApp group scraper bot
├── functions/                  # Firebase Cloud Functions
├── packages/
│   ├── db/                     # Shared Firestore DSL
│   └── agents-core/            # 15-agent orchestration framework
└── workflows/                  # n8n + external scripts
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/deploy` | POST | Admin deploy trigger |
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
| `/api/sync` | GET/POST | Sync management |
| `/api/sync/publish` | POST | Publish to Property Finder |
| `/api/telegram/setup` | GET | Telegram webhook setup |
| `/api/telegram/webhook` | POST | Telegram bot handler |
| `/api/viewing-requests` | GET/POST | Viewing requests |
| `/api/webhooks/property-finder` | POST | PF webhook (HMAC verified) |
| `/api/webhooks/whatsapp` | GET/POST | WhatsApp webhook |
| `/api/whatsapp/heartbeat` | POST | Scraper heartbeat |
| `/api/whatsapp/webhook` | POST | WhatsApp message handler |

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

## Agents

### Staging
```bash
pnpm build
firebase deploy --project sierra-estates-staging
```

## Deployment

# Deploy to production
firebase deploy --project sierra-estates-prod

## Security

### Rollback
```bash
# Instant rollback to previous version
firebase hosting:rollback

# Function-specific rollback
firebase deploy --only functions:api --region us-central1 [previous-version]
```

## 💰 Cost Analysis (Monthly)

| Service | Est. Cost | Notes |
|---------|-----------|-------|
| Firebase Hosting | $15 | CDN included, 100GB bandwidth |
| Cloud Functions | $40 | 100M invocations/mo |
| Firestore | $50 | 1B reads, 100GB storage |
| Cloud Storage | $5 | 10GB stored, 50GB outbound |
| Logging | $20 | 50GB/month, 7-day retention |
| Pub/Sub | $10 | 1B messages/mo |
| **Subtotal** | **$140** | Infrastructure only |
| **AI APIs** | $500-2K | Anthropic, Google, OpenAI (variable) |
| **Total** | **$640-2,140** | Estimated monthly |

**Cost Optimization Tips**:
- ✅ Batch Firestore writes (-30%)
- ✅ Cache API responses at CDN (-25%)
- ✅ Use regional Firestore (-20%)
- ✅ Optimize function cold-starts (-15%)

## 📋 Environment Variables

See `.env.example` for complete list. Key variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sierra-estates-prod
FIREBASE_ADMIN_SDK_KEY=...

# APIs
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...

# Observability
ARIZE_API_KEY=...
OTEL_EXPORTER_OTLP_ENDPOINT=...

# Integrations
PROPERTY_FINDER_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

## 🔐 Security

- ✅ Type-safe with TypeScript strict mode
- ✅ Authentication via Firebase Auth + JWT
- ✅ Secrets via Google Secret Manager
- ✅ CORS & CSP headers configured
- ✅ SQL injection prevention (Zod validation)
- ✅ XSS protection (React automatic escaping)
- ✅ Rate limiting on Cloud Functions
- ✅ Firestore Security Rules enforced
- ✅ Cloud Storage CORS restricted

## 📚 Documentation

- `ARCHITECTURE.md` - System design & data flows
- `DEPLOYMENT_GUIDE.md` - Deployment procedures & runbooks
- `API.md` - REST API specifications
- `CONTRIBUTING.md` - Developer setup & workflow
- `RESOURCES.md` - Consolidated archive resources


## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript strict mode
3. Add tests for new functionality
4. Run linter & tests: `pnpm validate-build`
5. Submit pull request with description

## 📞 Support

- **Issues**: GitHub Issues (this repo)
- **Docs**: See `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT_GUIDE.md`
- **Team**: Slack #sierra-estates

## 📄 License

Proprietary - Sierra Estates Inc.

---

**Last Updated**: May 31, 2026  
**Build**: Turbopack + Turborepo  
**Status**: Production Ready ✅
