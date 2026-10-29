import { test, expect } from '@playwright/test';

test.describe('FitProof Browser End-to-End Suite', () => {
  test('Buyer navigates to compatibility checker and identifies laptop', async ({ page }) => {
    await page.goto('/');

    // Check header and prototype banner
    await expect(page.locator('text=FitProof')).toBeVisible();
    await expect(page.locator('text=Prototype — Synthetic Demonstration Data')).toBeVisible();

    // Start check wizard
    await page.click('text=Start Compatibility Check');
    await expect(page).toHaveURL(/\/check/);

    // Identify laptop: Click ApexBook 15 Gen 2
    await page.click('text=AB15-G2-INTEL');

    // Target slots should now appear
    await expect(page.locator('text=RAM Slot 2 (Secondary - Free Expansion)')).toBeVisible();

    // Click secondary slot
    await page.click('text=RAM Slot 2 (Secondary - Free Expansion)');

    // Select candidate part: PF-D4-3200-16G
    await expect(page.locator('text=PF-D4-3200-16G')).toBeVisible();
    await page.click('text=Check Compatibility');

    // Should navigate to result page with SUPPORTED verdict
    await expect(page).toHaveURL(/\/check\/result/);
    await expect(page.locator('text=SUPPORTED')).toBeVisible();
    await expect(page.locator('text=Supported')).toBeVisible();
  });

  test('Comparison view compares candidate parts side-by-side', async ({ page }) => {
    await page.goto('/compare?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ram-2&partIds=part-pf-d4-16g,part-pf-d5-16g');

    await expect(page.locator('text=Candidate Comparison')).toBeVisible();
    await expect(page.locator('text=PF-D4-3200-16G')).toBeVisible();
    await expect(page.locator('text=PF-D5-4800-16G')).toBeVisible();
    await expect(page.locator('text=SUPPORTED')).toBeVisible();
    await expect(page.locator('text=INCOMPATIBLE')).toBeVisible();
  });

  test('Printable report renders with report identifiers and disclaimer', async ({ page }) => {
    await page.goto('/print?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ram-2&partId=part-pf-d4-16g');

    await expect(page.locator('text=FitProof Compatibility Report')).toBeVisible();
    await expect(page.locator('text=Non-Warranty Notice')).toBeVisible();
    await expect(page.locator('text=Prototype — Synthetic Data')).toBeVisible();
  });
});

