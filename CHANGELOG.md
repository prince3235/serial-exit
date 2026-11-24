# Changelog

## 2.2.0: wow layer + client-facing cleanup

### Added
* **Flashlight Vault** (Core Idea): faint "classified" deal lines sit behind the statement; a cursor lens lights them in amber. Compositor-only (lens + counter-translated copy), drifts on its own on touch, static under reduced motion.
* **Deal Journey shard** (How It Works, xl+): one obsidian shard evolves across the five steps (scatter, outline + verify ring, facets + amber edge-light, second shard + dashed link, joined + glow). Pure SVG, opacity-driven by scroll.
* **"Received" wax-seal stamp** on the contact form success state (shared `BrassSeal`, also used by Opportunities).
* **Chapter rail** (xl+): editorial 01-09 index on the right edge, real links, label on hover/keyboard focus, amber tick for the current chapter.
* **Brass diamond ornaments** on section hairlines.
* **Contextual cursor labels** (`data-cursor="View|Open|Select|Go"`) on the cursor ring.

### Fixed
* **A developer note was visible to the public** in the contact section ("API-connected · SQLite-backed… stored via Prisma…"). Removed.
* Cursor-ring label no longer sticks after scrolling under a stationary pointer.
* Removed a pointless `backdrop-blur` from the contact card.

### Notes
* Partner "floating card" idea intentionally not built: it would compete with the photo stage.
* Cursor label words are English-only decorative strings.

## 2.1.0: photographic sections, smooth scrub, reliability

### Added
* **Opportunities**: layered photographic scene (desk photo, light rays, lamp glow, dossier card with real sharp text, brass seal that "stamps" on every deal change). All images are AVIF/WebP via `src/content/media.ts`.
* **Partners**: photographic stage that crossfades with the hovered/focused/tapped row (desktop); each active row shows its own photo inline on phones. Photos mount lazily (only the active one first).
* **Process (How It Works)**: rewritten as a *continuous* scrub (spring-smoothed progress, sequential hand-over between steps, gliding rail marker). Replaces the discrete step swap that felt steppy and misaligned the rail.
* Brass ornament colour (`--color-brass`), double-line image frames, CTA gold-shine sweep, balanced headings (`text-wrap`), motion tokens (`--ease-lux`).
* `npm run check:assets` (exact-case asset verification for Linux servers), `.gitattributes` (LF endings), GitHub Actions CI (build + boot smoke test on Ubuntu, zero env vars).

### Fixed
* **Hero 3D no longer disappears at random.** The FPS watchdog used to delete the scene permanently on a few slow frames. It now steps quality down (DPR, shard/dust count, 30fps cap) after a 3 s settle period and only disposes on unmount / WebGL context loss. Gate uses `any-pointer: fine` so touch laptops still get it.
* Contrast on Process rail numerals; looping animations now pause when their section is off-screen.
* Lenis uses `lerp: 0.1` (crisper, less floaty than duration/easing).

### Removed
* `opportunity-card.webp`, `silhouette-boardroom.webp` (low-resolution originals).

### Known gaps
* Partner row 05 (Search Funds) has no photo yet: a brand fallback is shown. Add the image and replace the `null` in `PARTNER_MEDIA`.
* Phones: the Opportunities photo-card sits above the deal list, so tapping a deal updates it off-screen (it also auto-cycles).

## 2.0.0 — production hardening & polish

### Fixed (blocking)
* **Page crash on load in Chrome/Edge.** `Process` built scroll animations with ranges outside 0–1; the native scroll-timeline path rejected them and React unmounted the whole tree. Rewritten around a single active-step state.
* **Lost leads on Cloud Run.** SQLite/Prisma replaced by Firestore; email is awaited before responding; request fails loudly if neither channel accepts the enquiry.
* **Fake lock on the Partner Portal.** The password was a string in the client bundle (and printed on the lock screen). The key is now checked server-side (`PORTAL_ACCESS_KEY`), content is served only with a signed httpOnly session, fails closed.
* **PWA not installable** (non-square icon). Proper 192/512/maskable/apple icons + favicon.
* `THREE.Clock` deprecation warning (unfixable upstream in R3F) → scene rewritten in vanilla three.js.
* Duplicate SVG ids; skip-link placed after the navbar; `prefers-reduced-motion` not honoured by Framer Motion; `cp -r` build step broke on Windows; hash-fragment URLs in the sitemap; hard-coded domain.

### Performance
* Removed the 2.9 s blocking preloader; hero entrance is now CSS and starts at first paint.
* Hero poster served from pre-built AVIF/WebP (LCP ≈ 0.8 s on a clean mobile load in testing).
* Removed full-screen `mix-blend-mode` grain/spotlight layers and the always-on cursor loop; grain is a 19 KB tile.
* 3D: lazy, idle-loaded, pauses off-screen/hidden, adaptive DPR, context-loss fallback, disposed on unmount; three.js is not in the initial bundle.
* PostHog loaded lazily and only if configured (cookieless). Fonts 9 → 5 files. Logo 471 KB → 29 KB.
* Dependencies ~60 → 14 runtime packages; 45 dead UI components and Prisma removed.
* Hover effects are opacity/transform overlays (no box-shadow/background transitions).

### Design
* Kept the brand identity; bound Tailwind's `amber-*` to the brand amber (`#ff7a1a`).
* The hero photograph is now the star (the old 85 % scrim and 3D replacement hid it); 3D is an additive depth layer.
* Text contrast raised to ≥ 4.5:1 across the site; fluid hero type; consistent glass-card system with amber edge-light.

### Deployment
* `Dockerfile`, `cloudbuild.yaml`, `firebase.json`, `firestore.rules`, `scripts/deploy.sh`, rewritten `DEPLOYMENT.md`, security headers + CSP, correct CDN cache headers for HTML.

### Removed
* UI sound effects (and the navbar toggle), Prisma/SQLite, `z-ai-web-dev-sdk` and other unused dependencies, Caddyfile/docker-compose/vercel.json (sandbox/Vercel leftovers), Tailwind v3 config.
