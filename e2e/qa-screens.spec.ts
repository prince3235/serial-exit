import { test } from "@playwright/test";

test.describe("QA Screenshots", () => {
  for (const w of [360, 768, 1440]) {
    test(`Capture P1 at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: w === 768 ? 1024 : 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `qa-screens/P1-${w}.png`, fullPage: false });
    });
  }
});
