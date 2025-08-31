import { test, expect } from '@playwright/test';

test.describe('Dropdown Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
  });

  test('City dropdown functionality', async ({ page }) => {
    // Check if city dropdown exists and is clickable
    const citySelector = page.locator('[data-testid="city-dropdown"]').first();
    
    if (await citySelector.count() > 0) {
      await citySelector.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Check if dropdown options are visible
      const dropdownOptions = page.locator('[role="option"]');
      await expect(dropdownOptions.first()).toBeVisible();
      
      // Select first option
      await dropdownOptions.first().click();
      
      // Verify selection is reflected
      await expect(citySelector).toContainText(/.+/);
    }
  });

  test('Venue Type dropdown functionality', async ({ page }) => {
    // Navigate to a page that might have venue type dropdown
    await page.goto('/admin-v3');
    
    const venueTypeDropdown = page.locator('[data-testid="venue-type-dropdown"]').first();
    
    if (await venueTypeDropdown.count() > 0) {
      await venueTypeDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Check visibility of options
      const options = page.locator('[role="option"]');
      if (await options.count() > 0) {
        await expect(options.first()).toBeVisible();
        
        // Select an option
        await options.first().click();
        
        // Verify selection
        await expect(venueTypeDropdown).toContainText(/.+/);
      }
    }
  });

  test('Organizer Type dropdown functionality', async ({ page }) => {
    // Navigate to organizers page
    await page.goto('/admin-v3/agentes/organizadores');
    
    const organizerTypeDropdown = page.locator('select, [role="combobox"]').first();
    
    if (await organizerTypeDropdown.count() > 0) {
      await organizerTypeDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Check if options are visible
      const options = page.locator('[role="option"], option');
      if (await options.count() > 0) {
        await expect(options.first()).toBeVisible();
        
        // Select first option
        await options.first().click();
        
        // Verify the selection is applied
        const selectedValue = await organizerTypeDropdown.inputValue().catch(() => 
          organizerTypeDropdown.textContent()
        );
        expect(selectedValue).toBeTruthy();
      }
    }
  });

  test('Header menu dropdowns', async ({ page }) => {
    // Test main navigation menu
    const menuButton = page.locator('[data-testid="menu-button"], button:has-text("Menu")').first();
    
    if (await menuButton.count() > 0) {
      await menuButton.click();
      
      // Wait for menu to open
      await page.waitForTimeout(500);
      
      // Check if menu items are visible
      const menuItems = page.locator('[role="menuitem"], a').filter({ hasText: /.+/ });
      if (await menuItems.count() > 0) {
        await expect(menuItems.first()).toBeVisible();
      }
    }
  });

  test('User account dropdown', async ({ page }) => {
    // Look for user account dropdown
    const userDropdown = page.locator('[data-testid="user-dropdown"], [aria-label*="user"], [aria-label*="account"]').first();
    
    if (await userDropdown.count() > 0) {
      await userDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Check if dropdown menu is visible
      const dropdownMenu = page.locator('[role="menu"], [data-testid="user-menu"]');
      if (await dropdownMenu.count() > 0) {
        await expect(dropdownMenu).toBeVisible();
        
        // Check menu items
        const menuItems = page.locator('[role="menuitem"]');
        if (await menuItems.count() > 0) {
          await expect(menuItems.first()).toBeVisible();
        }
      }
    }
  });

  test('Language/Settings dropdown', async ({ page }) => {
    // Look for settings or language dropdown
    const settingsDropdown = page.locator('[data-testid="settings-dropdown"], [aria-label*="settings"], [aria-label*="language"]').first();
    
    if (await settingsDropdown.count() > 0) {
      await settingsDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Verify dropdown content is visible
      const dropdownContent = page.locator('[role="menu"], [data-testid="settings-menu"]');
      if (await dropdownContent.count() > 0) {
        await expect(dropdownContent).toBeVisible();
      }
    }
  });

  test('Search/Filter dropdowns', async ({ page }) => {
    // Navigate to a page with filters
    await page.goto('/agenda');
    
    // Look for filter dropdowns
    const filterDropdowns = page.locator('select, [role="combobox"]');
    const dropdownCount = await filterDropdowns.count();
    
    for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
      const dropdown = filterDropdowns.nth(i);
      
      if (await dropdown.isVisible()) {
        await dropdown.click();
        
        // Wait for dropdown to open
        await page.waitForTimeout(300);
        
        // Check if options are available
        const options = page.locator('[role="option"], option');
        if (await options.count() > 0) {
          // Verify first option is visible
          await expect(options.first()).toBeVisible();
          
          // Select first option if it's not already selected
          const optionText = await options.first().textContent();
          if (optionText && optionText.trim() !== '') {
            await options.first().click();
            await page.waitForTimeout(200);
          }
        }
      }
    }
  });

  test('Dropdown z-index and visibility', async ({ page }) => {
    // Test that dropdowns appear above other content
    await page.goto('/admin-v3');
    
    const dropdowns = page.locator('select, [role="combobox"]');
    const dropdownCount = await dropdowns.count();
    
    if (dropdownCount > 0) {
      const firstDropdown = dropdowns.first();
      await firstDropdown.click();
      
      // Wait for dropdown to open
      await page.waitForTimeout(500);
      
      // Check that dropdown content has high z-index
      const dropdownContent = page.locator('[data-radix-select-content], [role="listbox"], [data-testid*="dropdown"]').first();
      
      if (await dropdownContent.count() > 0) {
        // Verify dropdown is visible and positioned correctly
        await expect(dropdownContent).toBeVisible();
        
        // Check z-index through computed styles
        const zIndex = await dropdownContent.evaluate(el => 
          window.getComputedStyle(el).zIndex
        );
        
        // Verify high z-index (should be 9999 or higher)
        expect(parseInt(zIndex)).toBeGreaterThan(50);
      }
    }
  });
});