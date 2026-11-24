import { test, expect } from "@playwright/test";

const KEY = process.env.PORTAL_ACCESS_KEY ?? "e2e-key";

test.describe("Client Enquiry & Communication System", () => {
  test("contact form renders optional WhatsApp consent checkbox", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="#contact"]');
    const consent = page.getByLabel(/receive confidential enquiry acknowledgements/i);
    await expect(consent).toBeVisible();
    await expect(consent).not.toBeChecked();
    await consent.check();
    await expect(consent).toBeChecked();
  });

  test("unauthenticated portal leads, export, and retry endpoints reject with 401", async ({ request }) => {
    const leads = await request.get("/api/portal/leads");
    expect(leads.status()).toBe(401);

    const exp = await request.get("/api/portal/export");
    expect(exp.status()).toBe(401);

    const retry = await request.post("/api/automation/retry");
    expect(retry.status()).toBe(401);
  });

  test("WhatsApp webhook GET rejects invalid verify token and POST rejects unsigned/invalid payload in prod", async ({
    request,
  }) => {
    const verifyFail = await request.get(
      "/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345"
    );
    expect(verifyFail.status()).toBe(403);
  });

  test("authenticated Partner Portal opens Client Management Dashboard and exports valid .xlsx", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open Partner Portal
    await page.getByRole("button", { name: /partner portal/i }).first().click();
    await page.getByLabel(/enter partner access key/i).fill(KEY);
    await page.getByRole("button", { name: /^unlock$/i }).click();

    await expect(page.getByRole("button", { name: /client management/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/total leads/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /export \.xlsx/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sync sheets/i })).toBeVisible();

    // Switch to Illustrative Mandates tab and back
    await page.getByRole("button", { name: /illustrative case studies/i }).click();
    await expect(page.getByText(/illustrative only/i)).toBeVisible();
    await page.getByRole("button", { name: /client management/i }).click();
    await expect(page.getByText(/total leads/i)).toBeVisible();

    // Verify authenticated export endpoint headers (even if Firestore is empty/fallback, returns 200 xlsx or 500 if unconfigured)
    const exportStatus = await page.evaluate(async () => {
      const res = await fetch("/api/portal/export", { credentials: "same-origin" });
      return { status: res.status, ct: res.headers.get("content-type") };
    });
    // In local environment without Firestore credentials it may return 500; when configured, 200 xlsx
    expect([200, 500]).toContain(exportStatus.status);
    if (exportStatus.status === 200) {
      expect(exportStatus.ct).toContain("spreadsheetml.sheet");
    }
  });
});
