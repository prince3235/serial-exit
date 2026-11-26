import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dormant in Phase 1 (WhatsApp Cloud API deferred to Phase 2). */
const notFound = () =>
  NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  return notFound();
}

export async function POST() {
  return notFound();
}
