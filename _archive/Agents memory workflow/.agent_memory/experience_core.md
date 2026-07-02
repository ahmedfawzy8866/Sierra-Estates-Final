# i:SIERRA 2027 — Experience Core

## Identity
- **Brand**: Sierra Estates (formerly Sierra Blu)
- **Codename**: i:Sierra 2027
- **Stack**: Next.js 16 (App Router) + Firebase/Firestore + Tailwind CSS v4 + Python backend
- **Markets**: New Cairo, Madinaty, El Shorouk
- **Deploy**: Vercel (frontend) + GitHub Actions (CI gate)

## Design Protocol — Quiet Luxury
- Aesthetic: Apple-style minimalism, editorial typography, cinematic feel
- Primary base: Deep Corporate Navy `#0A1628`
- CTA / Highlights / Logo: Signature Matte Gold `#C9A24D`
- Typography on dark: Soft Ivory `#F4F0E8`
- Fonts: Playfair Display (EN luxury), Cairo (AR modern), Inter (data/numbers)

## Copywriting Assets
- **Headline**: "The First Exclusive Destination for New Cairo Properties. Rent & Resale."
- **Tagline**: "Best-in-Class Design. AI-Driven Excellence."
- **About**: "We curate the finest opportunities across the New Cairo market. By combining advanced AI intelligence with an exclusive network of over 1,500 elite brokers and agencies across New Cairo, Madinaty, and El Shorouk, we deliver unmatched value tailored precisely to your needs. Smarter decisions, powered by intelligence."

## Business Logic — HARDCODED RULES
1. **Currency Threshold** (NON-NEGOTIABLE): Price < 10,000 → USD ($). Price >= 10,000 → EGP.
   - Example: 1600 = $1,600 | 23000 = 23,000 EGP
2. **SBR Code Pattern**: `[CompoundCode]-[Rooms][FurnishingCode]-[PriceCode]`
   - Example: MIV-3F-1.6K = Mivida, 3BR, Furnished, $1,600
3. **Master Coordinates**: Mivida: 30.0104, 31.5165 | Eastown: 30.0152, 31.4984
4. **Value Hunter**: Price <= 70% of compound mean → tag "High Value" gold badge

## Concierge — Laila AI
- Public: Floating chat, sophisticated Levant/Lebanese dialect
- Greeting: "يا مية أهلاً وسهلاً بك بنظام سييرا إستيتس الفاخر.. معك ليلى، كيف بقدر أخدمك اليوم بخصوص عقارات القاهرة الجديدة؟"
- Admin `/admin`: Zero-temperature deterministic search engine across 25,000+ records

## Architecture Layers
```
app/                  → Next.js App Router pages
components/           → UI modules (React + TypeScript)
backend-integration/  → Python configs, API clients, Firestore sync
lib/                  → Shared utilities, types, services
public/               → Static assets, logos
.agent_memory/        → Project rules, memory state
.antigravity/         → Skill bridge modules
.github/workflows/    → CI/CD gates
```

## CRM Pipeline (10-Stage)
S1: Intake → S2: Qualification → S3: Matching → S4: Proposal →
S5: Viewing → S6: Negotiation → S7: Offer → S8: Contract →
S9: Payment → S10: Closing

## Integration Rules
1. No heavy map APIs in client components — lightweight vector overlays only
2. Glassmorphic UI — backdrop-blur, translucent panels, subtle borders
3. TypeScript strict — no `any` types
4. All images through next/image with explicit dimensions
5. Framer Motion for interactive animations only
6. Every commit must pass `next build`
7. API keys in .env only — NEVER in source files
