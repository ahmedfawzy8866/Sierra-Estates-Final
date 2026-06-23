# Design System: Sierra Estates 2027

## 1. Visual Theme & Atmosphere
A restrained, "Art Gallery Airy" (Density: 3) interface with confident asymmetric layouts (Variance: 6) and cinematic, fluid choreographies (Motion: 8). The atmosphere is sovereign and elite — resembling a private wealth management advisory crossed with a high-end architectural digest. It must feel highly curated, weightless, and spatially precise.

## 2. Color Palette & Roles
- **Canvas Alabaster** (`#F4F0E8`) — Primary background surface for light mode.
- **Deep Charcoal Ink** (`#071422`) — Primary text in light mode, primary background in dark mode. Absolutely no pure black (`#000000`).
- **Pure Surface** (`#FFFFFF`) — Card and container fill.
- **Muted Slate** (`rgba(7, 20, 34, 0.6)`) — Secondary text, descriptions, metadata in light mode.
- **Whisper Border** (`rgba(233, 193, 118, 0.18)`) — Card borders, 1px structural lines, and glassmorphism edges.
- **Sovereign Gold** (`#C9A84C`) — The single accent color for CTAs, active states, focus rings, and map markers. (Max 1 accent. Saturation < 80%. No AI purple/neon.)

## 3. Typography Rules
- **Display / Headlines:** `Editorial New` or `Instrument Serif` — Track-tight, controlled scale, weight-driven hierarchy. Used only for editorial and creative marketing sections. (Generic Garamond is banned).
- **Body:** `Satoshi` (EN) / `Cairo` (AR) — Relaxed leading (line-height 1.7), 65ch max-width.
- **Mono:** `Geist Mono` — For ROI metrics, metadata, timestamps, and high-density numbers.
- **Banned:** `Inter`, `Times New Roman`, `Georgia`, `Garamond`. Serif fonts are strictly banned in any dashboard/software UI sections.

## 4. Component Stylings
- **Buttons:** Flat, no neon outer glow. Tactile -1px translateY on active state. Sovereign Gold fill for primary, ghost/outline with Whisper Border for secondary.
- **Cards:** Generously rounded corners (1.5rem to 2.5rem). Diffused whisper shadow. Used only when elevation serves hierarchy. Apply glassmorphic backdrop-blur filters for depth.
- **Inputs:** Label above input, error text below. Focus ring in Sovereign Gold. No floating labels.
- **Loaders:** Skeletal shimmer matching exact layout dimensions. No generic circular spinners.
- **Empty States:** Composed, illustrated spatial compositions — not just "No data" text.

## 5. Layout Principles
- **Grid-first Architecture:** CSS Grid over Flexbox math. Never use `calc()` percentage hacks.
- **Hero Sections:** Asymmetric splits or left-aligned. Centered Hero sections are strictly BANNED.
- **Spatial Separation:** No overlapping elements — every element occupies its own clear spatial zone. No absolute-positioned content stacking unless for background textures.
- **Feature Rows:** The generic "3 equal cards horizontally" is BANNED — use 2-column Zig-Zag, asymmetric grids, or horizontal scroll.
- **Responsive Collapse:** Strict single-column collapse below 768px. Horizontal overflow on mobile is a critical failure.
- **Containment:** Contain layouts using max-width constraints (e.g., 1400px centered).

## 6. Motion & Interaction
- **Physics:** Spring physics for all interactive elements (`stiffness: 100, damping: 20`). Premium, weighty feel. No linear easing.
- **Reveals:** Staggered cascade delays for waterfall reveals (100ms–350ms delays). Never mount lists instantly.
- **Perpetual Micro-Interactions:** Subtle, infinite loops on active components (e.g., shimmering markers, ultra-slow 20s background zoom).
- **Performance:** Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.

## 7. Anti-Patterns (Banned)
- **NO emojis anywhere.**
- **NO `Inter` font.**
- **NO generic serif fonts** (`Times New Roman`, `Georgia`, `Garamond`).
- **NO pure black** (`#000000`).
- **NO AI Purple/Blue Neon** glows or oversaturated accents.
- **NO excessive gradient text** on large headers.
- **NO custom mouse cursors.**
- **NO overlapping text** on images.
- **NO 3-column equal card layouts.**
- **NO generic names** ("John Doe", "Acme").
- **NO fake round numbers** (`99.99%`, `50%`).
- **NO AI copywriting clichés** ("Elevate", "Seamless", "Unleash", "Next-Gen").
- **NO filler UI text** ("Scroll to explore", "Swipe down", scroll arrows).
- **NO broken Unsplash links** — use high-end architecture assets or `picsum.photos`.
