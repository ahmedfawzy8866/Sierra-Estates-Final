# GO-LIVE CHECKLIST — Sierra Estates (client page)

Ordered, actionable steps to take the public client page (and its co-located admin) live.

**Architecture reminders (read first):**
- Client site **and** admin are **ONE Vercel deployment** from the **same codebase**
  (`apps/sierra-estates-realty`). Admin is not a separate build — it is host-split in
  `middleware.ts` via the `ADMIN_HOST` env var. (An optional second Vercel project for
  the admin subdomain is a *compute-isolation upgrade*, not a requirement for go-live.)
- **Firebase is backend-only** — Firestore, Storage, Auth, and Functions — **plus one
  Firebase Hosting redirect** (`admin-sierra-blu` site → `https://sierra-estates.net/admin`).
  Firebase does **not** host the web app.
- Firebase project: **`sierra-blu`**. Functions region: **`europe-west1`**.
  Hosting target `sierra-estates-admin` → site `admin-sierra-blu`.

---

## Phase 1 — Security

- [ ] Rotate the exposed Vercel token (revoke the leaked one in Vercel account settings,
      issue a new one, update the GitHub Actions secret used by `deploy-vercel.yml`).
- [ ] Confirm **no secrets in git**: no service-account JSON, `.env*`, tokens, or private
      keys tracked. `.vercel/` and `.env*` must be gitignored. Grep history if in doubt.
- [ ] Confirm all secrets live in Vercel/GitHub secret stores, not in code or chat.

## Phase 2 — Backend lockdown (Firebase)

- [ ] Confirm **every staff user** has a `users/{uid}` doc with `role` in
      `{admin, manager, agent}` (this is what the canonical
      `apps/sierra-estates-realty/firestore.rules` and Storage rules gate on).
- [ ] Deploy hardened rules:
      `firebase deploy --only firestore:rules,storage --project sierra-blu`
- [ ] Deploy functions:
      `firebase deploy --only functions --project sierra-blu`
      (region `europe-west1`).

## Phase 3 — Kill the Firebase Hosting ghost admin

- [ ] Deploy the new redirect (Task 1) so the stale admin stops serving:
      `firebase deploy --only hosting --project sierra-blu`
- [ ] Verify the legacy Hosting site now **302-redirects** to
      `https://sierra-estates.net/admin` (and that the old ghost admin no longer loads).

## Phase 4 — Vercel configuration

- [ ] Confirm **which Vercel project owns `sierra-estates.net`** (production project).
- [ ] Confirm **Root Directory = `apps/sierra-estates-realty`** (self-healed by
      `deploy-vercel.yml`'s PATCH step, but verify in the dashboard).
- [ ] Env vars set on the production project:
  - [ ] `NEXT_PUBLIC_FIREBASE_*` (from the **sierra-blu** web app config)
  - [ ] Firebase Admin credentials (service account for `@/lib/server/firebase-admin`)
  - [ ] `SBR_SECRET_KEY`
  - [ ] `CRON_SECRET`
  - [ ] `ADMIN_HOST` (e.g. `admin.sierra-estates.net`) — enables the admin host-split

## Phase 5 — Domains

- [ ] `sierra-estates.net` → the **public** Vercel project (root domain).
- [ ] `admin.sierra-estates.net` → add the domain + **CNAME** DNS record, and set
      `ADMIN_HOST=admin.sierra-estates.net` so `middleware.ts` isolates admin traffic.
- [ ] (Optional upgrade) Give the admin subdomain its **own 2nd Vercel project** from the
      same repo for full compute isolation — not required for initial go-live.

## Phase 6 — Verify (on a Vercel PREVIEW URL first)

- [ ] Client smoke test: home, listings, and contact pages load and render.
- [ ] Admin smoke test: `/admin/login` loads; sign in; one gated action succeeds.
- [ ] API smoke test: one `/api/*` call returns as expected (respecting its auth guard).
- [ ] Repeat the checks against production only after the preview passes.

## Phase 7 — Ship

- [ ] Merge to `main` → `deploy-vercel.yml` deploys **production** automatically.
- [ ] Post-deploy: re-run the Phase 6 smoke tests against `https://sierra-estates.net`
      and `https://admin.sierra-estates.net/admin`.
