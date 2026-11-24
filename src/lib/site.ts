/**
 * Central site configuration — the single source of truth for the public URL
 * and brand strings used by metadata, sitemap, robots, OG image and JSON-LD.
 *
 * NEXT_PUBLIC_SITE_URL is inlined at BUILD time (it's a NEXT_PUBLIC_ var), so
 * set it as a build arg / build-time env var for the production domain.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://serialexit.com";

/** Canonical origin, no trailing slash. */
export const SITE_URL = rawUrl.replace(/\/+$/, "");
export const SITE_NAME = "Serial Exit";
export const SITE_TITLE = "Serial Exit — Verified Off-Market Deal Origination | India";
export const SITE_DESCRIPTION =
  "Serial Exit is a verified off-market deal origination platform connecting M&A advisors, investment firms and strategic acquirers with confidential, verified business opportunities in India — before they reach the public market.";
export const THEME_COLOR = "#050505";
