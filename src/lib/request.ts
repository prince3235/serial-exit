import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { SITE_URL } from "./site";

/** Best-effort client IP. Behind Firebase Hosting / Cloud Run the first X-Forwarded-For hop is the client. */
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** One-way hash so we can correlate abuse without storing raw IPs (personal data). */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "serial-exit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Lightweight CSRF defence for JSON POST endpoints: if the browser sent an
 * Origin header it must match this site. Requests with no Origin (curl,
 * server-to-server) are allowed — they can't carry a victim's cookies anyway.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>([new URL(SITE_URL).host]);
  const fwd = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");
  if (fwd) allowed.add(fwd);
  if (host) allowed.add(host);
  return allowed.has(originHost);
}
