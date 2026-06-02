# Sierra Blu Platform - Unified Monorepo

> Luxury Real Estate Intelligence Platform with AI-Powered Insights

A production-ready, unified monorepo consolidating all Sierra-related repositories into one cohesive, high-performance platform.

> **Migration complete**: Code and history from `Sierra-Blu-Systm`, `68e6464b...` (hash-repo), `frontend`, and `New-folder` have been consolidated here. See [MIGRATION.md](./MIGRATION.md) for details.

## 📦 Repository Structure

```
i-sierra-2027/
├── apps/
│   ├── web/                    # Main customer-facing app (Next.js 16 + Turbopack)
│   │   ├── app/               # App Router pages (62 routes) & layouts
│   │   ├── components/        # React components (13+ modules)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities, services, models, agents
│   │   └── public/            # Static assets
│   ├── admin/                 # Admin portal (Vite + React SPA)
│   │   └── src/               # React source (auth, CRM, listing modules)
│   ├── api/                   # Python backend (FastAPI)
│   │   ├── main.py            # FastAPI entry point
│   │   ├── requirements.txt   # Python dependencies
│   │   └── Dockerfile         # Container definition
│   └── agents/                # AI agents & bots
│       ├── stage-9-closer/    # Closer agent (TypeScript)
│       └── whatsapp-scraper/  # WhatsApp bot (Node.js)
├── packages/
│   ├── api/                   # Shared API types & clients
│   ├── db/                    # Firestore models & utilities
│   ├── auth/                  # Firebase Auth wrapper
│   ├── agents/                # Multi-agent framework
│   ├── batch/                 # Batch processing queue
│   ├── config/                # Shared configuration
│   └── ui/                    # Shared React component library
├── functions/                 # Firebase Cloud Functions (Node.js 20)
│   └── src/
│       └── index.ts           # collectData, processDataForApp, api, healthCheck
├── workflows/                 # Automation scripts (WhatsApp, owner search, etc.)
├── scripts/
│   └── create-migrate-branches.sh  # Run by repo admin to push migrate/* branches
├── .github/workflows/         # CI/CD pipelines (ci, build, test, deploy, codeql)
├── firestore.rules            # Production Firestore security rules
├── storage.rules              # Production Storage security rules
├── pnpm-workspace.yaml        # Monorepo workspace config
├── turbo.json                 # Turborepo build cache config (v2)
├── package.json               # Root workspace dependencies
├── firebase.json              # Firebase hosting & functions config
├── vercel.json                # Vercel deployment config
├── MIGRATION.md               # Migration map & branch reference
├── ARCHITECTURE.md            # Full architecture overview
└── DEPLOYMENT_GUIDE.md        # End-to-end deployment steps
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **pnpm** 9+
- **Firebase CLI** (for deployment)
- **Docker** (optional, for local Firebase emulation)

### Installation

```bash
# Install dependencies across all workspaces
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config and API keys
```

### Development

```bash
# Start all apps & functions in dev mode (parallel)
pnpm dev

# Or start individual apps
pnpm dev:web       # Main app on http://localhost:3000
pnpm dev:admin     # Admin on http://localhost:5173
pnpm dev:functions # Functions on http://localhost:5001
```

### Building for Production

```bash
# Type-check all packages
pnpm type-check

# Lint code
pnpm lint

# Run tests
pnpm test

# Build all apps & functions
pnpm build

# Validate complete build
pnpm validate-build
```

## 🐍 Python Scripts

| Script | Purpose |
|---|---|
| `lead-scorer.py` | Score leads 1–10 using Sierra AI logic |
| `firestore-exporter.py` | Export Firestore collections to JSON/CSV |
| `property-sync.py` | Sync Property Finder listings → Firestore |
| `whatsapp-broadcast.py` | Send templated WhatsApp broadcasts |
| `analytics-report.py` | Generate business KPI Markdown reports |

See [docs/PYTHON_SCRIPTS.md](docs/PYTHON_SCRIPTS.md) for full usage.

## 🔧 Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js + Turbopack | 16.2 |
| **Framework** | React | 19 |
| **Language** | TypeScript | 5.3 |
| **Build** | Turbopack | Latest |
| **Styling** | Tailwind CSS | 4 |
| **Backend** | Firebase Cloud Functions | Node 20 |
| **Database** | Firestore | Real-time |
| **Auth** | Firebase Auth | + JWT |
| **AI** | Google Gemini 2.5 | + Anthropic API |
| **Observability** | OpenTelemetry + Arize | Latest |
| **Monorepo** | pnpm workspaces | 9 |
| **Build Cache** | Turborepo | Latest |

## 📊 Apps Overview

### Web App (`apps/web`)
- **Purpose**: Main customer-facing platform
- **Technology**: Next.js 16 + Turbopack (fastest Next.js build)
- **Features**:
  - Cinematic dark-mode luxury design
  - AI-powered property intelligence
  - Real-time CRM Kanban board
  - Guest advisor access management
  - Multi-channel integrations (Telegram, WhatsApp)
- **Performance**: < 2.5s LCP, < 100ms TTFB
- **Deploy**: Firebase Hosting + Next.js standalone mode

### Admin Portal (`apps/admin`)
- **Purpose**: Internal management interface
- **Technology**: Vite SPA (super-fast dev builds)
- **Features**:
  - Agent orchestration dashboard
  - Batch job monitoring
  - User & permission management
  - Analytics & observability
  - Configuration management
- **Deploy**: Separate Vite build → Firebase Hosting `/admin` route

## 🛠️ Cloud Functions Architecture

Located in `/functions`, deployed to Firebase Cloud Functions (Node.js 20):

```
/api/*              → REST API routes
/webhooks/*         → External integrations (PropertyFinder, Telegram, etc.)
/batch/*            → Batch job submission & monitoring
/agents/*           → Agent orchestration & execution
/cron/*             → Scheduled tasks (every hour, daily, etc.)
```

**Key Features**:
- Multi-region deployment (us-central1, us-east1, asia-east1)
- Firestore triggers for real-time processing
- Pub/Sub for async event handling
- Request validation with Zod
- OpenTelemetry instrumentation

## 🗄️ Shared Packages

All packages in `/packages` are shareable across apps:

### `@api`
- API types & Zod schemas
- HTTP client wrappers
- Error handling standards

### `@db`
- Firestore collection models
- Type-safe query builders
- Migration utilities

### `@auth`
- Firebase Auth wrapper
- JWT token management
- Role-based access control

### `@agents`
- Multi-agent framework
- Tool definitions
- Workflow orchestration

### `@config`
- Environment validation (Zod)
- Feature flags
- Constants & settings

### `@ui`
- Shared React components
- Tailwind CSS utilities
- Design system tokens

## 📈 Performance Metrics

**Build Times**:
- Web app: ~45s (Turbopack) vs ~120s (webpack)
- Admin app: ~8s (Vite)
- Functions: ~15s

**Lighthouse Scores** (Target):
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Core Web Vitals**:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

## 🧪 Testing

```bash
# Run all tests with coverage
pnpm test

# Unit tests only
pnpm test --testPathPattern=unit

# Integration tests
pnpm test --testPathPattern=integration

# E2E tests (requires running app)
pnpm test:e2e

# Watch mode
pnpm test --watch
```

## 🚢 Deployment

### Staging
```bash
pnpm build
firebase deploy --project sierra-blu-staging
```

### Production (with approval)
```bash
# Validate build first
pnpm validate-build

# Deploy to production
firebase deploy --project sierra-blu-prod

# Monitor deployment
firebase functions:log --region us-central1
```

### Rollback
```bash
# Instant rollback to previous version
firebase hosting:rollback

# Function-specific rollback
firebase deploy --only functions:api --region us-central1 [previous-version]
```

## 💰 Cost Analysis (Monthly)

| Service | Est. Cost | Notes |
|---------|-----------|-------|
| Firebase Hosting | $15 | CDN included, 100GB bandwidth |
| Cloud Functions | $40 | 100M invocations/mo |
| Firestore | $50 | 1B reads, 100GB storage |
| Cloud Storage | $5 | 10GB stored, 50GB outbound |
| Logging | $20 | 50GB/month, 7-day retention |
| Pub/Sub | $10 | 1B messages/mo |
| **Subtotal** | **$140** | Infrastructure only |
| **AI APIs** | $500-2K | Anthropic, Google, OpenAI (variable) |
| **Total** | **$640-2,140** | Estimated monthly |

**Cost Optimization Tips**:
- ✅ Batch Firestore writes (-30%)
- ✅ Cache API responses at CDN (-25%)
- ✅ Use regional Firestore (-20%)
- ✅ Optimize function cold-starts (-15%)

## 📋 Environment Variables

See `.env.example` for complete list. Key variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sierra-blu-prod
FIREBASE_ADMIN_SDK_KEY=...

# APIs
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...

# Observability
ARIZE_API_KEY=...
OTEL_EXPORTER_OTLP_ENDPOINT=...

# Integrations
PROPERTY_FINDER_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

## 🔐 Security

- ✅ Type-safe with TypeScript strict mode
- ✅ Authentication via Firebase Auth + JWT
- ✅ Secrets via Google Secret Manager
- ✅ CORS & CSP headers configured
- ✅ SQL injection prevention (Zod validation)
- ✅ XSS protection (React automatic escaping)
- ✅ Rate limiting on Cloud Functions
- ✅ Firestore Security Rules enforced
- ✅ Cloud Storage CORS restricted

## 📚 Documentation

- `ARCHITECTURE.md` - System design & data flows
- `DEPLOYMENT_GUIDE.md` - Deployment procedures & runbooks
- `API.md` - REST API specifications
- `CONTRIBUTING.md` - Developer setup & workflow

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript strict mode
3. Add tests for new functionality
4. Run linter & tests: `pnpm validate-build`
5. Submit pull request with description

## 📞 Support

- **Issues**: GitHub Issues (this repo)
- **Docs**: See `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT_GUIDE.md`
- **Team**: Slack #sierra-blu

## 📄 License

Proprietary - Sierra Blu Inc.

---

**Last Updated**: May 31, 2026  
**Build**: Turbopack + Turborepo  
**Status**: Production Ready ✅
