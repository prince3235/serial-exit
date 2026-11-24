import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, portalKey, verifySession } from "@/lib/portal-session";
import { listAllForExport } from "@/lib/comms/store";
import { buildLeadsWorkbookBuffer } from "@/lib/integrations/excel-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/export
 * Downloads a multi-sheet Excel (.xlsx) workbook of all Leads, Communication Log,
 * and Automation Logs. Protected by the Partner Portal session cookie.
 */
export async function GET(req: NextRequest) {
  const ok = verifySession(req.cookies.get(SESSION_COOKIE)?.value, portalKey());
  if (!ok) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const data = await listAllForExport();
    const buf = await buildLeadsWorkbookBuffer(data);
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="serial-exit-leads-${stamp}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[/api/portal/export] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}
