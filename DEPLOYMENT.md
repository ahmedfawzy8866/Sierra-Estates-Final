# Deploying Sierra Estates to Vercel

This is a **monorepo**. The deployable Next.js 14 app lives in **`frontend-vercel/`**
(the repository root has no `package.json`). The single most important setting is the
**Root Directory**.

## One-time setup (Vercel Dashboard → Git integration)

1. **Import the repo** — Vercel → *Add New… → Project* → import
   `ahmedfawzy8866/28-5-Si`.
2. **Set Root Directory = `frontend-vercel`** (Project → *Settings → Build & Deployment
   → Root Directory*). This is required — without it Vercel looks at the repo root,
   finds no `package.json`, and the build fails.
3. **Framework Preset:** Next.js (auto-detected once Root Directory is correct).
   `frontend-vercel/vercel.json` pins this explicitly.
4. **Environment Variables** — add the keys from
   [`frontend-vercel/.env.example`](frontend-vercel/.env.example) with **real,
   freshly-rotated** values (Project → *Settings → Environment Variables*). At minimum
   the app expects:
   - `NEXT_PUBLIC_FIREBASE_*` (web SDK config)
   - `GOOGLE_AI_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `GOOGLE_MAPS_API_KEY`
   - `PF_API_KEY`, `PF_API_SECRET` (Property Finder)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - `OPENCLAW_BASE_URL`, `OPENCLAW_TOKEN`
   - `CRON_SECRET`, `SBR_SECRET_KEY`

> ⚠️ Any key that was previously committed to git must be **rotated** before use.

## How deploys trigger

With Git integration connected:

- **Every push to a branch** → a **Preview** deployment.
  (This branch, `claude/zealous-lamport-ZSRct`, deploys to a preview URL once
  connected.)
- **Push/merge to the production branch** (`master` or `main`) → a **Production**
  deployment.

So merging this PR to the production branch ships it.

## CLI alternative (optional)

```bash
cd frontend-vercel
npx vercel link          # pick the project; sets Root Directory via .vercel/
npx vercel deploy        # preview
npx vercel deploy --prod # production
```

`next build` is verified green locally (49 routes).
