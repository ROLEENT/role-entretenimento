import { test, expect } from '@playwright/test';

test.describe('Agenda Pages', () => {
  test('should load /agenda without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    
    // Check page loads successfully
    await expect(page.locator('h1')).toContainText('Agenda');
    
    // No console errors
    expect(errors).toHaveLength(0);
  });

  test('should load /agenda/cidade/porto_alegre without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/agenda/cidade/porto_alegre');
    await page.waitForLoadState('networkidle');
    
    // Check page loads successfully
    await expect(page.locator('h1')).toContainText('Porto Alegre');
    
    // No console errors
    expect(errors).toHaveLength(0);
  });

  test('should redirect old routes to /agenda', async ({ page }) => {
    const oldRoutes = ['/vitrine-cultural', '/destaques', '/eventos', '/highlights'];
    
    for (const route of oldRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      expect(page.url()).toContain('/agenda');
    }
  });

  test('should handle unusual filters without breaking', async ({ page }) => {
    await page.goto('/agenda/cidade/porto_alegre');
    
    // Test search with special characters
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('!@#$%^&*()');
    await page.waitForLoadState('networkidle');
    
    // Page should not crash
    await expect(page.locator('h1')).toBeVisible();
    
    // URL should maintain state
    expect(page.url()).toContain('search=!%40%23%24%25%5E%26*()');
    
    // Test with very long search
    await searchInput.fill('a'.repeat(100));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show empty state for zero results', async ({ page }) => {
    await page.goto('/agenda/cidade/porto_alegre');
    
    // Search for something that returns no results
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('evento-inexistente-xyz123');
    await page.waitForLoadState('networkidle');
    
    // Should show empty state, not error
    const emptyState = page.locator('[role="status"]').filter({ hasText: /Nenhum evento encontrado|Não encontramos eventos/ });
    await expect(emptyState).toBeVisible();
    
    // Should not show error state
    const errorState = page.locator('[role="alert"]');
    await expect(errorState).not.toBeVisible();
  });

  test('should maintain URL state with filters', async ({ page }) => {
    await page.goto('/agenda/cidade/porto_alegre');
    
    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('música');
    await page.waitForLoadState('networkidle');
    
    // Check URL has search parameter
    expect(page.url()).toContain('search=m%C3%BAsica');
    
    // Apply period filter if available
    const periodFilter = page.locator('select, [role="combobox"]').first();
    if (await periodFilter.isVisible()) {
      await periodFilter.selectOption('fim-de-semana');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('period=fim-de-semana');
    }
    
    // Refresh page and check filters persist
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Search should be maintained
    await expect(searchInput).toHaveValue('música');
  });

  test('should have good mobile performance metrics', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start performance measurement
    const startTime = Date.now();
    
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    
    // Page should load reasonably fast
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    
    // Check for performance indicators
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // Verify lazy loading is working
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      if (loading) {
        expect(loading).toBe('lazy');
      }
    }
    
    // Check responsive images
    const pictureElements = page.locator('picture');
    const pictureCount = await pictureElements.count();
    expect(pictureCount).toBeGreaterThan(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/agenda_public*', route => route.abort());
    
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    
    // Should show error state with retry button
    const errorState = page.locator('[role="alert"]');
    await expect(errorState).toBeVisible();
    
    const retryButton = page.locator('button').filter({ hasText: /Tentar/ });
    await expect(retryButton).toBeVisible();
  });
});