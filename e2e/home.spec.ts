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
    await expect(headings).toHaveCount(7);
    await expect(headings.nth(0)).toContainText("transaction spectrum");
    await expect(headings.nth(6)).toContainText("Let's discuss");
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
});
