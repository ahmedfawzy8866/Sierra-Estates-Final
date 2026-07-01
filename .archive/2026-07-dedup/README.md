# Archived 2026-07 — repo de-duplication

These directories were **archived (not deleted)** during a repo health cleanup.
None were built into or imported by the deployed app (`apps/sierra-estates-realty`,
which Vercel builds in isolation). They are kept here for recoverability; full
history also remains in git.

## What was archived and why

| Archived path | Was | Reason |
|---|---|---|
| `app__`, `components__`, `lib__`* | root-level Next app skeleton | Divergent, stale duplicate of `apps/sierra-estates-realty` (not the workspace `lib/*` — that stays) |
| `frontend-vercel__` | second full Next app clone (~796 files) | Dead duplicate, built nowhere |
| `sierra-estates-final__` | nested mini-monorepo | Recursive duplication |
| `backend__`, `project__`, `services__` | stray skeleton dirs | Dead |
| `apps__frontend` | files without a package.json | Not a workspace member; dead |
| `apps__agents` | `@sierra-estates/agents-tools` | Orphaned — nothing depends on it (realty uses `packages/agents`) |
| `apps__mass-blast` | legacy app | In workspace but deployed nowhere |
| `apps__sierra-estates-admin-portal` | legacy admin | Deployed nowhere; docs already declared it removed |
| `package-lock.json` | npm lockfile | Repo is pnpm-only; nothing referenced it |

> `lib__api-zod` etc. were briefly moved by mistake and **restored** — the root
> `lib/*` and `lib/integrations/*` globs are real workspace packages and remain live.

## Kept (NOT archived)
- `apps/sierra-estates-realty` (the app), `apps/api` (real Python Cloud Run service)
- `packages/*`, `functions`, `artifacts/*`, `lib/*`, `lib/integrations/*`, `scripts`
- `storage.rules`, `firestore.indexes.json` (referenced by `firebase.json`)

Verified after archiving: `pnpm type-check`, `pnpm lint`, and the realty `build` all pass.
