import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dormant in Phase 1 — returns 404 until Phase 2 authenticated portal launch. */
const notFound = () =>
  NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  return notFound();
}

export async function PATCH() {
  return notFound();
}

export async function POST() {
  return notFound();
}
