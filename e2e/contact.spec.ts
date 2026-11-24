import { test, expect } from "@playwright/test";

/**
 * Contact form — client + server validation, success state, and API.
 */
test.describe("Contact form", () => {
  test("shows validation errors when submitted empty", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1200);

    const submit = page.getByRole("button", { name: /send enquiry/i });
    await submit.click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please enter your company.")).toBeVisible();
    await expect(page.getByText("Please enter your work email.")).toBeVisible();
    await expect(page.getByText("Please select a role / type.")).toBeVisible();
    await expect(page.getByText("Please share a brief message.")).toBeVisible();
  });

  test("submits successfully and shows the success state", async ({ page }) => {
    // The real endpoint needs Firestore/Resend credentials; mock it so this test is hermetic.
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
    );
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1200);

    await page.getByLabel(/full name/i).fill("Aarav Gupta");
    await page.getByLabel(/company/i).fill("Meridian Capital");
    await page.getByLabel(/work email/i).fill("aarav.gupta@meridiancapital.in");
    await page.getByLabel(/phone/i).fill("+91 90000 11223");
    await page.getByRole("combobox", { name: /role/i }).selectOption("Private Equity Firm");
    await page
      .getByLabel(/message/i)
      .fill("Seeking verified off-market opportunities in mid-market manufacturing, 150-400 Cr range.");

    await page.getByRole("button", { name: /send enquiry/i }).click();
    await expect(page.getByText("Enquiry received.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/two business days/i)).toBeVisible();
  });

  test("switching tabs updates the role dropdown options", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(1200);

    // Partner tab default — contains partner-specific options
    const select = page.getByRole("combobox", { name: /role/i });
    let options = await select.locator("option").allTextContents();
    expect(options).toContain("Private Equity Firm");

    // Switch to Business Owner
    await page.getByRole("tab", { name: /business owner/i }).click();
    await page.waitForTimeout(800);
    options = await select.locator("option").allTextContents();
    expect(options).toContain("Business Sale");
    expect(options).not.toContain("Private Equity Firm");
  });
});

test.describe("Contact API", () => {
  test("rejects invalid email with 422", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        tab: "partner",
        name: "Test",
        company: "Co",
        email: "not-an-email",
        role: "x",
        message: "short",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeTruthy();
  });

  test("honeypot field is silently accepted", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        tab: "partner",
        name: "Bot",
        company: "x",
        email: "bot@x.com",
        role: "x",
        message: "spam spam spam spam",
        website: "http://spam.com",
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
