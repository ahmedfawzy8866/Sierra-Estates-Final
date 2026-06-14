# Sierra Estates — Final Platform

> Luxury PropTech for New Cairo. The consolidated, production-ready monorepo.

## Quick Start

```bash
pnpm install
cp .env.example .env.local  # fill in values
docker-compose -f docker-compose.n8n.yml up -d
pnpm dev
```

| App | URL |
|-----|-----|
| Web (customer hub) | http://localhost:3000 |
| Admin portal | http://localhost:3001 |
| Python API | http://localhost:8000 |
| n8n workflows | http://localhost:5678 |

## Architecture

```
WhatsApp Scraper
    ↓
collectData (Firebase Function) → rawScrapeData
    ↓
processDataForApp → processedData
    ↓
Matching Engine → Investment Stakeholders
    ↓
Stage-9 Closer Agent → Deals → Proposals → E-Sign
```

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind 4, next-intl |
| Backend | Firebase Admin SDK, Python FastAPI |
| Database | Firestore |
| Auth | Firebase Auth |
| Automation | n8n (Docker), Cloud Functions |
| AI | Google Gemini |
| Agents | Custom framework (packages/agents-core) |

© 2026 Sierra Estates
