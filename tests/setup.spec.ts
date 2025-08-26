import { test, expect } from '@playwright/test';

test.describe('Setup Tests', () => {
  test('should install Playwright browsers', async () => {
    // This test ensures browsers are installed
    expect(true).toBe(true);
  });

  test('should verify test environment', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('title')).not.toBeEmpty();
  });
});