import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Partner Portal is dormant in Phase 1 (deferred until Phase 2 proper auth
 * with Firebase Auth / NextAuth + Firestore). All portal routes return 404.
 */
const notFound = () =>
  NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  return notFound();
}

export async function POST() {
  return notFound();
}

export async function DELETE() {
  return notFound();
}
