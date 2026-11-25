import { test } from "@playwright/test";

test.describe("QA Screenshots", () => {
  const viewports = [
    { name: "360", width: 360, height: 740 },
    { name: "768", width: 768, height: 1024 },
    { name: "1366", width: 1366, height: 768 },
    { name: "1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Capture C1-C2 hero fold at ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("load");
      await page.screenshot({ path: `qa-screens/C2-${vp.name}.png`, fullPage: false });
    });
  }
});
