# Pre-Push Checklist — Sierra 2027

**Use this checklist before pushing to GitHub and deploying to production.**

---

## ✅ Code Quality

- [ ] **TypeScript Check**
  ```bash
  cd apps/web
  npx tsc --noEmit
  ```
  Expected: Zero type errors

- [ ] **Linting**
  ```bash
  pnpm run lint
  ```
  Expected: No warnings or errors

- [ ] **Build Success**
  ```bash
  pnpm run build
  ```
  Expected: "✓ Compiled successfully" (warnings OK for now)

- [ ] **Tests Passing**
  ```bash
  pnpm run test:ci
  ```
  Expected: All tests pass

---

## ✅ Git Hygiene

- [ ] **Commit Messages Clear**
  - Follows convention (feat:, fix:, refactor:, etc.)
  - Includes description of changes
  - References issue if applicable

- [ ] **Branch Up to Date**
  ```bash
  git fetch origin
  git merge origin/main
  ```

- [ ] **No Sensitive Data**
  - No `.env.local` committed
  - No Firebase keys in code
  - No passwords or tokens in commits

---

## ✅ Functionality

- [ ] **Core Features Working**
  - [ ] Property listing page loads
  - [ ] Map rendering with properties
  - [ ] Admin dashboard accessible
  - [ ] API endpoints responding

- [ ] **Firebase Connection**
  - [ ] Can read properties from Firestore
  - [ ] Can authenticate users
  - [ ] Can upload media to Storage

- [ ] **UI/UX**
  - [ ] Responsive on mobile/tablet/desktop
  - [ ] No console errors
  - [ ] No visual regressions

---

## ✅ Security

- [ ] **API Keys Protected**
  - [ ] Server-only keys in `lib/server/`
  - [ ] Client keys prefixed with `NEXT_PUBLIC_`
  - [ ] No hardcoded secrets

- [ ] **Authentication Required**
  - [ ] Admin routes need Firebase token
  - [ ] Sensitive endpoints validate X-SBR-SECRET-KEY
  - [ ] Middleware protects /api/* routes

- [ ] **Rate Limiting Configured**
  - [ ] API endpoints have rate limits
  - [ ] Firestore rules restrict access

---

## ✅ Performance

- [ ] **Lighthouse Scores**
  - [ ] Performance: 90+
  - [ ] Accessibility: 95+
  - [ ] Best Practices: 95+
  - [ ] SEO: 95+

- [ ] **Load Times**
  - [ ] Landing page: <3s (on 4G)
  - [ ] API responses: <200ms (p95)

---

## ✅ Documentation

- [ ] **README.md Updated**
  - [ ] Setup instructions current
  - [ ] Links working
  - [ ] Screenshots fresh

- [ ] **API.md Updated**
  - [ ] New endpoints documented
  - [ ] Example requests/responses correct
  - [ ] Error codes listed

- [ ] **CHANGELOG.md Updated** (if applicable)
  - [ ] Version bumped
  - [ ] Changes listed with breaking notes

---

## ✅ Environment Setup

- [ ] **Staging Environment Ready**
  ```
  Firebase Project: sierra-blu-staging
  Vercel URL: https://sierra-2027-staging.vercel.app
  ```

- [ ] **Production Environment Ready**
  ```
  Firebase Project: sierra-blu-production
  Vercel URL: https://sierra-2027.vercel.app
  ```

- [ ] **Secrets Configured in Vercel**
  - [ ] FIREBASE_SERVICE_ACCOUNT_JSON
  - [ ] X-SBR-SECRET-KEY
  - [ ] All integration keys (Telegram, Stripe, etc.)

---

## ✅ Pre-Push Commands

Run this sequence to verify everything:

```bash
# 1. Update from main
git fetch origin
git merge origin/main

# 2. Install dependencies
pnpm install

# 3. Type check
cd apps/web
npx tsc --noEmit

# 4. Lint
pnpm run lint

# 5. Build
pnpm run build

# 6. Test
pnpm run test:ci

# 7. Check git status
git status

# 8. Review changes
git diff HEAD~5..HEAD

# 9. Ready to push!
git push origin feature-branch-name
```

---

## ✅ Post-Push (GitHub Actions)

After pushing, GitHub Actions will:

1. **Test Workflow** (test.yml)
   - Run linting
   - Run type checking
   - Run tests
   - Upload coverage

2. **Build Workflow** (build.yml)
   - Build Next.js app
   - Verify no errors
   - Generate build report

3. **Deploy Workflow** (deploy.yml, main branch only)
   - Deploy to Vercel staging
   - Deploy to production
   - Comment PR with URLs

---

## ✅ Manual Testing Checklist (Before Release)

- [ ] **Desktop Browser** (Chrome/Safari/Firefox)
  - [ ] Landing page renders
  - [ ] Property listings load
  - [ ] Map shows properties
  - [ ] Admin login works
  - [ ] Can create a deal

- [ ] **Mobile Browser** (iPhone/Android)
  - [ ] Pages responsive
  - [ ] Touch interactions work
  - [ ] Forms usable

- [ ] **API Testing** (Postman/curl)
  - [ ] GET /api/listings returns properties
  - [ ] POST /api/admin/ingest works
  - [ ] Authentication enforced

- [ ] **Firebase** (Console)
  - [ ] New data appears in Firestore
  - [ ] Cloud Functions executing
  - [ ] Storage bucket accessible

---

## ✅ Deployment Verification (Production)

After Vercel deployment:

1. Open https://sierra-2027.vercel.app
2. Clear browser cache (Cmd+Shift+Delete or Ctrl+Shift+Delete)
3. Run Lighthouse audit (Chrome DevTools)
4. Check error logs (Vercel dashboard)
5. Verify Firebase connection (open Network tab)
6. Test critical user flows:
   - Login
   - View properties
   - Search
   - Admin dashboard

---

## ❌ Stop & Don't Push If:

- [ ] TypeScript errors exist
- [ ] Failing tests
- [ ] Console errors/warnings
- [ ] Build fails
- [ ] Sensitive keys committed
- [ ] Documentation out of date
- [ ] No commit message
- [ ] Merge conflicts unresolved

---

## 🆘 Rollback Procedure

If production is broken:

```bash
# 1. Identify bad commit
git log --oneline | head -5

# 2. Revert commit
git revert bad-commit-hash

# 3. Push to trigger redeploy
git push origin main

# 4. Monitor Vercel deployment
vercel logs

# 5. Verify fix
# Open https://sierra-2027.vercel.app and test
```

---

**Last Updated:** 2026-05-26  
**Next Review:** After each deployment
