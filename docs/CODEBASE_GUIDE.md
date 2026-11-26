# CODEBASE GUIDE

---

## 1. Project Overview

- **Project introduction:** `serial-exit` (v2.0.0) is the web application and automated enquiry/communication backend for **Serial Exit** (`Founded: 2026`, India).
- **Project purpose:** A verified off-market deal origination platform landing page paired with a server-gated Partner Portal, Firestore lead capture engine, email/WhatsApp automation, Google Sheets sync, and `.xlsx` export.
- **Business objective:** Connect M&A advisors, investment firms, strategic acquirers, and business owners with confidential, verified off-market business opportunities (Business Sales, Acquisitions, Growth Capital, Debt Financing, Strategic Partnerships) before those opportunities become public.
- **Target audience:**
  - Primary Partners: M&A Advisory Firms, Investment Banks, Private Equity Firms, Venture Capital Firms, Search Funds, Family Offices, Strategic Acquirers.
  - Secondary Audience: Business owners exploring a transaction.
- **Website use case:** Single-page institutional marketing site showcasing deal origination scope and workflow, paired with an enquiry capture pipeline (`/api/contact`), official Meta WhatsApp Cloud API webhook (`/api/webhooks/whatsapp`), and an invitation-only Partner Portal (`PartnerPortal` + `ClientDashboard`) displaying illustrative deal mandates and live client lead management.

---

## 2. Technology Stack

- **Frontend technologies:** React (`^19.0.0`), TypeScript (`^5`, `strict: true`, `noImplicitAny: false`, target `ES2017`), Tailwind CSS (`^4`), PostCSS (`@tailwindcss/postcss: ^4`), HTML5, CSS3.
- **Frameworks:** Next.js (`^16.1.1`, installed `16.3.8`, App Router, Turbopack, `output: "standalone"`).
- **Libraries:**
  - UI & Icons: `lucide-react` (`^0.525.0`), `clsx` (`^2.1.1`), `tailwind-merge` (`^3.3.1`).
  - Motion & Smooth Scroll: `framer-motion` (`^12.23.2`), `lenis` (`^1.3.26`).
  - 3D Graphics: `three` (`^0.186.1`) with `RoomEnvironment` from `three/examples/jsm/environments/RoomEnvironment.js`.
  - Validation: `zod` (`^4.0.2`).
  - Data / Backend / Export: `@google-cloud/firestore` (`^9.3.1`), `exceljs` (`^4.4.0`), `server-only` (`^0.0.1`), `sharp` (`^0.35.5`).
  - Analytics: `posthog-js` (`^1.435.6`, dynamically loaded only when configured).
- **Dependencies:**
  - Runtime (`15` packages in `package.json`): `@google-cloud/firestore`, `clsx`, `exceljs`, `framer-motion`, `lenis`, `lucide-react`, `next`, `posthog-js`, `react`, `react-dom`, `server-only`, `sharp`, `tailwind-merge`, `three`, `zod`.
  - Dev (`10` packages in `package.json`): `@playwright/test` (`^1.63.0`), `@tailwindcss/postcss` (`^4`), `@types/node` (`^22`), `@types/react` (`^19`), `@types/react-dom` (`^19`), `@types/three` (`^0.186.0`), `eslint` (`^9`), `eslint-config-next` (`^16.1.1`), `tailwindcss` (`^4`), `typescript` (`^5`).
- **Build tools & QA:** Node.js (`>=20.9.0`), Next.js CLI (`next dev`, `next build`), `scripts/postbuild.mjs`, `scripts/check-assets.mjs`, `scripts/optimize-hero.mjs`, ESLint 9 (`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`), Playwright (`playwright.config.ts`).

---

## 3. Project Architecture

- **Overall architecture:** Monolithic Next.js 16 App Router application configured with `output: "standalone"`. Static marketing sections prerender at build time (`○ /`), while backend workflows (`POST /api/contact`, `/api/portal`, `/api/portal/leads`, `/api/portal/export`, `/api/webhooks/whatsapp`, `/api/automation/retry`, `/api/health`) execute as Node.js server route handlers (`runtime = "nodejs"`, `dynamic = "force-dynamic"`).
- **Application flow:**
  1. `RootLayout` injects JSON-LD structured data, self-hosted `woff2` font CSS variables, `AppProviders`, and ambient overlays (`Grain`, `CursorSpotlight`, `CustomCursor`, `Analytics`, `ServiceWorkerRegistrar`).
  2. `Home` renders static above-the-fold UI (`ScrollProgress`, `Navbar`, `BackToTop`, `ChapterRail`, `Hero`) and dynamically code-splits all below-the-fold sections (`CoreIdea`, `Opportunities`, `Process`, `Showcase`, `Contact`, `OurPartners`, `Footer`) plus `PartnerPortal` (`ssr: false`, mounted on open).
  3. Incoming enquiries enter via `/api/contact` (website form) or `/api/webhooks/whatsapp` (Meta webhook), are deduplicated/merged in Firestore (`leads`, `communications`, `automation_logs`), trigger Resend emails and Meta WhatsApp messages, sync to Google Sheets, and surface inside `ClientDashboard` behind the signed `__session` cookie gate.
- **Component architecture:**
  - `src/components/providers/`: Cross-cutting React context and browser lifecycle wrappers (`MotionConfig`, `I18nProvider`, `SmoothScrollProvider`, `Analytics`, `ServiceWorkerRegistrar`).
  - `src/components/ui/`: Non-section viewport chrome (`Grain`, `CursorSpotlight`, `CustomCursor`, `ScrollProgress`).
  - `src/components/serial-exit/`: Page sections, primitives (`SectionShell`, `SectionHeading`, `Eyebrow`, `GlassCard`, `Reveal`, `MaskReveal`, `Button`, `Magnetic`, `Picture`), decorative visualizers (`VaultLayer`, `BrassSeal`, `VerifiedSeal`, `Hero3D`), and the `PartnerPortal` / `ClientDashboard` overlay.
- **Data flow:**
  - Static copy & configuration: `src/content/site.ts`, `src/i18n/messages.ts`, `src/content/media.ts`, `src/lib/site.ts`.
  - Server-gated illustrative mandates: `src/content/portal-cases.ts` (`server-only`) → `GET/POST /api/portal` → `PartnerPortal`.
  - Live client lead pipeline:
    - Website `Contact` → `POST /api/contact` → `upsertLead` → `createCommunication` → `runLeadAutomation` (Resend + WhatsApp + Google Sheets) → Firestore (`leads`, `communications`, `automation_logs`, `enquiries`).
    - Meta Webhook → `POST /api/webhooks/whatsapp` (HMAC-SHA256 verified) → status update OR `upsertLead` + `runLeadAutomation`.
    - Portal Admin → `GET/PATCH/POST /api/portal/leads` & `GET /api/portal/export` & `POST /api/automation/retry`.

---

## 4. Project Directory Structure

```text
d:\serial-exit\
├── .github/workflows/ci.yml        # GitHub Actions CI (lint, typecheck, check:assets, build, smoke test)
├── docs/                           # Project documentation & pre-launch guides
│   ├── CHANGELOG.md                # Release changelog (v2.0.0–2.2.0)
│   ├── CODEBASE_GUIDE.md           # Full codebase architecture & component guide
│   ├── DEPLOYMENT.md               # Firebase Hosting + Cloud Run deployment runbook
│   └── OWNER_TODO.md               # Pre-launch owner checklist & factual claims audit
├── e2e/                            # Playwright end-to-end specs (desktop-chromium & mobile-chrome)
│   ├── contact.spec.ts
│   ├── home.spec.ts
│   └── mobile.spec.ts
├── firebase-public/                # Firebase Hosting public placeholder directory
├── public/                         # Static public assets served from "/"
│   ├── fonts/                      # 5 self-hosted WOFF2 font files
│   ├── icons/                      # 3 PWA icon PNGs (192x192, 512x512, maskable 512x512)
│   ├── images/
│   │   ├── core-idea/              # 12 responsive CoreIdea background variants (cube-{640..3840}.{avif,webp})
│   │   ├── hero/                   # 12 responsive hero poster variants (hero-{640,1024,1536,1920,2560,3840}.{avif,webp})
│   │   ├── opportunities/          # 4 responsive seal badge assets (seal-{320,640}.{avif,webp})
│   │   ├── partners/               # 2 principal partner portrait WebPs (brijesh-patel.webp, sunil-sen.webp, 512x512)
│   │   ├── glowing-cube.webp       # 3840x2160 4K master source for CoreIdea
│   │   ├── grain.png               # 160x160 film grain tile
│   │   ├── hero-monolith.webp      # 3840x2160 4K master source for hero poster optimization
│   │   └── logo-white.png          # Brand header/footer wordmark PNG
│   └── sw.js                       # Minimal offline/static cache Service Worker (`se-v4`)
├── scripts/
│   ├── check-assets.mjs            # Case-sensitive static asset existence verifier
│   ├── deploy.sh                   # Cloud Build → Cloud Run → Firebase Hosting bash deploy script
│   ├── optimize-hero.mjs           # Generates hero-{w}.{avif,webp} and cube-{w}.{avif,webp} using sharp
│   └── postbuild.mjs               # Copies .next/static and public/ into .next/standalone
├── src/
│   ├── app/                        # Next.js App Router pages, metadata routes, global CSS, API handlers
│   │   ├── api/
│   │   │   ├── automation/retry/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── portal/export/route.ts
│   │   │   ├── portal/leads/route.ts
│   │   │   ├── portal/route.ts
│   │   │   └── webhooks/whatsapp/route.ts
│   │   ├── apple-icon.png
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── icon.png
│   │   ├── layout.tsx
│   │   ├── manifest.ts
│   │   ├── not-found.tsx
│   │   ├── opengraph-image.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── providers/              # Analytics, AppProviders, ServiceWorkerRegistrar, SmoothScrollProvider
│   │   ├── serial-exit/            # Page sections, Partner Portal, UI primitives
│   │   └── ui/                     # CursorSpotlight, CustomCursor, Grain, ScrollProgress
│   ├── content/                    # media.ts, portal-cases.ts (server-only), site.ts
│   ├── hooks/                      # use-focus-trap.ts, use-in-view.ts
│   ├── i18n/                       # messages.ts (en/hi), provider.tsx
│   └── lib/
│       ├── comms/                  # orchestrator.ts, partners.ts, phone.ts, resend.ts, store.ts, types.ts, whatsapp.ts
│       ├── integrations/           # excel-export.ts, google-sheets.ts
│       ├── firestore.ts            # Lazy Firestore singleton supporting ADC, emulator, and SA env vars
│       ├── portal-session.ts       # HMAC-SHA256 stateless cookie session helpers
│       ├── rate-limit.ts           # In-memory sliding-window rate limiter
│       ├── request.ts              # clientIp, hashIp, isSameOrigin CSRF helper
│       ├── scroll-range.ts         # safeRange monotonic clamping for Framer Motion transforms
│       ├── site.ts                 # Canonical SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, THEME_COLOR
│       └── utils.ts                # cn() class merging helper (clsx + tailwind-merge)
├── .env.example                    # Template listing all environment variables
├── .firebaserc                     # Firebase project alias (currently placeholder YOUR_FIREBASE_PROJECT_ID)
├── AGENTS.md                       # Next.js agent rules block
├── cloudbuild.yaml                 # Google Cloud Build Docker pipeline
├── Dockerfile                      # 3-stage Node 22 standalone production container
├── eslint.config.mjs               # ESLint configuration
├── firebase.json                   # Firebase Hosting Cloud Run rewrite + Firestore rules config
├── firestore.rules                 # Denies all client-side Firestore reads/writes
├── next.config.ts                  # Standalone output, CSP, HSTS, caching headers, image config
├── package.json                    # Project manifest, scripts, and dependencies
├── playwright.config.ts            # Desktop Chrome & Mobile Chrome (Pixel 7) E2E configuration
├── postcss.config.mjs              # Tailwind CSS v4 PostCSS plugin config
├── README.md                       # Repository overview
└── tsconfig.json                   # TypeScript configuration
```

- **Folder responsibilities:**
  - `src/app/`: Routing, root layout, SEO metadata generation, error boundaries, styles, and server API route handlers.
  - `src/components/`: UI presentation grouped into providers, ambient overlays, and domain sections/dialogs.
  - `src/content/`: Editable copy (`site.ts`), media manifests (`media.ts`), and server-only portal mandates (`portal-cases.ts`).
  - `src/i18n/`: Bilingual (`en` / `hi`) dictionary and React context provider.
  - `src/hooks/`: Reusable browser DOM hooks (`useFocusTrap`, `useInView`).
  - `src/lib/`: Core infrastructure, Firestore access, communication engines, external API clients, and security helpers.
  - `scripts/`: Asset verification, hero image variant generation, build post-processing, and deployment automation.

---

## 5. Application Entry Points

- **Main entry file & root component:** `src/app/layout.tsx` (`RootLayout`) wraps the entire application with `<html lang="en" className="dark">`, injects JSON-LD structured data, loads local `woff2` font CSS variables (`--font-sans-tight`, `--font-mono-display`, `--font-serif-italic`), renders skip link (`#main`), and mounts `AppProviders` along with `Grain`, `CursorSpotlight`, `CustomCursor`, `Analytics`, and `ServiceWorkerRegistrar`.
- **Primary route entry point:** `src/app/page.tsx` (`Home`) exports the `"use client"` homepage component rendering `ScrollProgress`, `Navbar`, `BackToTop`, `ChapterRail`, `<main id="main">`, `<Footer>`, and conditional `{portalOpen && <PartnerPortal />}`.
- **Application initialization:**
  - `AppProviders` initializes `MotionConfig reducedMotion="user"`, `I18nProvider` (hydrating locale preference `"en" | "hi"` from `localStorage` key `"se-locale"` via `requestAnimationFrame`), and `SmoothScrollProvider` (initializing `Lenis` unless `prefers-reduced-motion: reduce`, plus global `a[href^="#"]` smooth-scroll + focus management).
  - `ServiceWorkerRegistrar` registers `/sw.js` in production when `"serviceWorker" in navigator`.
  - `Analytics` lazily imports `posthog-js` on `requestIdleCallback` only if `NEXT_PUBLIC_POSTHOG_KEY` is defined.
  - `Hero3D` checks media/hardware gates and dynamically imports `hero-3d-scene.ts` via `requestIdleCallback` (100ms timeout) / `setTimeout` (50ms).

---

## 6. Pages & Routes

### Page & Metadata Routes

| Route | Source File | Rendering | Responsibility |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Static (`○`) | Single-page marketing site containing all 8 visual bands + Footer + Partner Portal modal |
| `/_not-found` | `src/app/not-found.tsx` | Static (`○`) | 404 fallback page (`noindex`) |
| `Error` boundary | `src/app/error.tsx` | Client boundary | Route-level error recovery screen |
| `GlobalError` | `src/app/global-error.tsx` | Client boundary | Root layout fatal error fallback |
| `/manifest.webmanifest` | `src/app/manifest.ts` | Static (`○`) | Web app manifest (`standalone`, dark theme `#050505`) |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Static (`○`) | Edge/Satori generated `1200×630` PNG OG card |
| `/robots.txt` | `src/app/robots.ts` | Static (`○`) | Allows `/`, disallows `/api/`, references `/sitemap.xml` |
| `/sitemap.xml` | `src/app/sitemap.ts` | Static (`○`) | Single canonical URL entry (`SITE_URL`) |

### API Routes (`runtime = "nodejs"`, `dynamic = "force-dynamic"`)

| Route | Methods | Auth / Security | Responsibility |
|---|---|---|---|
| `/api/health` | `GET` | Public (`no-store`) | Returns `{ status: "ok", service: "serial-exit", time }` |
| `/api/contact` | `POST` | Same-origin, rate limit (`5 / 10min / IP`), Zod, honeypot | Captures website enquiry, runs automated Resend/WhatsApp/Sheets pipeline |
| `/api/portal` | `GET`, `POST`, `DELETE` | `PORTAL_ACCESS_KEY` (`timingSafeEqual`), HMAC `__session` cookie (`8h`, path `/api`), rate limit (`8 / 10min / IP`) | Unlocks Partner Portal and serves `portalCases` |
| `/api/portal/leads` | `GET`, `PATCH`, `POST` | Signed `__session` cookie + `isSameOrigin` on writes | Lists leads/comms/logs, updates status, sends replies, triggers retries or Sheets sync |
| `/api/portal/export` | `GET` | Signed `__session` cookie | Streams 3-sheet `.xlsx` export generated via `exceljs` |
| `/api/webhooks/whatsapp` | `GET`, `POST` | Meta `hub.verify_token` challenge (`GET`); `X-Hub-Signature-256` HMAC-SHA256 (`POST`) | Receives Meta WhatsApp delivery statuses and inbound client WhatsApp messages |
| `/api/automation/retry` | `GET`, `POST` | Signed `__session` cookie OR `Authorization: Bearer <CRON_SECRET>` | Runs `processDueRetries()` batch for failed outbound comms |

### Homepage Navigation & Anchor Flow
- Top Navbar (`nav.links`): `#core-idea` ("Platform"), `#process` ("How It Works"), `#showcase` ("Opportunities"), CTA `#contact` ("Partner With Us").
- Scroll Order on `/`: `Hero` (`#top`) → `CoreIdea` (`#core-idea`) → `Opportunities` (`#opportunities`) → `Process` (`#process`) → `Showcase` (`#showcase`) → `Contact` (`#contact`) → `OurPartners` (`#our-partners`) → `Footer`.
- Right-edge `ChapterRail` (`xl+`): Links `#top`, `#core-idea`, `#opportunities`, `#process`, `#showcase`, `#contact`, `#our-partners`.

---

## 7. Component Documentation

### Layout & Section Wrappers
- `SectionShell` (`src/components/serial-exit/section-shell.tsx`): Consistent vertical rhythm (`py-20` to `xl:py-48`), horizontal padding (`px-5 sm:px-8 lg:px-12`), `max-w-[1440px]` wrapper (unless `bleed`), `se-section-lazy` (`content-visibility: auto` when `lazy=true`), and `.se-ornament` brass diamond when `className` includes `border-t`.
- `SectionHeading` (`src/components/serial-exit/section-heading.tsx`): Renders `Eyebrow`, balanced `<h2>`, and optional intro paragraph inside `Reveal`.

### Core Section Components (`src/components/serial-exit/`)
- `Navbar` (`navbar.tsx`): Fixed top header with IntersectionObserver scroll-spy, frosted backdrop fade on scroll (`y > 24`), EN/HI language dropdown, Partner Portal trigger button, magnetic nav links, and full-screen focus-trapped mobile menu (`lg:hidden`).
- `Hero` (`hero.tsx`): Above-fold LCP `<picture>` poster (`AVIF` + `WebP`, `fetchPriority="high"`), CSS entrance animations (`.se-rise`, `.se-mask-up`, `.se-fade`), 9 deterministic `.se-ember` particles, scroll parallax (`useScroll`/`useTransform`), and layered `Hero3D`.
- `Hero3D` (`hero-3d.tsx`) & `createHeroScene` (`hero-3d-scene.ts`): Dynamically imported Three.js transparent canvas (`22` instanced icosahedron shards + `260` `Points` dust motes + `RoomEnvironment` PMREM lighting) with viewport/hardware gating (`≥ 900px`, `any-pointer: fine`, `> 2` cores, `> 2GB` memory), `IntersectionObserver` pause, `visibilitychange` pause, and 4-tier quality degradation (`tier-0` → `tier-3` 30fps cap) without self-destruction.
- `CoreIdea` (`core-idea.tsx`): Full-bleed pre-built `<picture>` (`cube-{640..3840}.{avif,webp}`, `loading="lazy"`) with scroll zoom, word-by-word scroll illumination (`Word` spans animating opacity `[0.2, 1]`), and `VaultLayer` cursor-illuminated redaction backdrop.
- `Opportunities` (`opportunities.tsx`): 5 `GlassCard` items (card 1 spanning `lg:col-span-4`, cards 2–5 `lg:col-span-2`).
- `Process` (`process.tsx`): Desktop pinned `PinnedSequence` (`height: 5 * 92vh`, `useSpring` scrubbed rail, SVG `JourneyShard` evolving across 5 layers, sequential text cross-fade) and `< lg` `VerticalStepper`.
- `Showcase` (`showcase.tsx`): Clean 2×2 `GlassCard` grid (`md:grid-cols-2`) displaying the 4 illustrative verified off-market deal sheets (`VerifiedSeal`, sector, deal size, location, transaction type, and verified status) without a side image panel.
- `Contact` (`contact.tsx`): Two-tab form (`partner` / `owner`), instant tab switching, dynamic `roleOptions`, client validation, honeypot (`website`), optional `whatsappConsent` checkbox, `POST /api/contact` integration, and `BrassSeal` stamp confirmation state.
- `OurPartners` (`our-partners.tsx`): Compact 2-card side-by-side partner profile grid (`#our-partners`) with circular avatar/logo frame (`photo` or `initials` fallback), name, designation, optional firm, short description, and `glass-dark glass-dark-hover` hover animations.
- `Footer` (`footer.tsx`): Logo, localized descriptor, `Platform` & `Engage` navigation links, Portal trigger, placeholder email/phone/LinkedIn links, legal disclaimer, and copyright.
- `PartnerPortal` (`partner-portal.tsx`): Focus-trapped modal dialog (`useFocusTrap`) with server access-key unlock form and two authenticated views: `ClientDashboard` (`client-dashboard.tsx`) and 4 illustrative mandate cards (`portalCases`).
- `ClientDashboard` (`client-dashboard.tsx`): Master-detail CRM view with integration status pills, KPI summary, search & status/source filters, lead status updater (`PATCH /api/portal/leads`), direct Resend Email & Meta WhatsApp reply composer, chronological Communication Log & Automation Logs tabs, per-message retry and batch retry triggers, Google Sheets manual sync button, and `.xlsx` download link.
- `ChapterRail` (`chapter-rail.tsx`) & `BackToTop` (`back-to-top.tsx`): Right-edge desktop scroll indicator (`xl+`) and bottom-right scroll-to-top button (`scrollY > 1.1 * innerHeight`).

### Shared UI & Ambient Primitives
- `Button` (`button.tsx`), `GlassCard` (`glass-card.tsx`), `Eyebrow` (`eyebrow.tsx`), `Reveal` / `MaskReveal` (`reveal.tsx`), `Magnetic` (`magnetic.tsx`), `Picture` (`picture.tsx`), `VaultLayer` (`vault-layer.tsx`), `BrassSeal` (`brass-seal.tsx`), `VerifiedSeal` (`verified-seal.tsx`).
- `Grain` (`src/components/ui/grain.tsx`), `CursorSpotlight` (`src/components/ui/cursor-spotlight.tsx`), `CustomCursor` (`src/components/ui/custom-cursor.tsx`), `ScrollProgress` (`src/components/ui/scroll-progress.tsx`).

---

## 8. Styling & UI System

- **CSS architecture:** Tailwind CSS v4 (`@import "tailwindcss";`, `@custom-variant dark (&:is(.dark *));`) via `@tailwindcss/postcss`, configured inline in `src/app/globals.css` with custom utility classes and keyframes enforcing compositor-only (`transform` / `opacity`) animations.
- **Global styles (`src/app/globals.css`):**
  - Base resets: `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`, `overflow-x: clip`, custom dark scrollbar (`10px`), focus-visible ring (`2px solid #ff7a1a`).
  - Utilities: `.font-mono-display`, `.font-serif-italic`, `.eyebrow`, `.text-amber-gradient`, `.glass-dark`, `.glass-blur`, `.glass-dark-hover`, `.bg-hairline-grid`, `.mask-line`, `.se-ornament`, `.se-section-lazy` (`content-visibility: auto; contain-intrinsic-size: 0 600px;`), `.se-grain`, `.se-spotlight`, `.se-cursor-ring`, `.se-skip`.
  - Reduced motion (`@media (prefers-reduced-motion: reduce)`): collapses animation/transition durations to `0.01ms`, hides ambient cursor/grain/ember layers, stops loops.
- **Fonts (`src/app/layout.tsx`, `public/fonts/`):**
  - `--font-sans-tight`: Inter Tight (`400`, `500`, `preload: true`, `display: "swap"`, fallback `system-ui, Arial`).
  - `--font-mono-display`: JetBrains Mono (`400`, `500`, `preload: false`, `display: "swap"`, fallback `ui-monospace, monospace`).
  - `--font-serif-italic`: Instrument Serif (`400 italic`, `display: "swap"`, fallback `Georgia, serif`).
- **Colors & Theme Tokens (`src/app/globals.css`):**
  - `--background`: `#050505`, `--foreground`: `#f4f1ec`, `--card`: `#111112`, `--muted`: `#0b0b0c`, `--muted-foreground`: `#a8a29a`, `--border`: `rgba(255, 255, 255, 0.08)`, `--ring`: `#ff7a1a`.
  - Brand-bound amber & brass scale: `--color-brass` (`#d9a65a`), `--color-amber-200` (`#ffd2a8`), `--color-amber-300` (`#ffb37a`), `--color-amber-400` (`#ff9a4d`), `--color-amber-500` (`#ff7a1a`), `--color-amber-600` (`#e0620a`), `--color-amber-700` (`#b85a14`).
  - Border radii: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 6px`, `--radius-xl: 8px`.
  - Custom easing token: `--ease-out-expo` / `--ease-lux`: `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 9. Assets & Media

- **Images (`public/images/`):**
  - `public/images/hero-monolith.webp` (`3840×2160` 4K WebP master) + generated variants in `public/images/hero/hero-{640,1024,1536,1920,2560,3840}.{avif,webp}` (`17 KB–268 KB`).
  - `public/images/glowing-cube.webp` (`3840×2160` 4K WebP master) + generated variants in `public/images/core-idea/cube-{640,1024,1536,1920,2560,3840}.{avif,webp}` (`13 KB–190 KB`) — rendered in `CoreIdea`.
  - `public/images/opportunities/` (defined in `src/content/media.ts` `OPPORTUNITY_MEDIA`):
    - `seal-{320,640}.{avif,webp}` (max `640×640`, alpha — used by `BrassSeal`).
  - `public/images/logo-white.png` (`760×304` PNG alpha, `29,986` bytes).
  - `public/images/grain.png` (`160×160` PNG alpha noise tile, `19,523` bytes).
- **Icons (`public/` & `src/app/`):**
  - `src/app/favicon.ico` (`3,001` bytes), `src/app/icon.png` (`512×512`), `src/app/apple-icon.png` (`180×180`), `public/icons/icon-192.png` (`192×192`), `public/icons/icon-512.png` (`512×512`), `public/icons/icon-maskable-512.png` (`512×512`).
- **Fonts (`public/fonts/`):**
  - `inter-tight-400.woff2`, `inter-tight-500.woff2`, `jetbrains-mono-400.woff2`, `jetbrains-mono-500.woff2`, `instrument-serif-400i.woff2`.
- **Videos:** None present in the codebase.
- **Static assets:** `public/sw.js` (Service Worker caching static `/_next/static/`, `/fonts/`, `/images/`, `/icons/` and offline navigation fallback for `/`).

---

## 10. Functionalities

- **Forms:**
  - Website Contact Form (`Contact`): Dual-tab enquiry form (`I'm a Partner` / `I'm a Business Owner`), dynamic `Role / Type` options, required validation (`name`, `company`, valid `email`, `role`, `message >= 12 chars`), optional `phone` (normalized to E.164 in backend), optional `whatsappConsent` checkbox, hidden `website` honeypot field, server validation returning field-level `422` errors.
  - Partner Portal Login Form (`PartnerPortal`): Access-key password input validated server-side via `POST /api/portal`.
  - Partner Portal Reply Form (`ClientDashboard`): Channel switcher (`Email` / `WhatsApp`) respecting email availability and Meta WhatsApp consent / 24h policy.
- **Buttons & Controls:** `Button` component (`solid` / `ghost` / `link`), `BackToTop`, `Navbar` EN/HI locale toggle, Showcase deal selector cards, Partner Portal tab switcher (`CLIENT MANAGEMENT` / `Illustrative Case Studies`), `.xlsx` download button, `SYNC SHEETS`, `RETRY FAILED`, per-message `RETRY`, status `<select>`.
- **Navigation:** Smooth scrolling via `Lenis` (`lerp: 0.1`, `-64px` offset except `#top`) with automatic focus transfer; desktop sticky `IntersectionObserver` scroll-spy; `ChapterRail` (`xl+`); focus-trapped mobile slide-in overlay menu.
- **Interactive elements:** `VaultLayer` cursor/drift spotlight mask, `Magnetic` button displacement, custom cursor ring with `data-cursor` dynamic pill labels, keyboard focus trap (`useFocusTrap`).
- **Animations:**
  - CSS keyframe animations (`se-rise`, `se-mask-up`, `se-fade`, `se-ember`, `se-stamp`, `se-shine`, `se-scroll-dot`, CTA shine sweep).
  - Scroll-linked Framer Motion (`useScroll` + `useTransform` + `useSpring` + `safeRange`) in `Hero`, `CoreIdea`, `Process`, `ScrollProgress`.
  - Three.js animated orbital shard field and amber dust cloud in `hero-3d-scene.ts`.
- **External & Automated Integrations:** Lead deduplication, Resend welcome/partner/reply emails, Meta WhatsApp Cloud API webhook + templates + session replies, Google Sheets 3-tab upsert sync, Excel `.xlsx` generation, scheduled/manual delivery retry processing.

---

## 11. Third-Party Integrations

- **Resend API (`https://api.resend.com/emails`):** Implemented via `fetch` in `src/lib/comms/resend.ts` (client welcome email, dual partner alerts, portal reply email). Requires `RESEND_API_KEY` and verified `CONTACT_FROM_EMAIL`.
- **Meta WhatsApp Cloud API (`https://graph.facebook.com/v21.0/{phoneNumberId}/messages`):** Implemented in `src/lib/comms/whatsapp.ts` and `src/app/api/webhooks/whatsapp/route.ts`. Supports `GET` webhook challenge, `POST` `X-Hub-Signature-256` verification, inbound message capture, status callbacks (`sent`/`delivered`/`read`/`failed`), approved template messaging, and 24-hour customer-window session replies.
- **Google Cloud Firestore (`@google-cloud/firestore`):** Implemented in `src/lib/firestore.ts` and `src/lib/comms/store.ts` using collections `leads`, `communications`, `automation_logs`, and `enquiries`. `firestore.rules` blocks all direct client access.
- **Google Sheets API v4 (`https://sheets.googleapis.com/v4/spreadsheets` + `https://oauth2.googleapis.com/token`):** Implemented in `src/lib/integrations/google-sheets.ts` using RS256 JWT assertion signed with `node:crypto`. Upserts rows across tabs `Leads`, `Communication Log`, and `Automation Logs`.
- **Analytics (`posthog-js`):** Loaded lazily in `src/components/providers/analytics.tsx` with `persistence: "memory"`, `respect_dnt: true`, `autocapture: false`, `disable_session_recording: true`, `ip: false` only when `NEXT_PUBLIC_POSTHOG_KEY` is provided.
- **Advertising integrations:** None present in the codebase.

---

## 12. Configuration & Environment

### Environment Variables (`.env.example`)
- **Site & Build-Time:**
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
  - `NEXT_PUBLIC_DISABLE_3D` (`"1"` disables WebGL layer)
- **Authentication & Security:**
  - `PORTAL_ACCESS_KEY`
  - `CRON_SECRET`
  - `IP_HASH_SALT`
- **Firestore:**
  - `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (or `GOOGLE_SERVICE_ACCOUNT_JSON`)
  - `FIRESTORE_DATABASE_ID`, `FIRESTORE_EMULATOR_HOST`, `GOOGLE_APPLICATION_CREDENTIALS`
- **Resend & Partner Alerts:**
  - `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_NOTIFY_EMAIL`
  - `PARTNER_1_NAME`, `PARTNER_1_EMAIL`, `PARTNER_1_WHATSAPP`
  - `PARTNER_2_NAME`, `PARTNER_2_EMAIL`, `PARTNER_2_WHATSAPP`
- **Meta WhatsApp Cloud API:**
  - `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - `WHATSAPP_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
  - `WHATSAPP_TEMPLATE_WELCOME`, `WHATSAPP_TEMPLATE_PARTNER_ALERT`, `WHATSAPP_TEMPLATE_LANG`
- **Google Sheets:**
  - `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`

*(Note: At time of writing, only `.env.example` exists in the repository; no `.env.local` or secret values are committed.)*

### Key Configuration Files
- `next.config.ts`: `output: "standalone"`, `reactStrictMode: true`, `poweredByHeader: false`, `compress: true`, `images.formats: ["image/avif", "image/webp"]`, `deviceSizes: [640, 828, 1080, 1280, 1536, 1920, 2560]`, `minimumCacheTTL: 31536000`, CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CDN cache headers for `/`, immutable cache for `/(fonts|images|icons)/`, `no-store` for `/sw.js`.
- `tsconfig.json`: Strict TS, bundler resolution, path alias `@/*` → `./src/*`, excludes `e2e` and `playwright.config.ts`.
- `playwright.config.ts`: `testDir: "./e2e"`, `desktop-chromium` (`1440×900`, ignores `mobile.spec.ts`) and `mobile-chrome` (`Pixel 7`, matches `mobile.spec.ts`), auto-starts `npm start` if `E2E_PROD` is set else `npm run dev`.

---

## 13. SEO & Performance

- **Meta tags (`src/app/layout.tsx`, `src/lib/site.ts`):** `metadataBase`, default + template title (`Serial Exit — Verified Off-Market Deal Origination | India`), description, 10 keywords, Open Graph (`en_IN`, `website`), Twitter `summary_large_image`, robots (`index: true`, `follow: true`, `max-image-preview: large`), optional `verification.google`, JSON-LD `@graph` (`Organization` + `WebSite`), dynamic `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`.
- **Image optimization:** Hero poster uses pre-built AVIF/WebP `<picture srcSet>` (`scripts/optimize-hero.mjs`) with `fetchPriority="high"` to prevent runtime encoding delay on LCP. `Picture` renders AVIF + WebP `<source>` tags with `loading="lazy"` below fold and explicit `width`/`height` attributes to prevent CLS. `next/image` is enabled with `["image/avif", "image/webp"]`.
- **Loading performance:**
  - Dynamic imports (`next/dynamic`) code-split all 8 below-the-fold sections and `Footer` out of the initial JS chunk; `PartnerPortal` uses `ssr: false`.
  - Three.js (`hero-3d-scene.ts`) and PostHog (`analytics.tsx`) are dynamically imported on idle callbacks.
  - Off-screen sections use `.se-section-lazy` (`content-visibility: auto; contain-intrinsic-size: 0 600px;`).
  - Only primary font (`inter-tight`) sets `preload: true`.
  - Animations pause when off-screen (`[data-inview="false"] .se-loop`) or in hidden tabs.

---

## 14. Responsive Design

- **Breakpoints (Tailwind defaults):** `sm` (`640px`), `md` (`768px`), `lg` (`1024px`), `xl` (`1280px`), `2xl` (`1536px`), plus custom `hero-3d.tsx` media query `(min-width: 900px) and (any-pointer: fine)` and CSP/layout safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
- **Mobile layout (`< 640px / < 1024px`):** Single-column grids (`Opportunities`, `Showcase`, `OurPartners`, `Contact`, `Footer`), hamburger drawer (`mobile-menu`, `lg:hidden`), inline vertical `VerticalStepper` replacing sticky scroll `Process`, WebGL `Hero3D`, `CursorSpotlight`, `CustomCursor`, and `ChapterRail` disabled on coarse pointers / narrow viewports.
- **Tablet layout (`sm` / `md`, `640px–1023px`):** 2-column grids (`Opportunities`, `Showcase`, `OurPartners`), side-by-side form field pairs in `Contact`.
- **Desktop layout (`lg+ / xl+`, `1024px+`):** Full horizontal navbar (`lg:flex`), 80% right-feathered Hero poster + Three.js depth canvas, 6-column asymmetric `Opportunities` bento grid, pinned scroll-scrubbed `Process` timeline (`xl:block` `JourneyShard`), 2×2 `Showcase` verified deal grid, master-detail `ClientDashboard` (`lg:grid-cols-12`), and right-edge `ChapterRail` (`xl:block`).

---

## 15. Installation & Execution

- **Prerequisites:** Node.js `>=20.9.0`, npm. Optional for live cloud/Playwright execution: Playwright Chromium (`npx playwright install chromium`), Firebase/Google Cloud credentials, Resend/Meta/Google Sheets env vars in `.env.local`.
- **Installation commands:**
  ```bash
  npm install
  cp .env.example .env.local
  ```
- **Development server:**
  ```bash
  npm run dev        # http://localhost:3000
  ```
- **Checks & E2E tests:**
  ```bash
  npm run check:assets
  npm run typecheck
  npm run lint
  npm run test:e2e
  ```
- **Production build & run:**
  ```bash
  npm run build      # runs next build && node scripts/postbuild.mjs
  npm start          # node .next/standalone/server.js
  ```
  *(Windows note: locally invoking `npx next start -p 3000` avoids `@emnapi/runtime` missing-module errors observed under `.next/standalone` when `sharp-wasm32` optimizes `/_next/image` on Windows.)*

---

## 16. Deployment

- **Build process:** `npm run build` runs Next.js production compilation (`output: "standalone"`) and `scripts/postbuild.mjs` copies `.next/static` and `public` into `.next/standalone/`.
- **Hosting configurations present in repository:**
  1. **Vercel (connected via GitHub):** Configured via project link without a `vercel.json`; requires server-side env vars configured in Vercel Project Settings (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `PORTAL_ACCESS_KEY`, `RESEND_API_KEY`, etc.).
  2. **Firebase Hosting + Google Cloud Run (`firebase.json`, `Dockerfile`, `cloudbuild.yaml`, `scripts/deploy.sh`):** Containerized multi-stage Node 22 build listening on port `8080`, deployed in `asia-south1`, fronted by Firebase Hosting CDN rewrites (`"**"` → Cloud Run service `serial-exit`). `.firebaserc` currently retains placeholder `"YOUR_FIREBASE_PROJECT_ID"`.
- **CI Workflow (`.github/workflows/ci.yml`):** Runs on `push` and `pull_request` using Node 22 on `ubuntu-latest`: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run check:assets`, `npm run build`, boots standalone `npm start`, and smoke-tests `/api/health`, `/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`.

---

## 17. Code Dependencies & Relationships

- `src/app/layout.tsx` → `AppProviders` (`MotionConfig` → `I18nProvider` → `SmoothScrollProvider`) + `Grain`, `CursorSpotlight`, `CustomCursor`, `Analytics`, `ServiceWorkerRegistrar`.
- `src/app/page.tsx` → `Navbar` (receives `openPortal`), `Hero` (uses `Hero3D` → dynamic `./hero-3d-scene`), 6 dynamically imported sections (`CoreIdea` → `VaultLayer`; `Showcase` → `GlassCard`, `VerifiedSeal`; `Opportunities` → `GlassCard`; `Process` → `safeRange`; `Contact` → `BrassSeal`; `OurPartners`), `Footer`, and `PartnerPortal` (→ `ClientDashboard`, `useFocusTrap`).
- Server communication graph:
  - `src/app/api/contact/route.ts` & `src/app/api/webhooks/whatsapp/route.ts` → `store.ts` (`firestore.ts`, `phone.ts`) → `orchestrator.ts` → [`resend.ts`, `whatsapp.ts`, `partners.ts`, `google-sheets.ts`].
  - `src/app/api/portal/leads/route.ts` → `portal-session.ts` + `request.ts` + `store.ts` + `orchestrator.ts` + `google-sheets.ts`.
  - `src/app/api/portal/export/route.ts` → `portal-session.ts` + `store.ts` (`listAllForExport`) + `excel-export.ts` (`exceljs`).
  - `src/app/api/automation/retry/route.ts` → `portal-session.ts` + `orchestrator.ts` (`processDueRetries`).

---

## 18. Known Issues & Limitations

- **Illustrative / sample showcase data & Firebase config:**
  - `showcase.cards` in `src/content/site.ts` and `src/content/portal-cases.ts` hold illustrative sample mandates/deals (clearly labeled as illustrative).
  - `.firebaserc` holds `"YOUR_FIREBASE_PROJECT_ID"`.
- **Unconfigured secrets & partial i18n coverage:**
  - No `.env.local` exists in the repo; `PORTAL_ACCESS_KEY`, Firestore credentials, `RESEND_API_KEY`, Meta WhatsApp credentials, `GOOGLE_SHEETS_SPREADSHEET_ID`, partner recipients, and `CRON_SECRET` must be provisioned before live execution.
  - Several sections (`Contact`, `OurPartners`, `ClientDashboard`, and `Footer` links) consume English strings from `src/content/site.ts` directly rather than full `useI18n()` translation.
  - `Navbar` uses `nav.links` (`Platform`, `How It Works`, `Opportunities`), while `#our-partners` is linked via `ChapterRail` and `Footer`.
- **Standalone image optimization on Windows:** Running `npm start` (`node .next/standalone/server.js`) on Windows threw `Cannot find module '@emnapi/runtime'` inside `@img/sharp-wasm32` during local Playwright testing; Linux/Vercel/Docker or `npx next start` avoids this.
- **Other codebase items:**
  - Unused CSS animation utility `.animate-float` / `@keyframes se-float` and `.glass-blur` exist in `src/app/globals.css` with zero callers.
  - In-memory rate limiting (`src/lib/rate-limit.ts`, max `5000` keys) operates per Node.js instance, not globally across serverless instances.
  - `Process` `scrollTo` hash clicks and `OurPartners` anchor navigation work cleanly, while `verifyWebhookSignature` allows unsigned payloads ONLY when `NODE_ENV !== "production"` and `WHATSAPP_APP_SECRET` is unset.

---

## 19. Developer Guidelines

- **Coding conventions:**
  - Strict TypeScript (`strict: true`); use `@/*` path imports for `src/*`.
  - Motion rule (`src/app/globals.css`): Animate only `transform` and `opacity` continuously or on hover (avoid `backdrop-filter`, `box-shadow`, or layout property transitions). Run all Framer Motion scroll ranges through `safeRange()` (`src/lib/scroll-range.ts`).
  - Keep `src/content/portal-cases.ts` imported only in server files (`import "server-only"`). Never leak API keys or credentials to `"use client"` modules.
  - Respect `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + CSS rules).
- **File modification guidelines:**
  - Copy & partner profile data: update `src/content/site.ts` (and keep `src/i18n/messages.ts` in sync where localized, maintaining identical structural type between `en` and `hi`).
  - Media assets: maintain exact lowercase/exact-case filenames (`npm run check:assets` enforces case sensitivity for Linux CI/Cloud Run); regenerate hero & core-idea responsive sizes with `node scripts/optimize-hero.mjs` after updating `public/images/hero-monolith.webp` or `public/images/glowing-cube.webp`.
  - When updating CSP or adding external client hosts, edit `next.config.ts`. Server-only API calls (Resend, Meta Graph API, Google Sheets) do not require CSP changes.
- **Important verification workflow before committing/deploying:**
  ```bash
  npm run check:assets && npm run typecheck && npm run lint && npm run build
  ```
  Run `npx playwright test` to validate desktop (`1440×900`) and mobile (`Pixel 7`) behavior.
