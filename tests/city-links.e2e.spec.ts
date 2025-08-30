import { test, expect } from '@playwright/test';

test.describe('City Links', () => {
  test('clicking SP chip opens /agenda/cidade/sao_paulo', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="header"]', { timeout: 10000 });
    
    // Click on SP chip in header (desktop)
    const spChip = page.locator('a:has-text("SP")').first();
    await expect(spChip).toBeVisible();
    await spChip.click();
    
    // Check URL changed to correct city page
    await expect(page).toHaveURL(/\/agenda\/cidade\/sao_paulo/);
    
    // Verify page loads without errors
    await page.waitForLoadState('networkidle');
    
    // Check for no console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(logs).toHaveLength(0);
  });

  test('clicking "Ver todos da cidade" in Porto Alegre opens /agenda/cidade/porto_alegre', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the agenda section to load
    await page.waitForSelector('text=AGENDA POR CIDADE', { timeout: 10000 });
    
    // Find Porto Alegre section and click "Ver todos da cidade"
    const portoAlegreButton = page.locator('text=Porto Alegre').locator('..').locator('text=Ver todos da cidade');
    await expect(portoAlegreButton).toBeVisible();
    await portoAlegreButton.click();
    
    // Check URL changed to correct city page
    await expect(page).toHaveURL(/\/agenda\/cidade\/porto_alegre/);
    
    // Verify page loads without errors
    await page.waitForLoadState('networkidle');
    
    // Check that the page content loads (city events should be filtered)
    await page.waitForSelector('h1, h2', { timeout: 10000 });
    
    // Check for no console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(logs).toHaveLength(0);
  });

  test('city chips show active state when on city page', async ({ page }) => {
    // Go directly to a city page
    await page.goto('/agenda/cidade/sao_paulo');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="header"]', { timeout: 10000 });
    
    // Check that SP chip has active styling
    const spChip = page.locator('a:has-text("SP")').first();
    await expect(spChip).toHaveClass(/bg-primary/);
  });
});