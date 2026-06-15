# Sierra Estates Final — Backend Monorepo

Clean backend-only monorepo for the Sierra Estates luxury PropTech platform (New Cairo market). No frontend code; this repo contains only API routes, services, agents, Firebase functions, and automation workflows.

## Stack

| Layer | Technology |
|-------|------------|
| API | Next.js 15 (API routes only) |
| Language | TypeScript 5 (strict) |
| Database | Firestore (Firebase) |
| Auth | Firebase Auth + Admin SDK |
| Storage | Firebase Storage |
| AI | Google Gemini (via `@google/generative-ai`) |
| Automation | n8n (Docker, port 5678) |
| Python API | FastAPI (Property Finder sync) |
| Package Manager | pnpm 9 + Turborepo |

## Quick Start

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

| Agent | Stages | Role |
|-------|--------|------|
| Scribe | S1–S2 | Intake & normalization |
| Curator | S3–S5 | Branding, distribution, portal sync |
| Matchmaker | S6–S8 | Lead profiling, neural matching, proposal gen |
| Closer | S9–S10 | Deal finalization, signing, feedback |

## Deployment

- **Firebase Functions:** `firebase deploy --only functions`
- **Firestore Rules:** `firebase deploy --only firestore:rules`
- **Storage Rules:** `firebase deploy --only storage`
- **Backend API:** Deploy `backend/` as a Next.js app to Vercel or Cloud Run

## Security

- All privileged routes require Firebase Bearer token OR `X-SE-SECRET-KEY` header
- Firestore rules gate client access to `users/{uid}.role ∈ {admin, manager, agent}`
- Firebase Admin SDK bypasses rules (server-only)
- Never commit credentials — use `.env` (see `.env.example`)
