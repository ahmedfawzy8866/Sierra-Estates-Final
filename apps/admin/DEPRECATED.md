# DEPRECATED — This Vite SPA is not the real admin

This `apps/admin` Vite/React SPA is **no longer used or deployed**.

## Why it exists
It was an early prototype admin dashboard with mock/static data.
All modules here (EasyListing, CRM, TheCurator, TheScribe, TheCloser) used hardcoded dummy data and were never connected to the real Firestore.

## What replaced it
The real admin panel lives at `apps/web/app/admin/` — a full Next.js admin suite with live Firebase integration, proper auth, and all the same workflow modules backed by real data.

## Real Admin Routes (inside the Next.js deployment)
```
/admin/login       → Authentication
/admin/dashboard   → KPIs, activity feed, executive overview
/admin/units       → Property inventory management
/admin/deals       → Deal pipeline
/admin/leads/[id]  → Lead detail & CRM
/admin/team        → Team management
/admin/media       → Media hub
/admin/reports     → Analytics & reporting
/admin/sync        → Data sync center
/admin/database    → Database explorer
/admin/settings    → System settings
/admin/migrate     → Data migration tools
```

## Deployment
Do NOT deploy this folder.
The single deployment is the Next.js app (`apps/web`) on Vercel, which serves both the public site and the admin panel.
