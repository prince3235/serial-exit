import { NextRequest, NextResponse } from "next/server";
import { portalCases } from "@/content/portal-cases";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSession,
  portalKey,
  safeEqual,
  verifySession,
} from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Partner Portal gate (server-side).
 *
 *  POST   { key }  → verify the access key, set a signed session cookie, return the case studies
 *  GET             → return the case studies if the session cookie is valid (401 otherwise)
 *  DELETE          → clear the session
 *
 * Fails closed: with PORTAL_ACCESS_KEY unset, POST returns 503 and nothing unlocks.
 */
const headers = { "Cache-Control": "private, no-store" };
const json = (body: unknown, status = 200, extra?: Record<string, string>) =>
  NextResponse.json(body, { status, headers: { ...headers, ...extra } });

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api",
    maxAge,
  };
}

export async function GET(req: NextRequest) {
  const ok = verifySession(req.cookies.get(SESSION_COOKIE)?.value, portalKey());
  if (!ok) return json({ ok: false }, 401);
  return json({ ok: true, cases: portalCases });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, error: "forbidden" }, 403);

  const key = portalKey();
  if (!key) return json({ ok: false, error: "unavailable" }, 503);

  const limited = rateLimit(`portal:${clientIp(req)}`, 8, 10 * 60_000);
  if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });

  let body: { key?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  const attempt = typeof body.key === "string" ? body.key.trim().slice(0, 200) : "";
  if (!attempt || !safeEqual(attempt.toLowerCase(), key.toLowerCase())) {
    return json({ ok: false, error: "wrong_key" }, 401);
  }

  const res = json({ ok: true, cases: portalCases });
  res.cookies.set(SESSION_COOKIE, createSession(key), cookieOptions(SESSION_TTL_SECONDS));
  return res;
}

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false }, 403);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  return res;
}
