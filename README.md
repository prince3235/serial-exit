# Serial Exit — marketing site

Verified off-market deal origination for India. Single-page Next.js 16 (App Router) site with a cinematic
dark/amber design, scroll-driven storytelling, a lightweight WebGL depth layer, a bilingual (EN/हिन्दी) UI,
a server-gated Partner Portal and a contact form backed by Firestore.

* **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Lenis · three.js (lazy) · Firestore
* **Deploy:** Vercel (GitHub CI/CD) or Firebase Hosting + Cloud Run. See **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**.

## Quick start

```bash
npm install
cp .env.example .env.local   # everything is optional
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build (standalone) / run it |
| `npm run lint` · `npm run typecheck` | ESLint (hooks rules ON) · TypeScript |
| `npm run test:e2e` | Playwright (needs `npx playwright install chromium`) |
| `npm run deploy` | Cloud Build → Cloud Run → Firebase Hosting |
| `node scripts/optimize-hero.mjs` | Regenerate pre-built AVIF/WebP hero variants after changing the poster |
| `npm run check:assets` | Verify every referenced image exists with EXACT letter-case (Linux servers are case-sensitive) |

## Project layout

```
src/app/                 layout, page, error/not-found, sitemap, robots, manifest, OG image, API routes
  api/contact            validated enquiry → Firestore (+ optional Resend email)
  api/portal             server-side access-key check + signed httpOnly session
src/components/serial-exit/   page sections (hero, process, partners, …)
src/components/providers/     motion config, smooth scroll, analytics, service worker
src/components/ui/            ambient effects (grain, cursor ring, spotlight, scroll progress)
src/content/site.ts      all page copy & structured content   ← edit text here
src/content/portal-cases.ts   server-only portal data
src/i18n/                EN/HI dictionaries
src/lib/                 site config, Firestore client, rate limiter, request helpers, portal session
scripts/                 postbuild, hero image optimizer, asset check, deploy.sh
e2e/                     Playwright E2E tests (home, contact, mobile)
docs/                    architecture guide, deployment runbook, changelog, owner launch checklist
```

## Design & performance notes

* **Compositor-only motion.** Continuous and hover animations use `transform`/`opacity` only (glow/edge effects are
  pseudo-elements that fade in). No `backdrop-filter` or blend modes on scrolling layers.
* **Hero.** The photographic poster is the LCP element, served from pre-built AVIF/WebP (no runtime encode). On capable
  desktops a transparent three.js layer (obsidian shards + amber dust, pointer parallax) loads at idle; it pauses when
  off-screen or the tab is hidden, caps DPR at 1.5, self-downgrades on slow frames and falls back on context loss.
  Phones, touch devices, low-end machines and `prefers-reduced-motion` users get the poster only.
* **Photo sections.** Hero, Core Idea, Brass Seal (`src/content/media.ts`), and Principal Partners (`public/images/partners/`) use optimized AVIF/WebP assets. Run `npm run check:assets` after adding or swapping assets.
* **Wow layer.** Flashlight Vault (`vault-layer.tsx`), Deal Journey shard (inside `process.tsx`), wax-seal stamp (`brass-seal.tsx`), chapter rail (`chapter-rail.tsx`) and cursor labels (add `data-cursor="Word"` to any element). All loops pause off-screen and respect reduced motion.
* **Hero 3D reliability.** The WebGL layer never self-destructs on slow frames; it steps quality down (tiers 0-3, see `data-hero3d` on the container) and falls back to the poster only on WebGL context loss.
* **Entrance animation is CSS**, so it plays at first paint instead of waiting for hydration. There is no preloader.
* **Reduced motion** is honoured globally (`MotionConfig reducedMotion="user"` + CSS), and smooth scroll is disabled.
* **Accessibility.** Skip link is the first tab stop; modals trap focus and restore it; `aria-current` on nav; axe-core
  (WCAG 2.1 A/AA + best-practice) reports 0 violations at desktop and phone widths.
* **Security.** CSP, HSTS, frame-ancestors, nosniff, referrer & permissions policies (see `next.config.ts`); form
  endpoints check Origin, rate-limit and validate; IPs are stored hashed. Note the CSP allows inline scripts
  (required by Next's bootstrap without per-request nonces, which would disable CDN caching).

## Documentation

* **[docs/CODEBASE_GUIDE.md](./docs/CODEBASE_GUIDE.md)** — architecture, components, APIs & integrations
* **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Firebase Hosting + Cloud Run & env setup
* **[docs/OWNER_TODO.md](./docs/OWNER_TODO.md)** — pre-launch owner checklist & claims audit
* **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** — release history
