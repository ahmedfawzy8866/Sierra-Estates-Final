# Project Status — Sierra Estates (Two-App Architecture)

Updated: 2026-06-25

## ✅ Complete
- **Two-app architecture**: Vercel (public + light dashboard) + Firebase Admin (bots + admin + workflows)
- **Shared data layer**: `packages/db` — single source of truth for both apps
- **Shared auth**: `packages/auth` — one Firebase Auth with custom claims
- **Route separation**: Public/read APIs in Vercel, heavy/write APIs in Firebase Admin
- **Next.js rewrites**: Heavy routes proxied from Vercel → Firebase Admin
- **Security**: Firestore/Storage rules, auth guards, rate limiting, HMAC verification
- **Build gates**: Type-check enforced, ESLint with unused-imports detection
- **Repo cleanup**: Removed 340MB of bloat (back/, vendor/, _archive/, legacy files)
- **LICENSE**: Proprietary — Sierra Estates Inc.
- **Pino logger**: Structured logging with sensitive field redaction
- **Deployment scripts**: pre-deploy-check.sh, generate-secrets.sh, setup-branch-protection.sh

## 🔄 In Progress / Manual
- **Firebase Rules Deployment**: `firebase deploy --only firestore:rules,storage`
- **Environment Secrets**: ~45 vars must be set in Vercel + Firebase Secret Manager
- **Firebase Admin App deployment**: Wire Cloud Functions to handle admin API routes
- **Custom claims setup**: Set `role` custom claim on existing Firebase Auth users

## 📋 Pre-Deployment Checklist
- [ ] Firestore rules deployed to production
- [ ] All environment secrets set in Vercel/Firebase
- [ ] Every staff user has `users/{uid}` doc with role ∈ {admin, agent, employee}
- [ ] Custom claims set on all Firebase Auth users
- [ ] Vercel project configured (Root Directory = `apps/vercel-app`)
- [ ] Firebase Admin API URL set in Vercel env (`FIREBASE_ADMIN_URL`)
- [x] CI green on main (type-check, lint)
- [x] Two-app architecture in place
- [x] Shared data contract in `packages/db`
- [x] Shared auth in `packages/auth`

## Known Gaps / Tech Debt
- i18n: next-intl removed but custom i18n underutilized
- Test coverage: needs expansion for critical paths
- `apps/admin-dashboard` still exists as legacy (redirect only)
- Python API needs Cloud Run deployment configuration
