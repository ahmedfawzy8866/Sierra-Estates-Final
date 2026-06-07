# Sierra Estates 1.0 — Production Deployment Manifest

> **Status:** Blueprint. Read the **Reality Reconciliation** first — several names in the
> original mandate do not exist in this repository, and the build is currently **gated**
> by missing modules. Do not run a production deploy until the ✅ gates below are green.

---

## 0. Reality Reconciliation (read this first)

The deployment mandate referenced artifacts that are **not present** in the workspace. The
table maps each named item to what actually exists, so this manifest targets reality.

| Mandate said | Exists? | Actual artifact to deploy |
|---|---|---|
| Repo `sierra-2026` | ❌ No | This repo is `ahmedfawzy8866/Sierra-Blu-Systm`. Use its real name, or create/rename a repo before wiring Vercel/Firebase. |
| `Sierra Estates Omega Final.html` (client hub) | ❌ No | The client hub is the **Next.js 16 app** in `frontend/`. `frontend/hero-filter.html` is a *standalone static design mockup*, not the deployable app. |
| `Sierra Estates Admin (1).html` (admin console) | ❌ No | The admin console already lives **inside the same Next app** at `frontend/app/admin/*` (dashboard, deals, login, sync, units). It is **not** a separate HTML SPA and needs **no separate deploy**. |
| `scraper_core.py` | ❌ No | The real Python services are `backend/property_finder_sync.py` (sync hub) and `scripts/sierra_estatese_bot_implementation.py` (712-line bot). Pick one as the daemon entrypoint. |
| Firebase project `sierra-2026` | ❌ Not created | `firebase` + `firebase-admin` are wired in code (`frontend/lib/firebase.ts`, `frontend/lib/server/firebase-admin.ts`), but there is **no `firebase.json` / `firestore.rules`** in the repo yet — they are authored in §2. |

### Hard deploy gates (must be green before any production push)

- [ ] **GATE 1 — Build resolves.** `cd frontend && npx tsc --noEmit` currently fails on **3 missing modules** that only exist in your local copy:
  `@/hooks/useSierraBlu`, `../../hooks/useProperties`, `@/agents/stage-9-closer/CloserAgent`.
  These are **module-resolution** failures — `next.config.ts` has `typescript.ignoreBuildErrors: true`,
  which suppresses *type* errors but **not** missing-import errors, so `next build` will fail.
  → Land your local push (which provides these files) before deploying.
- [ ] **GATE 2 — Cross-platform build scripts.** `frontend/package.json` uses Windows-only
  `set NODE_OPTIONS=… && …`. On Vercel's Linux builders the env var silently does not apply.
  Fix with `cross-env` (see §1.3).
- [ ] **GATE 3 — Secrets hygiene.** No real secret is committed. `.gitignore` now blocks
  `.env`, `.env.*`, and `*service-account*.json`. Keep it that way; inject secrets via the
  platform, never the repo (see §3.1).

---

## 1. Production Deployment Workflow — Vercel (client hub + admin console)

**Architecture decision:** client hub and admin are **one Next.js app, one Vercel project.**
The admin is a route segment (`/admin`) guarded by auth, not a second deployment. This is the
zero-cost, zero-latency path — one build, one edge network, shared session.

### 1.1 Project import
1. Push this repo to GitHub under its real name.
2. Vercel → **Add New Project** → import the repo.
3. **Root Directory:** `frontend` (the app is not at repo root).
4. **Framework Preset:** Next.js (auto-detected). **Build Command:** `next build`.
   **Install Command:** `npm ci`. **Output:** `.next` (managed by Next adapter — do not set manually).
5. **Node version:** 20.x (matches `@types/node` 20 and the CI matrix).

### 1.2 Routing, base paths, edge caching
- App Router needs **no `basePath`** — client hub serves from `/`, admin from `/admin`.
- The static mockup is reachable at `/hero-filter.html` (served from `frontend/public/`). Keep it
  out of the route tree (it already is).
- **Caching rules** (set per-route, not globally — admin and API must never be cached at the edge):

  | Surface | Strategy |
  |---|---|
  | Marketing/listing pages | `export const revalidate = 300` (ISR, 5-min) or `dynamic = 'force-static'` where data is static |
  | `/admin/*` | `export const dynamic = 'force-dynamic'` + `Cache-Control: private, no-store` (already partly enforced by the security headers in `next.config.ts`) |
  | `/api/*` | `dynamic = 'force-dynamic'`; never cache; rely on Firestore for state |
  | Images | `next/image` + the `remotePatterns` already in `next.config.ts` |

- The security headers (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, etc.) are already
  defined in `frontend/next.config.ts` and apply at the edge automatically.

### 1.3 Required fix before first deploy (GATE 2)
```jsonc
// frontend/package.json — replace Windows-only `set`:
"scripts": {
  "dev":   "cross-env NODE_OPTIONS=--max-old-space-size=8192 next dev --webpack",
  "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 RAYON_NUM_THREADS=2 next build --webpack"
}
// then: npm i -D cross-env
```
> Also resolve the **duplicate Next config**: `next.config.js` (stale stub) and `next.config.ts`
> (the real one). Delete `next.config.js` so the `.ts` (with next-intl + turbopack stubs) is authoritative.

### 1.4 Promotion flow
`feature branch → PR → Vercel Preview deployment (auto) → merge to main → Production`.
Keep `main` protected; Preview URLs are your staging tier (zero extra cost).

---

## 2. Database & CMS Integration Grid — Firestore + FireCMS

### 2.1 Create the Firestore backend
```bash
npm i -g firebase-tools
firebase login
firebase projects:create sierra-estates-prod   # real ID; 'sierra-2026' was illustrative
firebase init firestore                          # creates firestore.rules + firestore.indexes.json
# Console → Firestore Database → Create → Production mode → region eur3 (closest to Cairo/EU)
```

### 2.2 Security rules (role-gated, staff-write / public-read-where-safe)
Author `firestore.rules` at repo root. This mirrors the app's `users/{uid}.role` auth model:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn()    { return request.auth != null; }
    function role()        { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isStaff()     { return signedIn() && role() in ['admin','manager','agent']; }
    function isAdmin()     { return signedIn() && role() == 'admin'; }

    // Public can read published Portfolio Assets; only staff write.
    match /listings/{id} {
      allow read:  if resource.data.status == 'published' || isStaff();
      allow write: if isStaff();
    }

    // Strategic Pipeline (Investment Stakeholders) — staff only, never public.
    match /leads/{id}   { allow read, write: if isStaff(); }
    match /deals/{id}   { allow read, write: if isStaff(); }

    // User profile/role docs — self-read; only admin mutates roles.
    match /users/{uid} {
      allow read:  if signedIn() && (request.auth.uid == uid || isStaff());
      allow write: if isAdmin();
    }

    // Server pipeline writes via Admin SDK BYPASS these rules (service account) — intended.
    match /{document=**} { allow read, write: if false; } // default deny
  }
}
```
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
> The Python/Node backend writes through the **Admin SDK service account**, which bypasses these
> rules by design — so rules can stay strict for client traffic without breaking ingestion.

### 2.3 Hook FireCMS Cloud over the existing Firestore (no infra)
1. Go to **app.firecms.co** → **New Project** → *Connect existing Firebase project* → select the project.
2. Grant FireCMS the generated service-account role (Firestore read/write) in Google Cloud IAM.
3. Define collections in the FireCMS UI matching your Firestore shape (`listings`, `leads`, `deals`,
   `users`) — this is the free spreadsheet-style editor; it reads/writes the same Firestore, so no
   data migration and no servers to run.
4. Restrict FireCMS editor access to admin emails in the FireCMS project settings.

---

## 3. Local/VPS Automation Engine — Python Autopilot Daemon

> Entrypoint is the real file (`backend/property_finder_sync.py` **or**
> `scripts/sierra_estatese_bot_implementation.py`), **not** `scraper_core.py`. Examples below use a
> placeholder `AUTOPILOT_ENTRY` — set it to your chosen script.

### 3.1 Environment variable injection matrix (secrets never in git)
Create `/etc/sierra-estates/autopilot.env` on the VPS (root-owned, `chmod 600`):
```ini
GEMINI_API_KEY=__inject_at_host__
TELEGRAM_BOT_TOKEN=__inject_at_host__
TELEGRAM_CHAT_ID=__inject_at_host__
GOOGLE_APPLICATION_CREDENTIALS=/etc/sierra-estates/service-account.json
FIRESTORE_PROJECT_ID=sierra-estates-prod
```
Load in Python with `python-dotenv` (fail fast if a key is missing):
```python
import os
from dotenv import load_dotenv
load_dotenv("/etc/sierra-estates/autopilot.env")
for k in ("GEMINI_API_KEY", "TELEGRAM_BOT_TOKEN", "FIRESTORE_PROJECT_ID"):
    if not os.environ.get(k):
        raise SystemExit(f"FATAL: missing required env var {k}")
```
Commit a non-secret `.env.example` template (key names only) so the matrix is documented.
**Never** commit the real file — `.gitignore` now blocks `.env*` and `*service-account*.json`.

### 3.2 Production daemon — systemd (preferred on a VPS)
`/etc/systemd/system/sierra-autopilot.service`:
```ini
[Unit]
Description=Sierra Estates Autopilot (Property Finder sync / AI bot)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sierra
WorkingDirectory=/opt/sierra-estates
EnvironmentFile=/etc/sierra-estates/autopilot.env
ExecStart=/opt/sierra-estates/.venv/bin/python -u backend/property_finder_sync.py
Restart=always
RestartSec=5
# Crash/loop protection
StartLimitIntervalSec=0
# Memory-leak guard: hard-cap RSS, let systemd restart if exceeded
MemoryMax=512M
MemoryHigh=400M
# Periodic self-heal restart (defends against slow leaks)
RuntimeMaxSec=21600
# Logging to journald
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sierra-autopilot

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sierra-autopilot
journalctl -u sierra-autopilot -f      # live logs
```
This gives you: auto-restart on crash (`Restart=always`), boot persistence (`enable`),
memory-leak containment (`MemoryMax` + 6-hour `RuntimeMaxSec` recycle), and centralized logs.

### 3.3 Fallback supervisor (no systemd, e.g. shared host) — robust wrapper
`run_autopilot.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
set -a; source /etc/sierra-estates/autopilot.env; set +a
cd /opt/sierra-estates
backoff=5
while true; do
  echo "[$(date -Is)] starting autopilot"
  if .venv/bin/python -u backend/property_finder_sync.py; then
    backoff=5                                   # clean exit → reset backoff
  else
    echo "[$(date -Is)] crashed (exit $?), restarting in ${backoff}s"
  fi
  sleep "$backoff"
  backoff=$(( backoff < 300 ? backoff*2 : 300 ))  # exponential backoff, cap 5 min
done
```
Run under `nohup`/`tmux`, or register with `supervisord` (`autorestart=true`, `startretries=999`).

### 3.4 Operational guardrails (scraper hygiene)
- Respect target-site Terms of Service and `robots.txt`; throttle requests (the sync hub should
  rate-limit, not hammer Property Finder) — protects both you and the daemon's stability.
- Send a heartbeat to your Telegram chat on start/stop/error so silent death is visible.
- Add a watchdog: if no successful sync in N minutes, the bot self-exits non-zero so systemd recycles it.

---

## 4. Architectural Verification Matrix

| Layer | Component | Verify command / check | Gate |
|---|---|---|---|
| Build | Next app resolves all imports | `cd frontend && npx tsc --noEmit` → 0 missing-module errors | **GATE 1** |
| Build | Cross-platform scripts | `frontend/package.json` uses `cross-env` | **GATE 2** |
| Config | Single Next config | only `next.config.ts` present | — |
| Web | Vercel build | Preview deployment succeeds, `/` + `/admin` render | — |
| Web | Edge caching | `/admin` returns `no-store`; marketing pages ISR | — |
| Data | Firestore rules | `firebase deploy --only firestore:rules` passes; emulator denies non-staff writes | — |
| Data | Admin SDK | server routes write with service account, bypass rules | — |
| CMS | FireCMS Cloud | editor lists `listings`/`leads`/`deals` from prod Firestore | — |
| Bot | Daemon | `systemctl status sierra-autopilot` = active (running); survives `kill` | — |
| Sec | Secrets | `git ls-files | grep -E '\.env$|service-account'` → empty | **GATE 3** |
```
git ls-files | grep -E '(^|/)\.env($|\.)|service-account' && echo "LEAK" || echo "clean"
```
```
```
