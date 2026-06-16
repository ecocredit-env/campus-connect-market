# UltraOver cinematic redesign — plan

Your project already has most of the backend (Supabase auth, listings, interest requests, orders, profiles, user_roles, RLS, Razorpay), routes (`/`, `/browse`, `/listing/$id`, `/sell`, `/me`, `/profile`, `/login`, `/signup`, `/admin`, `/verify`), and a glass design system in `src/styles.css`. The spec you pasted is a **full design + IA rewrite** on top of that. Rather than rebuild from zero (which would throw away working auth, payments, RLS, and admin flows), I'll re-skin and extend.

## What I'll build

### 1. Design tokens (rewrite `src/styles.css`)
- Replace the Apple Mono palette with the exact OLED + emerald system: bg `#05050A`, surfaces `#0A0A12 / #0F0F1A / #141422`, accent `#00E87C`, glass `rgba(255,255,255,0.06)` + border `0.14`, text tiers `0.94 / 0.55 / 0.32`.
- Sora 600/700 display, Inter 300–600 body. Headline scale 68→48→28→20, `-0.03em`, line-height 1.05.
- Glass rule: `backdrop-filter: blur(32px) saturate(180%)`, inner highlight + `::before` top strip, radius 24 / 36 / 100px.
- Ambient orb keyframes, cursor glow class, ticker marquee, gradient-text utility (white→muted + emerald→cyan for highlighted word).

### 2. Homepage (`src/routes/index.tsx`) — full rebuild
Floating pill nav · hero with badge + tri-line headline + dual CTA + 3 stats · **3D parallax card stack** (Trek Marlin 5, Dell XPS 13, Symphony Diet 22i) with mouse-tracked perspective · cursor glow · live ticker · trust strip · how-it-works (3 cards, ghost numbers) · product showcase with inline SVG illustrations (cycle, laptop, **desert air cooler with airflow waves**) · campuses pill cloud (MNNIT live + 16 muted) · waitlist card · 3 testimonials · CTA block · 4-column footer.

### 3. Browse (`src/routes/browse.tsx`) — reskin + sidebar
Left sidebar filters: category, campus, dual-range price slider, condition toggles. 3-column masonry grid of `<ListingCard />` with new glass styling.

### 4. Listing detail (`src/routes/listing.$id.tsx`) — reskin
5-photo gallery (swipeable on mobile), seller card with **UltraScore arc gauge** (SVG), safe-zone list, similar listings rail. Keep existing Buy/Interest flow.

### 5. New shared components
`GlassCard`, `AmbientOrb`, `LiveTicker`, `CursorGlow`, `UltraScore`, `ProductVisualCycle/Laptop/Cooler` (inline SVG), `FloatingNav`, `BottomNav` (mobile).

### 6. New pages
`/terms`, `/privacy`, `/safety`, `/id-privacy` — real placeholder content, linked from footer.

### 7. Scroll motion
Framer Motion: `opacity 0 → 1`, `y: 32 → 0`, `duration 0.7`, `ease [0.4,0,0.2,1]`, stagger 0.1s. `framer-motion` is not yet installed — I'll add it.

### 8. Mobile
Bottom nav (Home · Browse · Sell+ · Messages · Profile), hero stacks, card stack hidden <768px, 44px tap targets, 16px min text.

## What I'm NOT doing this turn (and why)
- **Schema migration to spec.** Your current schema differs (`profiles` vs `users`, `interest_requests` vs `messages`, `orders` vs `trades`, no `reviews`/`waitlist`/`ultra_score`/`safe_zones`). Migrating would break admin, payments, and existing RLS. I'll surface `ultra_score` as a derived value (rating × transactions) for now, and add **only** a `waitlist` table — the rest of the spec maps to existing tables.
- **Three.js / R3F.** The spec says "Three.js OR R3F" but the card stack is described as CSS perspective + parallax — that's lighter, GPU-fine, and what I'll ship. Say the word if you want true WebGL.
- **Seeding 10 new listings.** You already have seed data. I'll only reseed if you confirm.
- **Re-doing `/signup`, `/sell`, `/me`, `/admin`.** They work. I'll reskin them to the new tokens but won't restructure flows unless you ask.
- **Removing Google/social auth.** You already moved to email-only — staying that way.

## Order of operations
1. Install `framer-motion`, add Sora to root `<head>`.
2. Rewrite `src/styles.css` tokens + utilities.
3. Build shared components (GlassCard, AmbientOrb, FloatingNav, BottomNav, LiveTicker, CursorGlow, UltraScore, 3 ProductVisual SVGs).
4. Rebuild homepage.
5. Reskin Browse + Listing detail + Header reuse.
6. Add `/terms`, `/privacy`, `/safety`, `/id-privacy`.
7. Migration: `waitlist` table + RLS + GRANTs.
8. Visual QA at 375 / 768 / 1440.

## Questions before I start
1. **Schema:** keep existing tables (recommended) or do you want me to migrate to the spec's `users/messages/trades/reviews` naming? Migration will require touching ~15 files and re-doing RLS.
2. **Card stack:** CSS-perspective parallax (as planned) or real R3F/Three.js?
3. **Seed data:** keep current listings or wipe & reseed with the 5 named items?
4. **Other pages** (`/sell`, `/me`, `/signup`, `/admin`, `/profile`): reskin to new tokens only, or full structural rebuild?

Answer those four and I'll execute end-to-end.