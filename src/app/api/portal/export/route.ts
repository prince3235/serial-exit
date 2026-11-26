import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dormant in Phase 1 — returns 404 until Phase 2 authenticated portal launch. */
export async function GET() {
  return NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
}
