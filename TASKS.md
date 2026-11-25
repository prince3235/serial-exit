# Backlog & Execution Checklist (Serial Exit v2.0.0 UI/UX Overhaul)

Branch: `ui/overhaul`  
Standard: Institutional-Grade Luxury Aesthetic (#050505, #ff7a1a, #d9a65a)

---

## P0 — Core Fixes (Highest Impact)

- [x] **P0-1** Core Idea legibility: background ticker opacity (~0.08–0.12) with radial/linear mask; raise illuminated-word min opacity from 0.2 to ~0.35.
  - *Acceptance Criteria*: Headline fully legible across 360px–1440px; ticker remains subtle background texture; zero collision.
- [x] **P0-2** Navbar & Scroll-spy: New labels: Platform (`#core-idea`), What We Do (`#opportunities`), How It Works (`#process`), Deals (`#showcase`), Partners (`#our-partners`). Scroll-spy highlights active section and clears when none in view. Footer and i18n (en/hi) aligned.
  - *Acceptance Criteria*: Navbar links route correctly; scroll spy reflects viewport accurately; footer matches; en/hi messages match.
- [x] **P0-3** Hero fold responsiveness: Ensure tag row and scroll cue are visible on laptop screens (1366x768, 1440x900) via `min-h-[100svh]` and vertical balance. Raise eyebrow contrast and size.
  - *Acceptance Criteria*: Tag row and cue visible at 1366x768 and 1440x900; eyebrow contrast ratio >= 4.5:1.
- [x] **P0-4** Contact section & Trust block: Remove duplicate confidence disclaimer. Add "What happens next" 3-step block (Review within 24h -> Verification call -> Confidential introduction), direct email/phone from site.ts, and trust note. Strengthen input borders. Preserve honeypot, validation, POST /api/contact behavior, and e2e test pass.
  - *Acceptance Criteria*: No duplicate copy; left column features 3-step timeline and direct contact; input borders crisp; contact test passes.
- [x] **P0-4b** Typography & Contrast tokens: Body 15–16px, labels >= 11px, body color ~#bdb7ae on dark. Tokenized in globals.css.
  - *Acceptance Criteria*: Contrast ratio >= 4.5:1 for body copy; labels >= 11px; tokenized via CSS variables.

---

## P1 — Section Upgrades

- [x] **P1-1** Process (pinned section): Remove gap under heading; `h-[100svh]` with vertically centered content; visible on 1366x768; ghost step number clearly visible; enlarged right focal visual. Keep mobile `VerticalStepper`.
  - *Acceptance Criteria*: Centered layout without dead gap; ghost step numbers prominent; mobile stepper intact.
- [x] **P1-2** Showcase deal cards -> "confidential dossier" style: Reference IDs (e.g. SE-0142), redaction bars, "NDA required" tag, thin paper-like header. Single "Verified" indicator per card. Labels >= 11px. Add CTA ("Request access to live deal flow" -> #contact).
  - *Acceptance Criteria*: Dossier aesthetic; unique illustrative reference IDs; single verified badge; access CTA below grid.
- [x] **P1-3** Opportunities bento: Align title baselines; remove dead space in card 1; subtle icon per card; "Typical for: ..." line. Retain 4+2 / 2x3 responsive grid.
  - *Acceptance Criteria*: Consistent baseline typography; concise hierarchy; icons and transaction criteria clear.
- [x] **P1-4** Partners: Consistent photo treatment (harmonized monochrome/dark luxury tone); left-aligned header; LinkedIn icon links; optional credentials support with `TODO(owner)` placeholders.
  - *Acceptance Criteria*: Crystal-clear 1024x1024 retina portraits with cohesive dark tone; left-aligned section header; verified LinkedIn links.
- [x] **P1-5** Proof strip under hero: 4 structurally-true facts ("5 transaction types", "100% off-market", "India-wide coverage", "Verified before introduced"). Zero fabricated numbers.
  - *Acceptance Criteria*: Institutional proof strip below hero; clean typography and border styling.
- [x] **P1-6** "Why Serial Exit" block: 3 institutional differentiators placed post-Opportunities using existing primitives.
  - *Acceptance Criteria*: 3 core differentiators clearly articulating advantages over public brokers/marketplaces.
- [x] **P1-7** Legal pages: `/privacy` and `/terms` (App Router pages), footer links, contact form consent notice. Mark text DRAFT in `OWNER_TODO.md` for legal review. Add routes to `sitemap.ts`. Matching chrome.
  - *Acceptance Criteria*: Dedicated `/privacy` and `/terms` pages matching brand theme; sitemap inclusion; footer & contact links.

---

## P2 — Polish

- [ ] **P2-1** Dual-audience hero CTAs: "For Advisors & Investors" and "For Business Owners" scrolling to `#contact` with matching tab preselected.
  - *Acceptance Criteria*: Both CTAs function smoothly without affecting API contract.
- [ ] **P2-2** FAQ section: 6–8 accessible accordion Q&As (confidentiality, fees, qualification, timeline, data security).
  - *Acceptance Criteria*: Fully accessible keyboard-friendly accordion; clear institutional answers.
- [ ] **P2-3** Final CTA band & ornaments: High-conversion pre-contact banner; subtle `.se-ornament` section dividers.
  - *Acceptance Criteria*: Cohesive pre-contact closure; luxury ornament dividing lines.
- [ ] **P2-4** SEO / Trust copy: Soften unverifiable claims in metadata/OG; canonical and OG URLs strictly driven by `NEXT_PUBLIC_SITE_URL`.
  - *Acceptance Criteria*: Compliant metadata; strict environment-driven canonical URLs.
- [ ] **P2-5** i18n parity: Move all Contact, OurPartners, Footer, and new section strings into `messages.ts` (en + hi identical shape).
  - *Acceptance Criteria*: Complete 1:1 key parity across English and Hindi locales.
- [ ] **P2-6** Performance & CSS cleanup: Verify Lighthouse mobile metrics; INP/CLS optimization; remove dead CSS classes; Hero3D graceful degradation.
  - *Acceptance Criteria*: Unused CSS purged; zero layout shifts; canvas fallback verified.
- [ ] **P2-7** Final QA: Full Playwright test suite (desktop & mobile); keyboard accessibility; focus traps; 404 page check.
  - *Acceptance Criteria*: All automated and visual QA gates green.
