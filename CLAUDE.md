# CLAUDE.md — Sierra Estates (Final)

Context for Claude Code / AI sessions. Keep this updated as the project evolves.

## What this is
**Sierra Estates** — a luxury PropTech platform for the New Cairo market. Consolidated final monorepo combining all previous repositories (`i-sierra-2027`, `sierra-2026`, `68e...`, `sierra-blu-realty`, `28-5-Si`) into one clean, production-ready codebase.

## Brand Identity
- **Name:** Sierra Estates (not Sierra Blu, not Sierra Blue)
- **Design Language:** "Quiet Luxury" — Navy (#1B2B4B) + Gold (#C5A55A)
- **Terminology:** "Investment Stakeholders" (not leads), "Strategic Pipeline" (not CRM), "Portfolio Assets" (not listings)
- **Languages:** English + Arabic (RTL support via next-intl)

## Stack
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript 5 (strict) · Tailwind 4 · Firebase (client SDK 11 + Admin SDK 13) · next-intl (en/ar) · **Docker n8n** (`localhost:5678`) · Python FastAPI.

## Layout
```
sierra-estates-final/
├── apps/
│   ├── web/                  ← Public hub (Next.js 15, Tailwind 4, bilingual)
│   ├── admin/                ← Admin portal (Vite + React)
│   ├── api/                  ← Python FastAPI (Property Finder sync, AI)
│   └── agents/
│       ├── stage-9-closer/   ← THE CLOSER: deal orchestration (Stage 9+10)
│       └── whatsapp-scraper/ ← WhatsApp group scraper bot
├── functions/                ← Firebase Cloud Functions (collectData, processDataForApp)
├── packages/
│   ├── db/                   ← Shared Firestore data layer
│   └── agents-core/          ← Agent orchestration framework (15+ personas)
├── workflows/                ← n8n automation (5 workflows + 4 templates)
└── docs/obsidian-vault/
```

## Commands
- `pnpm install`
- `pnpm dev` — starts all apps (web :3000, admin :3001, API :8000)
- `pnpm build` / `pnpm lint` / `pnpm type-check`
- `docker-compose -f docker-compose.n8n.yml up -d` — n8n on :5678

## Auth Model
- Client role: Firestore `users/{uid}.role` in {admin, manager, agent}
- Server: `verifyRequest()` — Firebase Bearer token OR `X-SE-SECRET-KEY` header
- Firestore rules: public catalog readable; staff-gated for leads/deals/PII

## Intelligence Pipeline
1. WhatsApp Scraper → `/api/webhooks/whatsapp`
2. `collectData` Cloud Function → `rawScrapeData`
3. `processDataForApp` → `processedData`
4. Matching Engine → stakeholders
5. Stage-9 Closer Agent → deals → proposals → e-sign
