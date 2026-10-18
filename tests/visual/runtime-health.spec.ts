import { expect, test } from "@playwright/test";

test("application shell has no CSP, RSC, or navigation console failures", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", request => {
    const reason = request.failure()?.errorText ?? "unknown";
    const cancelledNextPrefetch=request.url().includes("_rsc=")&&reason.includes("ERR_ABORTED");
    if (!request.url().includes("favicon")&&!cancelledNextPrefetch) failures.push(`request: ${request.method()} ${request.url()} ${reason}`);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Choose your Founding membership." })).toBeVisible();
  await page.getByRole("link", { name: "Choose a Traveler tier", exact: true }).click();
  await expect(page).toHaveURL(/\/founding-era\/travelers$/);
  await expect(page.getByRole("heading", { name: "Explore Ramah from the beginning." })).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Explore Ramah from the beginning." })).toBeVisible();
  await page.waitForTimeout(750);
  expect(failures).toEqual([]);
});
