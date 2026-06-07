# CLAUDE.md — Sierra Blu (i-sierra-2027)

Context for Claude Code / AI sessions. Keep this updated as the project evolves.

## What this is
Sierra Blu / Sierra Estates — a luxury real-estate (PropTech) platform for the New Cairo market. pnpm + Turborepo monorepo.

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 (strict) · Tailwind 4 · Firebase (client SDK 12 + Admin SDK 13: Firestore, Storage, Auth) · Leaflet maps · next-intl (en/ar). Observability: OpenTelemetry + Arize.

## Deployment Architecture (authoritative)

```
ONE Vercel deployment → apps/web (Next.js)
  /                  Public site: listings, search, leads, about, contact
  /listings          Property marketplace
  /concierge/[id]    Client portfolio views
  /admin/*           Staff admin panel (Firebase Auth gated via layout.tsx)
    /admin/login       → Login
    /admin/dashboard   → KPIs & activity
    /admin/units       → Inventory management
    /admin/deals       → Deal pipeline
    /admin/leads/[id]  → Lead CRM
    /admin/team        → Team management
    /admin/media       → Media hub
    /admin/reports     → Analytics
    /admin/sync        → Data sync center
    /admin/settings    → System settings
  /api/*             All backend APIs (auth-guarded per route)

Firebase — infrastructure ONLY (no hosting)
  Firestore          Database (staff-gated rules in firestore.rules)
  Storage            Media (rules in storage.rules)
  Auth               Authentication
  Functions          Background jobs (functions/)
```

**`apps/admin`** (Vite SPA) — DEPRECATED. All mock data, never connected to Firestore.
Do not deploy it. See `apps/admin/DEPRECATED.md`. Real admin = `apps/web/app/admin/`.

## Config files
- `vercel.json` (root) — Vercel config when root dir = repo root (buildCommand points to apps/web)
- `apps/web/vercel.json` — Vercel config when root dir = `apps/web` in Vercel dashboard
- `firebase.json` — Functions + Firestore rules + Storage rules + emulators (no hosting)
- `.firebaserc` — Firebase project: `sierra-blu-prod`

## Layout
- `apps/web` — main Next.js app and the real codebase (~26 pages, 38 API routes, ~78 components, ~39 services).
- `apps/admin` — DEPRECATED Vite SPA (prototype, all mock data). See DEPRECATED.md inside.
- `functions` — Firebase Cloud Functions (ingestion pipeline: collectData, processDataForApp, + pure transform module).
- `packages/db` — shared Firestore data layer (substantial). `packages/agents` is small. `packages/{api,auth,batch,config,ui}` are empty stubs.

## Commands (from repo root)
- `pnpm install`
- `pnpm dev` — start Next.js web app (the main app)
- `pnpm build` — build the web app
- `pnpm lint` / `pnpm type-check` / `pnpm test:ci`
- `pnpm deploy:rules` — deploy Firestore + Storage rules
- `pnpm deploy:functions` — deploy Cloud Functions
- Tests: 47 passing (40 web + 7 functions). `type-check` is a real CI gate (`tsc --noEmit`). `apps/web/next.config.ts` has `ignoreBuildErrors: false`.

## Vercel Setup (one-time in dashboard)
Option A (recommended): Root Directory = `apps/web` → uses `apps/web/vercel.json`
Option B (fallback): Root Directory = repo root → uses root `vercel.json` with correct build cmd

## Conventions
- ESLint flat config (`apps/web/eslint.config.mjs`) with `eslint-plugin-unused-imports`; unused vars/args/caught-errors must be `_`-prefixed.
- `apps/web/tsconfig.json` excludes `agents/**` and `public/**` from type-check.
- Privileged server work uses the **Admin SDK** (`@/lib/server/firebase-admin`) which BYPASSES Firestore rules. Client uses `@/lib/firebase`.

## Auth model (important)
- Client role: read from Firestore `users/{uid}.role` in {admin, manager, agent} (see `lib/AuthContext.tsx`).
- Server admin check: `verifyAdminRequest` (`lib/server/auth-guard.ts`) — Firebase Bearer token with `role==='admin'`. `verifyRequest` also accepts the `X-SBR-SECRET-KEY` header for service/cron calls.
- Edge middleware (`apps/web/middleware.ts`) matches ONLY `/api/orchestrate` — it is NOT broad protection.
- Admin page protection: client-side auth guard in `app/admin/layout.tsx` — redirects to `/admin/login` if not authenticated.
- Firestore/Storage security rules are staff-gated via `users/{uid}.role` (see `firestore.rules`) — pending deploy (see NEXT_STEPS.md).

## API Auth (hardened)
- Admin-only: `viewing-requests`, `concierge/send-whatsapp`, `telegram/setup`, `wealth/roi` → `verifyAdminRequest`
- Service+token: `admin/ingest` → `verifyRequest` (Firebase token OR X-SBR-SECRET-KEY)
- Webhook secret: `telegram/webhook`, `whatsapp/webhook`, `ingest/whatsapp` → conditional SBR_SECRET_KEY check
- Public: `listings`, `leads`, `leads/request-viewing`, `closer/initiate`, `concierge/[leadId]`, `wealth/portfolio`, `whatsapp/heartbeat`

## Reality check
Pre-production. Some services are mock/scaffolded (`MockAIService`, unwired i18n). Test coverage is thin. Older `STATUS.md`/`TODO.md` are aspirational/stale.

## Constraints for AI sessions
- GitHub access is scoped to `ahmedfawzy8866/i-sierra-2027` only — do not touch other repos.
- Develop on branch `claude/compassionate-cori-6Q0bx`. Never force-push or delete `main`.
- Do not deploy without explicit approval. Never put secrets in chat.
