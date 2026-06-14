# CLAUDE.md — Sierra Estates Final (Backend)

Context for Claude Code / AI sessions.

## What this is
**Sierra Estates Final** — the clean backend-only monorepo for the Sierra Estates luxury PropTech platform (New Cairo market). No frontend code is included here; the frontend will be built separately using Claude Design.

## Brand Identity
- **Name:** Sierra Estates (never "Sierra Blu", "Sierra Blue", or any variant)
- **Terminology:** "Investment Stakeholders" (not leads), "Strategic Pipeline" (not CRM), "Portfolio Assets" (not listings)

## Stack
Node.js 20 · TypeScript 5 (strict) · Next.js 15 (API routes only, no pages) · Firebase Admin SDK 13 · Firebase Client SDK 11 · Python FastAPI · n8n (Docker) · Google Gemini AI · Firestore · Firebase Storage · Firebase Auth

## Layout
```
sierra-estates-final/
├── backend/                    ← Next.js API-only app (no pages, no components)
│   └── src/
│       ├── app/api/            ← 20 API route handlers
│       └── lib/
│           ├── agents/         ← Agent definitions (closer, curator, matchmaker, scribe)
│           ├── firebase/       ← Firebase client init + inventory
│           ├── models/         ← Firestore data models
│           ├── server/         ← Firebase Admin, auth-guard, Google AI, env validator
│           ├── services/       ← 15 business logic services
│           └── types/          ← TypeScript types (Stage 9, etc.)
├── apps/
│   ├── api/                    ← Python FastAPI (Property Finder sync + AI)
│   └── agents/
│       ├── stage-9-closer/     ← Deal orchestration agent (Stages 9-10)
│       └── whatsapp-scraper/   ← WhatsApp group message ingestion bot
├── functions/                  ← Firebase Cloud Functions (collectData, processDataForApp)
├── packages/
│   ├── db/                     ← Shared Firestore DSL + Property Finder integration
│   └── agents-core/            ← 15-agent orchestration framework
└── workflows/                  ← n8n automation (5 workflows + 4 templates)
```

## Commands
```bash
pnpm install
pnpm dev            # backend API on :3000
pnpm type-check
pnpm lint
pnpm test:ci
docker-compose -f docker-compose.n8n.yml up -d  # n8n on :5678
```

## Auth Model
- Server: `verifyRequest()` accepts Firebase Bearer token OR `X-SE-SECRET-KEY` header (cron/webhooks)
- Admin check: `verifyAdminRequest()` — `admin===true || role==='admin'` custom claim
- Firebase Admin SDK (`lib/server/firebase-admin`) BYPASSES Firestore rules — server only
- Firestore rules: staff-gated via `users/{uid}.role` ∈ {admin, manager, agent}

## Intelligence Pipeline
1. **WhatsApp Scraper** → forwards group messages to `/api/webhooks/whatsapp`
2. **collectData** Cloud Function → stores raw data in `rawScrapeData` collection
3. **processDataForApp** → cleans, deduplicates, writes to `processedData`
4. **Matching Engine** (`backend/src/lib/services/matching-engine.ts`)
5. **Stage 9 Closer Agent** (`apps/agents/stage-9-closer/`) → deal orchestration

## Security
- Never commit API keys or credentials
- Never force-push or delete main
- PR required for all changes to main
