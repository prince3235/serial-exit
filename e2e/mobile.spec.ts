import { test, expect } from "@playwright/test";

/**
 * Mobile (Pixel 7) — responsive layout & menu.
 */
test.describe("Mobile", () => {
  test("hamburger opens the full-screen menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole("link", { name: /how it works/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mission/i }).first()).toBeVisible();
  });

  test("no horizontal scroll on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test("hero headline is visible without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.x).toBeGreaterThanOrEqual(0);
  });
});
