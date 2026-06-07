# `back` — Sierra Estates 1.0 Unified Backend

Production-grade backend for the Sierra Estates real-estate platform, built on a
**100% zero-cost tier** (Vercel + Firebase Firestore *Spark* + a single VPS/local
Python runtime) under strict **Anti-Gravity separation of concerns**.

> **Reality note (read before deploying).** This scaffold was generated against the
> actual workspace. Several items in the original mandate did **not** exist and were
> reconciled:
> | Mandate referenced | Reality |
> |---|---|
> | repo `back` | did not exist — this scaffold **is** it (created fresh) |
> | `engine_core.py` (Python) | the only existing scraper was **Node.js** (`3030/.../whatsapp-scraper-bot/index.js`); this Python engine is new |
> | `packages/core-modules/` | renamed to **`core_modules`** — a hyphen is not a legal Python import name |
> | `apps/sierra-blu-realty` | the top-level `sierra-blu-realty` repo is currently **empty** |
> | `Sierra Blu Omega Final.html`, `Sierra Estates Admin (1).html` | not present anywhere in the workspace |

## Repository layout

```
back/
├── .agent/                       # autonomous execution state, telemetry, uptime flags
│   └── README.md
├── workflows/
│   └── workflow.json             # orchestration layer (the unique pipeline spec)
├── bots/
│   └── whatsapp-scraper-bot/
│       ├── engine_core.py        # SINGLE SOURCE OF TRUTH: Gemini 1.5 Pro parse + Firestore push
│       └── requirements.txt      # pinned deps (firebase-admin ⨯ google-generativeai resolved)
├── packages/
│   └── core_modules/             # shared business logic — 21-compound matrix + schema (DRY)
│       ├── __init__.py
│       └── schema.py
├── devops/
│   ├── firestore.rules           # Spark-tier security rules (anti-gravity enforced in DB)
│   ├── sierra-engine.service     # systemd daemon (24/7, leak-guarded, auto-restart)
│   └── run_engine.sh             # supervisor fallback (no systemd) with backoff
├── .env.example                  # credential-vault template (real .env is git-ignored)
└── .gitignore                    # blocks .env / service-account JSON
```

## Anti-Gravity separation of concerns

| Tier | App | Access | Host |
|------|-----|--------|------|
| **1 — Client Hub** | `apps/sierra-blu-realty` | **Read-only.** Streams published listings from the 21-compound matrix via Firestore real-time listeners. Never writes. | Vercel (public) |
| **2 — Admin & CRM** | `apps/sierra-blu-admin-portal` | **Write-control.** Manual unit creation, CRM lead tracking, WhatsApp intake, telemetry. | Vercel (private route, auth-gated) |
| **Writer of record** | `bots/whatsapp-scraper-bot/engine_core.py` | The **only** process that writes `listings/` programmatically — via the Admin SDK service account, which bypasses client rules by design. | VPS / local |

The boundary is enforced in **three places**: (1) the Vercel client app ships no write
credentials; (2) `firestore.rules` denies client writes to `listings`/`whatsapp_intake`;
(3) the Admin SDK service account is mounted only on the VPS daemon.

## Dependency resolution — `firebase-admin` ⨯ `google-generativeai`

Both pull `google-api-core` + `protobuf` transitively; conflicts arise when one
floats `protobuf` past the other's ceiling. `requirements.txt` pins all three to a
shared floor (`protobuf==4.25.5`, `google-api-core 2.x`). Validate after install:

```bash
cd back
python -m venv .venv && . .venv/bin/activate
pip install -r bots/whatsapp-scraper-bot/requirements.txt
pip check          # MUST print: No broken requirements found.
```

## Quick start (VPS / local runtime)

```bash
# 1. Secrets (never committed)
sudo mkdir -p /etc/sierra-estates
sudo cp .env.example /etc/sierra-estates/.env      # then edit: GEMINI_API_KEY, FIREBASE_CONFIG, TELEGRAM_*
sudo chmod 600 /etc/sierra-estates/.env

# 2. Firestore rules
firebase deploy --only firestore:rules

# 3. Run 24/7
sudo cp devops/sierra-engine.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now sierra-engine
journalctl -u sierra-engine -f
```

## Verification matrix

| Check | Command | Pass |
|-------|---------|------|
| Shared schema imports | `python -c "from packages.core_modules.schema import COMPOUND_MATRIX"` | 21 compounds |
| Deps resolve | `pip check` | no broken requirements |
| Engine compiles | `python -m py_compile bots/whatsapp-scraper-bot/engine_core.py` | exit 0 |
| Workflow valid JSON | `python -m json.tool workflows/workflow.json` | parses |
| No secret tracked | `git ls-files \| grep -E '\.env$\|service-account'` | empty |
