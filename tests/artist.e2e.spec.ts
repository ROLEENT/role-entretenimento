import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';

const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin.e2e@role.test';
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'RoleE2E!2025';

test.describe('Artist Management E2E', () => {
  let artistName: string;
  let artistSlug: string;

  test.beforeAll(async () => {
    // Run seed script to ensure test admin exists
    console.log('🌱 Setting up test admin...');
    try {
      execSync('npm run seed:e2e', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to seed test admin:', error);
      throw error;
    }
  });

  test.beforeEach(async ({ page }) => {
    // Generate unique artist name for this test run
    artistName = `E2E - Artista ${Date.now()}`;
    artistSlug = artistName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Login as admin
    await page.goto('/admin-v3/login');
    
    // Fill login form
    await page.fill('input[type="email"]', E2E_ADMIN_EMAIL);
    await page.fill('input[type="password"]', E2E_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await page.waitForURL('**/admin-v3**', { timeout: 10000 });
    
    // Verify we're logged in by checking for admin interface
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('creates artist with new categories and genres', async ({ page }) => {
    // Navigate to create artist page
    await page.goto('/admin-v3/agentes/artistas/new');
    
    // Wait for form to be visible
    await expect(page.locator('#artist-form')).toBeVisible();
    
    // Fill required basic information
    await page.fill('[data-testid="artist-name"]', artistName);
    
    // Fill handle (will auto-generate slug)
    const handle = artistName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '');
    await page.fill('input[name="handle"]', handle);
    
    // Select artist type
    await page.click('button[role="combobox"]');
    await page.click('text=DJ');
    
    // Test creating new category
    await page.click('[data-testid="artist-categories"]');
    await page.fill('[data-testid="artist-categories"] input', 'Produtor Visual E2E');
    await page.keyboard.press('Enter');
    
    // Verify category chip appears
    await expect(page.locator('text=Produtor Visual E2E')).toBeVisible();
    
    // Test creating new genre
    await page.click('[data-testid="artist-genres"]');
    await page.fill('[data-testid="artist-genres"] input', 'Techno Industrial E2E');
    await page.keyboard.press('Enter');
    
    // Verify genre chip appears
    await expect(page.locator('text=Techno Industrial E2E')).toBeVisible();
    
    // Fill required contact fields
    await page.fill('[data-testid="artist-city"]', 'São Paulo');
    await page.fill('input[name="whatsapp"]', '(11) 99999-9999');
    await page.fill('input[name="instagram"]', 'teste-e2e');
    
    // Fill required bio
    await page.fill('textarea[name="bio_short"]', 'Bio de teste para artista E2E criado automaticamente durante os testes.');
    
    // Navigate to Media tab and add a link
    await page.click('text=Mídia & Links');
    await page.fill('input[name="links.website"]', 'https://example.com');
    
    // Submit the form
    await page.click('[data-testid="artist-save"]');
    
    // Wait for success toast
    await expect(page.locator('[data-testid="toast-success"], .toast, [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
    
    // Verify redirect or success indicator
    await page.waitForURL('**/admin-v3/agentes/artistas**', { timeout: 10000 });
    
    console.log(`✅ Successfully created artist: ${artistName}`);
  });

  test('edits artist and persists changes', async ({ page }) => {
    // First create an artist to edit
    await page.goto('/admin-v3/agentes/artistas/new');
    await expect(page.locator('#artist-form')).toBeVisible();
    
    // Create basic artist
    await page.fill('[data-testid="artist-name"]', artistName);
    const handle = artistName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '');
    await page.fill('input[name="handle"]', handle);
    
    await page.click('button[role="combobox"]');
    await page.click('text=DJ');
    
    await page.fill('[data-testid="artist-city"]', 'Rio de Janeiro');
    await page.fill('input[name="whatsapp"]', '(21) 99999-9999');
    await page.fill('input[name="instagram"]', 'teste-e2e-edit');
    await page.fill('textarea[name="bio_short"]', 'Bio inicial para teste de edição.');
    
    // Add minimal required fields
    await page.click('[data-testid="artist-categories"]');
    await page.fill('[data-testid="artist-categories"] input', 'DJ E2E');
    await page.keyboard.press('Enter');
    
    await page.click('[data-testid="artist-save"]');
    await expect(page.locator('[data-testid="toast-success"], .toast, [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
    
    // Wait for page to load after save
    await page.waitForTimeout(2000);
    
    // Now edit the artist
    await page.fill('[data-testid="artist-city"]', 'Porto Alegre');
    
    // Add another existing category
    await page.click('[data-testid="artist-categories"]');
    await page.fill('[data-testid="artist-categories"] input', 'Músico E2E');
    await page.keyboard.press('Enter');
    
    // Save changes
    await page.click('[data-testid="artist-save"]');
    await expect(page.locator('[data-testid="toast-success"], .toast, [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
    
    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify changes persisted
    await expect(page.locator('[data-testid="artist-city"]')).toHaveValue('Porto Alegre');
    await expect(page.locator('text=Músico E2E')).toBeVisible();
    
    console.log(`✅ Successfully edited artist: ${artistName}`);
  });

  test('validates required fields and shows clear errors', async ({ page }) => {
    // Navigate to create artist page
    await page.goto('/admin-v3/agentes/artistas/new');
    await expect(page.locator('#artist-form')).toBeVisible();
    
    // Try to submit without filling required fields
    await page.click('[data-testid="artist-save"]');
    
    // Should show validation errors
    await expect(page.locator('.toast, [data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    
    // Should scroll to first error field
    await expect(page.locator('[data-testid="artist-name"]')).toBeFocused();
    
    console.log('✅ Validation errors shown correctly');
  });

  test('handles save button states correctly', async ({ page }) => {
    await page.goto('/admin-v3/agentes/artistas/new');
    await expect(page.locator('#artist-form')).toBeVisible();
    
    // Initially save button should be enabled
    await expect(page.locator('[data-testid="artist-save"]')).not.toBeDisabled();
    
    // Fill minimal required fields
    await page.fill('[data-testid="artist-name"]', artistName);
    const handle = artistName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '');
    await page.fill('input[name="handle"]', handle);
    
    await page.click('button[role="combobox"]');
    await page.click('text=DJ');
    
    await page.fill('[data-testid="artist-city"]', 'São Paulo');
    await page.fill('input[name="whatsapp"]', '(11) 99999-9999');
    await page.fill('input[name="instagram"]', 'teste-button-states');
    await page.fill('textarea[name="bio_short"]', 'Bio para teste de estados do botão.');
    
    await page.click('[data-testid="artist-categories"]');
    await page.fill('[data-testid="artist-categories"] input', 'Teste Estado');
    await page.keyboard.press('Enter');
    
    // Click save and verify button becomes disabled during loading
    await page.click('[data-testid="artist-save"]');
    
    // Button should be disabled and show loading state
    await expect(page.locator('[data-testid="artist-save"]')).toBeDisabled();
    await expect(page.locator('[data-testid="artist-save"]')).toContainText('Salvando...');
    
    // Wait for operation to complete
    await expect(page.locator('[data-testid="toast-success"], .toast, [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Save button states handled correctly');
  });

  test.afterAll(async () => {
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    try {
      execSync('npm run cleanup:e2e', { stdio: 'inherit' });
    } catch (error) {
      console.warn('Failed to cleanup test data:', error);
    }
  });
});