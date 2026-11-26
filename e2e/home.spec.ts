import { test, expect } from "@playwright/test";

/**
 * Homepage — core rendering & navigation.
 */
test.describe("Homepage", () => {
  test("loads and renders the hero headline", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(page).toHaveTitle(/Serial Exit/);
    const h1 = page.locator("h1").first();
    await expect(h1).toContainText("Access deals");
    await expect(h1).toContainText("before");
    await expect(h1).toContainText("market");
  });

  test("all primary sections are present in document order", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const headings = page.locator("h2");
    await expect(headings).toHaveCount(8);
    await expect(page.locator("#opportunities h2")).toContainText("transaction spectrum");
    await expect(page.locator("#why-serial-exit h2")).toContainText("Why Serial Exit vs. Public Listing Networks");
    await expect(page.locator("#process h2")).toContainText("measured path");
    await expect(page.locator("#showcase h2")).toContainText("Every opportunity is verified");
    await expect(page.locator("#faq h2")).toContainText("Institutional Origination Clarity");
    await expect(page.locator("#our-partners h2")).toContainText("Principal Partners");
    await expect(page.locator("#contact h2")).toContainText("Let's discuss");
    await expect(page.locator("#partners")).toHaveCount(0);
    await expect(page.locator("#mission")).toHaveCount(0);
    await expect(page.locator("#comparison")).toHaveCount(0);
    await expect(page.locator("#showcase picture")).toHaveCount(0);

    const cards = page.locator("#our-partners article");
    await expect(cards).toHaveCount(2);
    await cards.first().scrollIntoViewIfNeeded();
    await expect
      .poll(async () => {
        const b1 = await cards.nth(0).boundingBox();
        const b2 = await cards.nth(1).boundingBox();
        if (!b1 || !b2) return 999;
        expect(b2.x).toBeGreaterThan(b1.x);
        return Math.abs(b1.y - b2.y);
      })
      .toBeLessThan(10);
  });

  test("nav links smooth-scroll to sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="#process"]');
    await page.waitForTimeout(1800);
    const process = page.locator("#process");
    await expect(process).toBeInViewport({ ratio: 0.1 });
  });

  test("no horizontal scroll on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test("footer contains the legal disclaimer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const footer = page.locator("footer");
    await expect(footer).toContainText("not a broker-dealer");
    await expect(footer).toContainText("© 2026 Serial Exit");
  });

  test("hero CTA 'For Business Owners' scrolls to contact and activates owner tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    const ownerBtn = page.locator('a[href="#contact?tab=owner"]').first();
    await expect(ownerBtn).toBeVisible();
    await ownerBtn.click();

    const contact = page.locator("#contact");
    await expect(contact).toBeInViewport({ ratio: 0.1, timeout: 10_000 });
    await expect(page.getByRole("tab", { name: /business owner/i })).toHaveAttribute("aria-selected", "true");
    const select = page.getByRole("combobox", { name: /role/i });
    const options = await select.locator("option").allTextContents();
    expect(options).toContain("Business Sale");
    expect(options).not.toContain("Private Equity Firm");
  });

  test("hero CTA 'For Advisors & Investors' scrolls to contact and activates partner tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    const partnerBtn = page.locator('a[href="#contact?tab=partner"]').first();
    await expect(partnerBtn).toBeVisible();
    await partnerBtn.click();

    const contact = page.locator("#contact");
    await expect(contact).toBeInViewport({ ratio: 0.1, timeout: 10_000 });
    await expect(page.getByRole("tab", { name: /partner/i })).toHaveAttribute("aria-selected", "true");
    const select = page.getByRole("combobox", { name: /role/i });
    const options = await select.locator("option").allTextContents();
    expect(options).toContain("Private Equity Firm");
  });

  test("CTA band buttons switch tabs and scroll to contact", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    const bandOwner = page.locator('section[aria-label="Direct Mandate Initiation"] a[href="#contact?tab=owner"]');
    await bandOwner.scrollIntoViewIfNeeded();
    await bandOwner.click();
    await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.1, timeout: 10_000 });
    await expect(page.getByRole("tab", { name: /business owner/i })).toHaveAttribute("aria-selected", "true");

    const bandPartner = page.locator('section[aria-label="Direct Mandate Initiation"] a[href="#contact?tab=partner"]');
    await bandPartner.scrollIntoViewIfNeeded();
    await bandPartner.click();
    await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.1, timeout: 10_000 });
    await expect(page.getByRole("tab", { name: /partner/i })).toHaveAttribute("aria-selected", "true");
  });

  test("navbar does not contain language switcher (EN)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const langBtn = page.locator('button[aria-label="Language"]');
    await expect(langBtn).toHaveCount(0);
    const globeIcon = page.locator("header svg.lucide-globe");
    await expect(globeIcon).toHaveCount(0);
  });

  test("proof strip renders 4 compact institutional points", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const strip = page.locator('section[aria-label="Institutional Standards"]');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText("Transaction Types");
    await expect(strip).toContainText("Off-Market");
    await expect(strip).toContainText("Coverage");
    await expect(strip).toContainText("Verified Introductions");
    const box = await strip.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeLessThan(140);
  });
});
