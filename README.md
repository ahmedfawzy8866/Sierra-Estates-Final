# Sf1 — Sierra Estates Frontend Designs

This repository holds every **Sierra Estates frontend UI design** as a separate Git branch.
Choose the design you want, check out its branch, and deploy directly to Vercel or any static host.

---

## Branch Map

| Branch | Design | Description | Status |
|--------|--------|-------------|--------|
| `main` | — | This README + branch index | Stable |
| `landing-2.6` | Sierra Estates 2.6 | Latest full landing page (recommended) | ⭐ Active |
| `landing-v1` | Sierra Blu v1 | First Sierra Blu landing | Available |
| `landing-v2` | Sierra Blu v2 | Enhanced version with search filters | Available |
| `landing-refined` | Landing Refined | Clean luxury minimal version | Available |
| `hero-section` | Hero Only | Standalone hero section for A/B testing | Available |
| `portal-v3` | Portal v3 | Property portal — version 3 | Available |
| `portal-v4` | Portal v4 | Property portal — version 4 | Available |
| `premium-landing` | Premium Dark | Ultra-premium dark luxury version | Available |
| `admin-ui` | Admin Dashboard | Admin dashboard UI shell (no logic) | Available |
| `mobile-ar` | Arabic Mobile Dark | RTL Arabic mobile dark mode | Available |
| `mobile-en` | English Mobile Dark | English mobile dark mode | Available |
| `nextjs-app` | Next.js App | Full React 19 / Next.js 16 app (UI only) | Available |

---

## How to Use a Design

```bash
# Check out any branch to preview or deploy that design
git checkout landing-2.6

# Preview locally (static HTML branches)
npx serve .

# Preview locally (Next.js branches)
pnpm install && pnpm dev
```

---

## Deployment

Each branch can be deployed independently to **Vercel**:

1. Go to [vercel.com](https://vercel.com) → Import Project → select this repo
2. Choose the branch you want to deploy
3. Vercel will auto-detect the framework (static or Next.js)
4. Every push to a branch creates a **Preview URL**

---

## Architecture

This repo contains **frontend only**. All backend logic (API routes, agents, workflows, Firebase)
lives in the companion repo: **[Sierra-Estates-Final](https://github.com/ahmedfawzy8866/Sierra-Estates-Final)**

The frontend connects to the backend via REST API endpoints (`/api/*`).

---

## Brand

**Sierra Estates** — Quiet Luxury Real Estate Platform
- Colors: Navy `#0A1628` · Gold `#C9A84C` · Ivory `#F5F0E8`
- Typography: Playfair Display (headings) · Inter (body)
- Design language: Glassmorphism, cinematic parallax, dark luxury
