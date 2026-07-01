# Archived 2026-07 — repo de-duplication

These directories were **archived (not deleted)** during a repo health cleanup.
Everything here is a **provable duplicate of, or dead relative to, the deployed
app** (`apps/sierra-estates-realty`, which Vercel builds in isolation). Kept for
recoverability; full history also remains in git.

## What was archived and why

| Archived path | Was | Reason it's safe to archive |
|---|---|---|
| `app/`, `components/` | root-level Next app frontend | Divergent stale copy of the app; 0 API routes |
| `frontend-vercel/` | full app clone (~796 files, **96 API routes**) | Every route also exists in the live realty app |
| `sierra-estates-final/` | nested mini-monorepo (**90 api/backend files**) | Duplicate of the live app |
| `backend/` (`@sierra-estates/backend`) | full `/api/*` backend | Every sampled route (closer/initiate, telegram/webhook, whatsapp/webhook, leads, viewing-requests…) exists in the live realty app |
| `services/`, `project/` | empty / near-empty | 0–1 files |
| `apps/frontend` | files without a package.json | Not a workspace member; dead |
| `package-lock.json` | npm lockfile | Repo is pnpm-only; nothing referenced it |

> **Divergence caveat:** the full-stack duplicates above (`backend/`,
> `frontend-vercel/`, `sierra-estates-final/`) may have drifted from the live
> copies. They were archived because the live realty app holds the canonical
> routes, but no line-by-line diff of the drift was done.

## Restored after review (NOT archived — real, standalone, no live counterpart)

A code review flagged that these are operational/standalone code, not dead
duplicates, so they were **kept in the tree**:

- `apps/agents` — standalone worker scripts (stage-9 closer, WhatsApp scraper);
  wired via ops/n8n at runtime, not via imports.
- `apps/mass-blast` — unique mass-messaging tool (phone-parser + UI).
- `apps/sierra-estates-admin-portal` — real admin UI.

## Kept (never archived)
- `apps/sierra-estates-realty` (the app), `apps/api` (real Python Cloud Run service)
- `packages/*`, `functions`, `artifacts/*`, `lib/*`, `lib/integrations/*`, `scripts`
- `storage.rules`, `firestore.indexes.json` (referenced by `firebase.json`)

Verified after this change: `pnpm install --frozen-lockfile`, `pnpm type-check`,
`pnpm lint`, and the realty `build` all pass.
