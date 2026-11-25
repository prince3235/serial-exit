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
    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(box1).toBeTruthy();
    expect(box2).toBeTruthy();
    expect(box2!.x).toBeGreaterThan(box1!.x);
    expect(Math.abs(box1!.y - box2!.y)).toBeLessThan(10);
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
