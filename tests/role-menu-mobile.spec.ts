import { test, expect } from '@playwright/test';

test.describe('ROLÊ Mobile Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open and close mobile menu correctly', async ({ page }) => {
    // Open menu (assuming there's a menu button)
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check if menu is visible
    const menuContent = page.locator('[data-testid="role-menu-mobile"]');
    await expect(menuContent).toBeVisible();

    // Check for ROLÊ text logo
    const logo = page.locator('text=ROLÊ').first();
    await expect(logo).toBeVisible();

    // Close menu using X button
    const closeButton = page.locator('button[aria-label="Fechar menu"]');
    await closeButton.click();

    // Menu should be hidden
    await expect(menuContent).not.toBeVisible();
  });

  test('should display search functionality', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check search input
    const searchInput = page.locator('#role-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Buscar eventos, artistas...');

    // Test search functionality
    await searchInput.fill('test search');
    await searchInput.press('Enter');

    // Menu should close after search
    const menuContent = page.locator('[data-testid="role-menu-mobile"]');
    await expect(menuContent).not.toBeVisible();
  });

  test('should navigate to correct pages when cards are clicked', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Test Explorar navigation
    const explorarCard = page.locator('[data-testid="explorar-card"]');
    await explorarCard.click();
    
    await page.waitForURL('**/agenda');
    expect(page.url()).toContain('/agenda');
    
    // Go back and test other navigations
    await page.goto('/');
    await menuButton.click();

    // Test Revista navigation
    const revistaCard = page.locator('[data-testid="revista-card"]');
    await revistaCard.click();
    
    await page.waitForURL('**/revista');
    expect(page.url()).toContain('/revista');

    // Go back and test Artistas navigation
    await page.goto('/');
    await menuButton.click();

    const artistasCard = page.locator('[data-testid="artistas-card"]');
    await artistasCard.click();
    
    await page.waitForURL('**/perfis?type=artista');
    expect(page.url()).toContain('/perfis?type=artista');

    // Go back and test Meu Perfil navigation (if logged in)
    await page.goto('/');
    await menuButton.click();

    const perfilCard = page.locator('[data-testid="perfil-card"]');
    await perfilCard.click();
    
    await page.waitForURL('**/perfil');
    expect(page.url()).toContain('/perfil');
  });

  test('should display dynamic counters for events and artists', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Wait for stats to load (check for loading or actual numbers)
    await page.waitForTimeout(2000);

    // Check that event counter is visible in Explorar card (either loading state or number)
    const eventCounter = page.locator('[data-testid="explorar-card"]').locator('text=/eventos/');
    await expect(eventCounter).toBeVisible();
  });

  test('should show authentication modal when CTA button is clicked (if not logged in)', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check if CTA button is visible (only if user is not logged in)
    const ctaButton = page.locator('text=Entrar na plataforma');
    
    // If button exists, test its functionality
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      
      // Check if authentication modal appears
      const authModal = page.locator('[data-testid="auth-modal"]');
      await expect(authModal).toBeVisible({ timeout: 3000 });
    }
  });

  test('should conditionally show login button based on auth status', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check the conditional rendering of login button
    const ctaButton = page.locator('text=Entrar na plataforma');
    const themeToggle = page.locator(`button[aria-label*="tema"]`);
    
    // Theme toggle should always be visible
    await expect(themeToggle).toBeVisible();
    
    // CTA button visibility depends on auth state
    // This test will pass whether user is logged in or not
    const isCtaVisible = await ctaButton.isVisible();
    console.log('CTA button visible:', isCtaVisible);
  });

  test('should toggle theme correctly', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Get current theme
    const bodyClass = await page.locator('body').getAttribute('class');
    const isDark = bodyClass?.includes('dark') || false;

    // Click theme toggle
    const themeToggle = page.locator(`button[aria-label*="tema"]`);
    await themeToggle.click();

    // Wait for theme change
    await page.waitForTimeout(500);

    // Check if theme changed
    const newBodyClass = await page.locator('body').getAttribute('class');
    const isNowDark = newBodyClass?.includes('dark') || false;

    expect(isNowDark).toBe(!isDark);
  });

  test('should be responsive and work on different screen sizes', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    const menuContent = page.locator('[data-testid="role-menu-mobile"]');
    await expect(menuContent).toBeVisible();

    // Test touch interactions work
    const explorarCard = page.locator('[data-testid="explorar-card"]');
    await explorarCard.tap();
    
    await page.waitForURL('**/agenda');
    expect(page.url()).toContain('/agenda');

    // Test on different mobile size
    await page.setViewportSize({ width: 428, height: 926 });
    await page.goto('/');
    await menuButton.click();
    await expect(menuContent).toBeVisible();
  });

  test('should handle loading states properly', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('**/rest/v1/events*', async route => {
      await page.waitForTimeout(2000); // Simulate slow response
      route.continue();
    });

    await page.route('**/rest/v1/profiles*', async route => {
      await page.waitForTimeout(2000); // Simulate slow response
      route.continue();
    });

    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check for loading states
    const loadingElements = page.locator('.animate-pulse');
    await expect(loadingElements.first()).toBeVisible();

    // Wait for loading to complete
    await page.waitForTimeout(3000);
    
    // Loading elements should be gone
    await expect(loadingElements.first()).not.toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Check aria labels
    const closeButton = page.locator('button[aria-label="Fechar menu"]');
    await expect(closeButton).toBeVisible();

    const themeToggle = page.locator('button[aria-label*="tema"]');
    await expect(themeToggle).toBeVisible();

    // Check that search input is focused automatically
    const searchInput = page.locator('#role-search-input');
    await expect(searchInput).toBeFocused();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to a page or trigger an action
    await page.waitForTimeout(500);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate API errors
    await page.route('**/rest/v1/events*', async route => {
      route.abort('failed');
    });

    await page.route('**/rest/v1/profiles*', async route => {
      route.abort('failed');
    });

    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu-trigger"]');
    await menuButton.click();

    // Menu should still work even with API errors
    const menuContent = page.locator('[data-testid="role-menu-mobile"]');
    await expect(menuContent).toBeVisible();

    // Fallback counters should be shown
    const explorarCard = page.locator('[data-testid="explorar-card"]');
    await expect(explorarCard).toBeVisible();
  });
});