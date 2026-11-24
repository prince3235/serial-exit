import { test, expect } from "@playwright/test";

/**
 * Partner Portal gate — the access key is verified SERVER-SIDE.
 * Run with PORTAL_ACCESS_KEY=e2e-key set for the web server.
 */
const KEY = process.env.PORTAL_ACCESS_KEY ?? "e2e-key";

test.describe("Partner portal API", () => {
  test("rejects a wrong key and unauthenticated reads", async ({ request }) => {
    const wrong = await request.post("/api/portal", { data: { key: "definitely-wrong" } });
    expect([401, 503]).toContain(wrong.status());
    const read = await request.get("/api/portal");
    expect(read.status()).toBe(401);
  });

  test("never ships the gated content or the key in the public JS bundle", async ({ page }) => {
    const bodies: string[] = [];
    page.on("response", async (r) => {
      if (r.url().includes("/_next/static") && r.url().endsWith(".js")) bodies.push(await r.text().catch(() => ""));
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const all = bodies.join("\n");
    expect(all).not.toContain("Tier-1 OEM supplier");
    expect(all).not.toContain(KEY);
  });
});
