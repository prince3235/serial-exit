import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Lightweight health-check endpoint for load balancers, Docker, Kubernetes
 * and uptime monitors. Returns 200 + JSON status.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "serial-exit",
      time: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
