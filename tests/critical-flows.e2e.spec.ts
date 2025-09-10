import { test, expect } from '@playwright/test';

// Critical user flows E2E tests
test.describe('Critical User Flows', () => {
  
  // Admin Flow: Create Artist Profile
  test('should create artist profile with multiple categories', async ({ page }) => {
    await page.goto('/admin-v3/agentes/artistas');
    
    // Fill artist form
    await page.fill('[data-testid="artist-name"]', 'João Silva');
    await page.fill('[data-testid="artist-handle"]', 'joao-silva-test');
    await page.fill('[data-testid="artist-bio"]', 'Artista teste para E2E');
    
    // Select multiple categories
    await page.click('[data-testid="category-select"]');
    await page.click('[data-testid="category-musica"]');
    await page.click('[data-testid="category-teatro"]');
    
    // Select genres
    await page.click('[data-testid="genre-select"]');
    await page.click('[data-testid="genre-rock"]');
    
    // Submit form
    await page.click('[data-testid="save-artist"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin-v3\/agentes\/artistas\/[^\/]+$/);
  });

  // Admin Flow: Create Venue
  test('should create venue with address and gallery', async ({ page }) => {
    await page.goto('/admin-v3/agentes/locais');
    
    await page.fill('[data-testid="venue-name"]', 'Teatro Municipal Test');
    await page.fill('[data-testid="venue-handle"]', 'teatro-municipal-test');
    await page.fill('[data-testid="venue-address"]', 'Rua dos Testes, 123');
    await page.fill('[data-testid="venue-city"]', 'São Paulo');
    await page.fill('[data-testid="venue-description"]', 'Local de teste para E2E');
    
    // Upload image with alt text
    const fileInput = page.locator('[data-testid="venue-image-upload"]');
    await fileInput.setInputFiles('./tests/fixtures/venue-image.jpg');
    await page.fill('[data-testid="image-alt-text"]', 'Fachada do Teatro Municipal');
    
    await page.click('[data-testid="save-venue"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // Admin Flow: Create Event
  test('should create event connecting artist, venue and organizer', async ({ page }) => {
    await page.goto('/admin-v3/agenda');
    
    await page.fill('[data-testid="event-title"]', 'Show de Rock Test');
    await page.fill('[data-testid="event-handle"]', 'show-rock-test');
    
    // Select artist
    await page.click('[data-testid="artist-select"]');
    await page.click('[data-testid="artist-option-joao-silva"]');
    
    // Select venue
    await page.click('[data-testid="venue-select"]');
    await page.click('[data-testid="venue-option-teatro-municipal"]');
    
    // Set date and time (UTC)
    await page.fill('[data-testid="event-date"]', '2024-12-31');
    await page.fill('[data-testid="event-time"]', '20:00');
    
    // Set ticket info
    await page.fill('[data-testid="ticket-url"]', 'https://ingressos.com/show-rock');
    await page.fill('[data-testid="ticket-price"]', 'R$ 50,00');
    
    await page.click('[data-testid="publish-event"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin-v3\/agenda\/[^\/]+$/);
  });

  // Public Flow: Navigate from home to event by city
  test('should navigate from home to event by city', async ({ page }) => {
    await page.goto('/');
    
    // Click on city chip (SP)
    await page.click('[data-testid="city-chip-sao-paulo"]');
    
    // Should navigate to São Paulo agenda
    await expect(page).toHaveURL('/agenda/cidade/sao_paulo');
    
    // Click on an event
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await expect(firstEvent).toBeVisible();
    await firstEvent.click();
    
    // Should navigate to event detail
    await expect(page).toHaveURL(/\/evento\/[^\/]+$/);
    
    // Verify event details are loaded
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue-info"]')).toBeVisible();
  });

  // Public Flow: Save event and follow artist
  test('should save event and follow artist', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('sb-nutlcbnruabjsxecqpnd-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/evento/show-rock-test');
    
    // Save event
    await page.click('[data-testid="save-event-btn"]');
    await expect(page.locator('[data-testid="event-saved-success"]')).toBeVisible();
    
    // Follow artist
    await page.click('[data-testid="follow-artist-btn"]');
    await expect(page.locator('[data-testid="artist-followed-success"]')).toBeVisible();
    
    // Activate alerts
    await page.click('[data-testid="activate-alerts-btn"]');
    await expect(page.locator('[data-testid="alerts-activated-success"]')).toBeVisible();
  });

  // Public Flow: Export to calendar
  test('should export event to calendar (.ics)', async ({ page }) => {
    await page.goto('/evento/show-rock-test');
    
    // Start download when clicking calendar export
    const downloadPromise = page.waitForDownload();
    await page.click('[data-testid="export-calendar-btn"]');
    const download = await downloadPromise;
    
    // Verify .ics file is downloaded
    expect(download.suggestedFilename()).toContain('.ics');
  });

  // Public Flow: Ticket purchase flow
  test('should handle ticket purchase flow without breaking', async ({ page }) => {
    await page.goto('/evento/show-rock-test');
    
    // Click ticket button (should open in new tab)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="buy-tickets-btn"]')
    ]);
    
    // Verify external ticket URL opened
    await expect(newPage).toHaveURL(/ingressos\.com/);
    
    // Close popup and verify original page is still functional
    await newPage.close();
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
  });

  // Error States: Search without results
  test('should handle search without results gracefully', async ({ page }) => {
    await page.goto('/agenda');
    
    // Search for something that doesn't exist
    await page.fill('[data-testid="search-input"]', 'evento-inexistente-xyz123');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Should show empty state
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results-illustration"]')).toBeVisible();
  });

  // Error States: Profile without upcoming events
  test('should handle artist profile without upcoming events', async ({ page }) => {
    await page.goto('/artista/artista-sem-eventos');
    
    // Should show empty state for events
    await expect(page.locator('[data-testid="no-upcoming-events"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggest-follow"]')).toBeVisible();
  });

  // User Account: Social login
  test('should handle social login flow', async ({ page }) => {
    await page.goto('/login');
    
    // Mock Google OAuth
    await page.route('**/auth/v1/authorize**', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/dashboard?success=true'
        }
      });
    });
    
    await page.click('[data-testid="google-login-btn"]');
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard?success=true');
  });

  // User Account: Update preferences
  test('should update user preferences', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('sb-nutlcbnruabjsxecqpnd-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/conta/preferencias');
    
    // Update city preferences
    await page.click('[data-testid="city-preference-sao-paulo"]');
    await page.click('[data-testid="city-preference-rio-de-janeiro"]');
    
    // Update event type preferences
    await page.click('[data-testid="event-type-musica"]');
    await page.click('[data-testid="event-type-teatro"]');
    
    // Update price range
    await page.fill('[data-testid="max-price-input"]', '100');
    
    await page.click('[data-testid="save-preferences"]');
    
    await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible();
  });
});