import { test, expect } from "@playwright/test";

/**
 * Mobile (Pixel 7) — responsive layout & menu.
 */
test.describe("Mobile", () => {
  test("hamburger opens the full-screen menu and links close it and scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.getByRole("button", { name: /open menu/i }).click();
    const dialog = page.getByRole("dialog", { name: /site menu/i });
    await expect(dialog).toBeVisible();
    const howLink = dialog.getByRole("link", { name: /how it works/i });
    await expect(howLink).toBeVisible();
    await expect(dialog.getByRole("link", { name: /what we do/i })).toBeVisible();
    await howLink.click();
    await expect(dialog).toBeHidden({ timeout: 5_000 });
    await expect(page.locator("#process")).toBeInViewport({ ratio: 0.1, timeout: 10_000 });
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

  test("our partners cards stack cleanly on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const cards = page.locator("#our-partners article");
    await expect(cards).toHaveCount(2);
    await cards.first().scrollIntoViewIfNeeded();
    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(box1).toBeTruthy();
    expect(box2).toBeTruthy();
    expect(box2!.y).toBeGreaterThan(box1!.y);
  });
});
