import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic check for the title based on the site's metadata
  await expect(page).toHaveTitle(/Sierra Estates/);
});

test('loads the main hero section', async ({ page }) => {
  await page.goto('/');
  // Ensure the body renders
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
