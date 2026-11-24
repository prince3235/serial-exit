import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, portalKey, safeEqual, verifySession } from "@/lib/portal-session";
import { processDueRetries } from "@/lib/comms/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  // 1. Authenticated Partner Portal session cookie
  if (verifySession(req.cookies.get(SESSION_COOKIE)?.value, portalKey())) {
    return true;
  }
  // 2. Bearer CRON_SECRET for scheduled Vercel Cron / Cloud Scheduler
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (cronSecret && auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    return safeEqual(token, cronSecret);
  }
  return false;
}

async function handleRetry(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const summary = await processDueRetries();
    return NextResponse.json({ ok: true, ...summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Retry batch failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleRetry(req);
}

export async function GET(req: NextRequest) {
  return handleRetry(req);
}
