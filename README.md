# Sierra Estates — Backend Monorepo

> 🏠 **Sierra Estates** — Luxury PropTech Platform for New Cairo  
> Full-stack AI-powered real estate backend: agents, workflows, CRM, and admin hub.

---

## Repositories

| Repo | Purpose | URL |
|------|---------|-----|
| **Sierra-Estates-Final** (this) | Backend — API, Agents, Workflows, Firebase | https://github.com/ahmedfawzy8866/Sierra-Estates-Final |
| **sf1** | Frontend — 13 UI design branches | https://github.com/ahmedfawzy8866/sf1 |

---

## Architecture

```
Sierra-Estates-Final/
├── apps/
│   ├── api/              ← Python FastAPI + TS API server
│   ├── agents/           ← Agent runner service
│   └── agents-dashboard/ ← Admin Exchange Hub (Next.js)
│
├── packages/
│   ├── agents/           ← Scribe · Curator · Matchmaker · Closer
│   ├── agents-core/      ← Orchestrator · Registry · Workflows engine
│   ├── exchange/         ← Firestore Exchange Sheet client
│   ├── memory-engine/    ← Agent memory store (vector + KV)
│   ├── db/               ← Firestore + Firebase Admin
│   ├── auth/             ← Firebase Auth + JWT
│   ├── config/           ← Environment config
│   ├── property-finder-api/ ← Property Finder integration
│   ├── api/              ← Shared HTTP utilities
│   └── batch/            ← Cron + batch jobs
│
├── workflows/            ← n8n automation workflows
│   ├── 01-whatsapp-scraper/
│   ├── 02-owner-search/
│   ├── 03-owner-contact/
│   ├── 04-email-sender/
│   └── 05-unit-adder/
│
├── functions/            ← Firebase Cloud Functions
└── .github/              ← CI/CD pipelines
```

---

## The 4 Agents

| Agent | Role |
|-------|------|
| **Scribe** | Ingests raw WhatsApp/Telegram leads, NLU parsing, SBR code generation |
| **Curator** | Listing enrichment, luxury copywriting (EN+AR), Property Finder syndication |
| **Matchmaker** | AI lead profiling, neural property-to-lead matching, concierge proposals |
| **Closer** | Digital contract (DocuSign), Stripe payment, commission tracking |

---

## The Exchange Sheet

All agents, workflows, and the Admin Hub communicate through one shared channel:

- **Firestore collection:** `/exchange`  
- Agents **write** task status and results  
- Workflows **write** run progress and completion  
- Admin Hub **reads live** via `onSnapshot()`  
- Admin can **write signals** to trigger agents or workflows

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in: Firebase, Gemini, WhatsApp, Telegram, Property Finder, Stripe keys

# Run all services in dev mode
pnpm dev

# Run only the API
pnpm --filter api dev

# Run agents dashboard
pnpm --filter agents-dashboard dev

# Run n8n workflows (Docker)
docker-compose -f workflows/docker-compose.n8n.yml up -d
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_*` — Firebase Admin SDK  
- `GEMINI_API_KEY` — Google Gemini AI  
- `WHATSAPP_TOKEN` — Meta WhatsApp API  
- `TELEGRAM_BOT_TOKEN` — Telegram Bot  
- `PROPERTY_FINDER_API_KEY` — Property Finder Egypt  
- `STRIPE_SECRET_KEY` — Stripe payments  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + Python 3.11 |
| Package manager | pnpm 9 (workspaces) |
| Build system | Turborepo |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Google Gemini 1.5 |
| Workflows | n8n (self-hosted Docker) |
| Payments | Stripe |
| Messaging | WhatsApp Cloud API + Telegram Bot API |
| Contracts | DocuSign |
| Hosting | Vercel (admin) + Firebase (functions) |

---

## Frontend

Frontend designs live in the **sf1** repo with 13 separate branches:  
→ `https://github.com/ahmedfawzy8866/sf1`

To use a design, check out its branch and deploy to Vercel.
