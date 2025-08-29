import { test, expect, type Page } from '@playwright/test';

// Test admin credentials
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'TestPassword123!';

class AdminHelper {
  constructor(private page: Page) {}

  async loginV3() {
    await this.page.goto('/admin-v3/login');
    await this.page.fill('input[type="email"]', ADMIN_EMAIL);
    await this.page.fill('input[type="password"]', ADMIN_PASSWORD);
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login - should redirect to admin v3 dashboard
    await this.page.waitForURL('/admin-v3');
    await expect(this.page.locator('h1')).toContainText('Dashboard Admin V3');
  }

  async waitForToast(message: string) {
    await expect(this.page.locator('[data-sonner-toaster]')).toContainText(message);
  }

  async fillFormField(name: string, value: string) {
    await this.page.fill(`input[name="${name}"], textarea[name="${name}"]`, value);
  }

  async selectFromDropdown(name: string, value: string) {
    await this.page.click(`[data-testid="${name}-select"]`);
    await this.page.click(`[data-value="${value}"]`);
  }

  async selectRadio(name: string, value: string) {
    await this.page.click(`input[name="${name}"][value="${value}"]`);
  }
}

test.describe('Agents and Events Smoke Tests', () => {
  let adminHelper: AdminHelper;
  let artistSlug: string;
  let venueSlug: string;
  let organizerSlug: string;

  test.beforeEach(async ({ page }) => {
    adminHelper = new AdminHelper(page);
    await adminHelper.loginV3();
  });

  test('should create artist agent successfully', async ({ page }) => {
    const timestamp = Date.now();
    artistSlug = `test-artist-${timestamp}`;
    
    // Navigate to agents creation
    await page.goto('/admin-v3/agentes');
    await expect(page.locator('h1')).toContainText('Criar Agente');

    // Select artist type
    await adminHelper.selectRadio('agent_type', 'artist');

    // Fill basic information
    await adminHelper.fillFormField('name', `Test Artist ${timestamp}`);
    await adminHelper.fillFormField('slug', artistSlug);
    await page.click('[data-testid="city-select"]');
    await page.click('[data-value="São Paulo"]');
    await adminHelper.fillFormField('instagram', 'testartist');
    await adminHelper.fillFormField('whatsapp', '(11) 99999-9999');
    await adminHelper.fillFormField('email', `artist${timestamp}@test.com`);
    await adminHelper.fillFormField('website', 'https://testartist.com');
    await adminHelper.fillFormField('bio_short', 'Artista de teste para smoke tests');

    // Fill artist-specific fields
    await page.click('[data-testid="artist_subtype-select"]');
    await page.click('[data-value="banda"]');
    await adminHelper.fillFormField('profile_image_url', 'https://test.com/artist.jpg');
    await adminHelper.fillFormField('spotify_url', 'https://open.spotify.com/artist/test');

    // Wait for slug validation
    await expect(page.locator('text=Slug disponível')).toBeVisible();

    // Submit form
    await page.click('button:has-text("Salvar Agente")');
    
    // Verify success
    await adminHelper.waitForToast('Artista criado com sucesso');
  });

  test('should create venue agent successfully', async ({ page }) => {
    const timestamp = Date.now();
    venueSlug = `test-venue-${timestamp}`;
    
    await page.goto('/admin-v3/agentes');

    // Select venue type
    await adminHelper.selectRadio('agent_type', 'venue');

    // Fill basic information
    await adminHelper.fillFormField('name', `Test Venue ${timestamp}`);
    await adminHelper.fillFormField('slug', venueSlug);
    await page.click('[data-testid="city-select"]');
    await page.click('[data-value="Rio de Janeiro"]');
    await adminHelper.fillFormField('instagram', 'testvenue');
    await adminHelper.fillFormField('whatsapp', '(21) 88888-8888');
    await adminHelper.fillFormField('email', `venue${timestamp}@test.com`);
    await adminHelper.fillFormField('website', 'https://testvenue.com');
    await adminHelper.fillFormField('bio_short', 'Local de teste para smoke tests');

    // Fill venue-specific fields
    await page.click('[data-testid="venue_type-select"]');
    await page.click('[data-value="casa_de_shows"]');
    await adminHelper.fillFormField('address', 'Rua Test, 123');
    await adminHelper.fillFormField('neighborhood', 'Centro');
    await adminHelper.fillFormField('capacity', '500');

    // Wait for slug validation
    await expect(page.locator('text=Slug disponível')).toBeVisible();

    // Submit form
    await page.click('button:has-text("Salvar Agente")');
    
    // Verify success
    await adminHelper.waitForToast('Local criado com sucesso');
  });

  test('should create organizer agent successfully', async ({ page }) => {
    const timestamp = Date.now();
    organizerSlug = `test-organizer-${timestamp}`;
    
    await page.goto('/admin-v3/agentes');

    // Select organizer type
    await adminHelper.selectRadio('agent_type', 'organizer');

    // Fill basic information
    await adminHelper.fillFormField('name', `Test Organizer ${timestamp}`);
    await adminHelper.fillFormField('slug', organizerSlug);
    await page.click('[data-testid="city-select"]');
    await page.click('[data-value="Belo Horizonte"]');
    await adminHelper.fillFormField('instagram', 'testorganizer');
    await adminHelper.fillFormField('whatsapp', '(31) 77777-7777');
    await adminHelper.fillFormField('email', `organizer${timestamp}@test.com`);
    await adminHelper.fillFormField('website', 'https://testorganizer.com');
    await adminHelper.fillFormField('bio_short', 'Organizador de teste para smoke tests');

    // Fill organizer-specific fields
    await page.click('[data-testid="organizer_subtype-select"]');
    await page.click('[data-value="produtora"]');
    await adminHelper.fillFormField('booking_email', `booking${timestamp}@test.com`);
    await adminHelper.fillFormField('booking_whatsapp', '(31) 66666-6666');

    // Wait for slug validation
    await expect(page.locator('text=Slug disponível')).toBeVisible();

    // Submit form
    await page.click('button:has-text("Salvar Agente")');
    
    // Verify success
    await adminHelper.waitForToast('Organizador criado com sucesso');
  });

  test('should create venue via modal in event form', async ({ page }) => {
    const timestamp = Date.now();
    
    // Navigate to event integration test page
    await page.goto('/test/agenda-integration');
    await expect(page.locator('h1')).toContainText('Teste de Integração - Formulário de Agenda');

    // Click "Cadastrar novo" button in venue combobox
    await page.click('button:has-text("Cadastrar novo local")');
    
    // Verify modal opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Criar Agente')).toBeVisible();

    // Venue should be pre-selected
    await expect(page.locator('input[value="venue"]:checked')).toBeVisible();

    // Fill venue information in modal
    await adminHelper.fillFormField('name', `Modal Venue ${timestamp}`);
    // Slug should auto-generate
    await adminHelper.fillFormField('instagram', 'modalvenue');
    await adminHelper.fillFormField('whatsapp', '(11) 55555-5555');
    await adminHelper.fillFormField('email', `modalvenue${timestamp}@test.com`);
    await adminHelper.fillFormField('bio_short', 'Venue criado via modal para teste');

    // Fill venue-specific fields
    await page.click('[data-testid="venue_type-select"]');
    await page.click('[data-value="bar"]');
    await adminHelper.fillFormField('address', 'Avenida Modal, 456');

    // Submit modal form
    await page.click('button:has-text("Salvar")');
    
    // Verify modal closes and venue is selected in combobox
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await adminHelper.waitForToast('Local criado com sucesso');
    
    // Check that the venue appears in the combobox
    await expect(page.locator('input[role="combobox"]')).toContainText(`Modal Venue ${timestamp}`);
  });

  test('should publish event with organizer and venue', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.goto('/test/agenda-integration');

    // Fill basic event information
    await adminHelper.fillFormField('title', `Test Event ${timestamp}`);
    await adminHelper.fillFormField('subtitle', 'Smoke test event');
    await adminHelper.fillFormField('summary', 'This is a comprehensive smoke test for event creation with all agent types');

    // Fill event details
    await page.click('[data-testid="city-select"]');
    await page.click('[data-value="São Paulo"]');

    // Set event dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().slice(0, 16);

    await page.fill('input[name="start_at"]', tomorrowStr);
    await page.fill('input[name="end_at"]', dayAfterStr);

    // Fill pricing
    await adminHelper.fillFormField('price_min', '25');
    await adminHelper.fillFormField('price_max', '50');

    // Add artist names (should be chips)
    await adminHelper.fillFormField('artists_names', 'Test Artist 1, Test Artist 2, Test Artist 3');

    // Select organizer (search for previously created)
    await page.click('[data-testid="organizer-combobox"] input');
    await page.type('[data-testid="organizer-combobox"] input', 'Test Organizer');
    await page.waitForTimeout(500); // Wait for search results
    await page.click('[role="option"]:first-child');

    // Select venue (search for previously created)
    await page.click('[data-testid="venue-combobox"] input');
    await page.type('[data-testid="venue-combobox"] input', 'Test Venue');
    await page.waitForTimeout(500); // Wait for search results
    await page.click('[role="option"]:first-child');

    // Fill additional event info
    await adminHelper.fillFormField('location_name', 'Test Location');
    await adminHelper.fillFormField('ticket_url', 'https://tickets.test.com');

    // Fill metadata
    await adminHelper.fillFormField('meta_title', `Test Event ${timestamp} - Meta Title`);
    await adminHelper.fillFormField('meta_description', 'Meta description for smoke test event');

    // Publish event
    await page.click('button:has-text("Publicar")');
    
    // Verify success
    await adminHelper.waitForToast('Evento publicado com sucesso');
    
    // Verify no RLS or slug errors appeared
    await expect(page.locator('text=violates row-level security')).not.toBeVisible();
    await expect(page.locator('text=slug já existe')).not.toBeVisible();
    await expect(page.locator('text=infinite recursion')).not.toBeVisible();
  });

  test('should handle validation errors gracefully', async ({ page }) => {
    await page.goto('/admin-v3/agentes');

    // Try to create artist without required fields
    await adminHelper.selectRadio('agent_type', 'artist');
    
    // Only fill name to trigger other validations
    await adminHelper.fillFormField('name', 'Incomplete Artist');
    
    // Submit without other required fields
    await page.click('button:has-text("Salvar Agente")');
    
    // Should show validation errors without crashing
    await expect(page.locator('text=Instagram é obrigatório')).toBeVisible();
    await expect(page.locator('text=WhatsApp é obrigatório')).toBeVisible();
    await expect(page.locator('text=Email inválido')).toBeVisible();
    
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('Criar Agente');
  });

  test('should handle duplicate slug detection', async ({ page }) => {
    const duplicateSlug = 'duplicate-test-slug';
    
    await page.goto('/admin-v3/agentes');

    // Create first agent with specific slug
    await adminHelper.selectRadio('agent_type', 'artist');
    await adminHelper.fillFormField('name', 'First Artist');
    await adminHelper.fillFormField('slug', duplicateSlug);
    await adminHelper.fillFormField('instagram', 'firstartist');
    await adminHelper.fillFormField('whatsapp', '(11) 11111-1111');
    await adminHelper.fillFormField('email', 'first@test.com');
    await adminHelper.fillFormField('bio_short', 'First artist');
    
    await page.click('[data-testid="artist_subtype-select"]');
    await page.click('[data-value="solo"]');
    await adminHelper.fillFormField('profile_image_url', 'https://test.com/first.jpg');

    await page.click('button:has-text("Salvar Agente")');
    await adminHelper.waitForToast('Artista criado com sucesso');

    // Try to create second agent with same slug
    await page.reload();
    await adminHelper.selectRadio('agent_type', 'venue');
    await adminHelper.fillFormField('name', 'Second Venue');
    await adminHelper.fillFormField('slug', duplicateSlug);
    
    // Should show slug is taken
    await expect(page.locator('text=Slug já está em uso')).toBeVisible();
    
    // Save button should be disabled
    await expect(page.locator('button:has-text("Salvar Agente")')).toBeDisabled();
  });
});

test.afterAll(async () => {
  console.log('Agents and Events smoke tests completed');
});