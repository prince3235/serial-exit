import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed session for the Partner Portal gate.
 *
 * - The access key comes from PORTAL_ACCESS_KEY. If it is unset the portal is
 *   treated as "not configured" and nobody can unlock it (fail closed).
 * - The signing secret is derived from the access key, so rotating the key
 *   instantly invalidates every existing session.
 * - Cookie name MUST be `__session`: Firebase Hosting strips all other
 *   cookies before forwarding requests to Cloud Run.
 */
export const SESSION_COOKIE = "__session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export function portalKey(): string | null {
  const k = process.env.PORTAL_ACCESS_KEY?.trim();
  return k ? k : null;
}

function secret(key: string): Buffer {
  return createHash("sha256").update(`portal-session:${key}`).digest();
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", secret(key)).update(payload).digest("base64url");
}

/** Constant-time string comparison (hashes first so lengths never leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function createSession(key: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySession(token: string | undefined, key: string | null): boolean {
  if (!token || !key) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const [version, exp, sig] = parts;
  if (!safeEqual(sig, sign(`${version}.${exp}`, key))) return false;
  return Number(exp) > Math.floor(Date.now() / 1000);
}
