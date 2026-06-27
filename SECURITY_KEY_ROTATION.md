# Security Advisory: Firebase API Key Rotation Required

## Issue
A Firebase API key (`AIzaSyBZLN2j...`) was previously hardcoded in source code at `apps/vercel-app/app/api/listings/route.ts`. While the key has been removed from the current codebase (commit `0d5b12b1`), it still exists in git history.

## Action Required

### 1. Rotate the Firebase API Key (CRITICAL)
Go to the [Firebase Console](https://console.firebase.google.com/):
1. Select the `sierra-estates` project
2. Go to **Project Settings** → **General** → **Web apps**
3. Delete the current web app configuration
4. Create a new web app — this generates a new API key
5. Update `NEXT_PUBLIC_FIREBASE_API_KEY` in all deployment environments (Vercel, `.env.local`, etc.)
6. Optionally restrict the old key in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **API Keys** → **Application restrictions** (set to HTTP referrer allowlist)

### 2. Why rotation matters
Firebase API keys for web apps are designed to be public-facing, but hardcoding them as fallback defaults in source code is bad practice because:
- The key may be indexed by GitHub search or scraping tools
- Unrestricted keys can be used to make unauthenticated Firestore REST API calls
- Key rotation ensures any leaked copy becomes useless

### 3. Preventing future leaks
- The ESLint rule `no-hardcoded-secrets` should be added to CI
- Environment variables must NEVER have inline fallback values containing real credentials
- The CI pipeline (`.github/workflows/ci.yml`) now includes a hardcoded secrets detector

## Status
- [x] Key removed from source code
- [x] CI pipeline checks for hardcoded secrets
- [x] ESLint rule added for `no-explicit-any` (catches implicit `any` casts that often hide secrets)
- [ ] **Key rotated in Firebase Console** (manual step required)
- [ ] **Old key restricted in Google Cloud Console** (manual step required)
