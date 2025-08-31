import { test, expect } from '@playwright/test';

test.describe('Agenda Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin-v3/login');
    
    // Mock successful login
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh',
          user: {
            id: 'mock-user-id',
            email: 'admin@test.com',
            role: 'admin'
          }
        })
      });
    });

    // Mock profile check
    await page.route('**/rest/v1/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          user_id: 'mock-user-id',
          role: 'admin',
          email: 'admin@test.com'
        }])
      });
    });

    // Mock cities data
    await page.route('**/rest/v1/cities**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'São Paulo', slug: 'sao-paulo' },
          { id: '2', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' }
        ])
      });
    });

    // Mock venues data
    await page.route('**/rest/v1/venues**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Teatro Municipal', city_id: '1' },
          { id: '2', name: 'Casa de Shows', city_id: '1' }
        ])
      });
    });

    // Login with mock credentials
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should create new agenda item with city and venue selection', async ({ page }) => {
    // Navigate to new agenda page
    await page.goto('/admin-v3/agenda/novo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="title"]');
    
    // Fill basic information
    await page.fill('input[name="title"]', 'Evento de Teste');
    await page.fill('input[name="slug"]', 'evento-de-teste');
    
    // Open city selector
    await page.click('[data-testid="city-select-trigger"]');
    await page.waitForSelector('[data-testid="city-select-option"]');
    await page.click('[data-testid="city-select-option"]:has-text("São Paulo")');
    
    // Open venue selector
    await page.click('[data-testid="venue-select-trigger"]');
    await page.waitForSelector('[data-testid="venue-select-option"]');
    await page.click('[data-testid="venue-select-option"]:has-text("Teatro Municipal")');
    
    // Set dates
    await page.fill('input[name="starts_at"]', '2024-12-25T20:00');
    await page.fill('input[name="ends_at"]', '2024-12-25T23:00');
    
    // Mock save draft API
    await page.route('**/rest/v1/agenda_itens**', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-event-id',
          title: 'Evento de Teste',
          slug: 'evento-de-teste',
          city_id: '1',
          venue_id: '1',
          status: 'draft'
        })
      });
    });
    
    // Save draft
    await page.click('button:has-text("Salvar rascunho")');
    
    // Wait for success message
    await page.waitForSelector('.sonner-toast:has-text("Rascunho salvo")');
    
    // Verify form values are preserved
    await expect(page.locator('input[name="title"]')).toHaveValue('Evento de Teste');
    await expect(page.locator('input[name="slug"]')).toHaveValue('evento-de-teste');
  });

  test('should reopen saved draft and verify values', async ({ page }) => {
    // Mock existing draft data
    await page.route('**/rest/v1/agenda_itens?id=eq.mock-event-id**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'mock-event-id',
          title: 'Evento Salvo',
          slug: 'evento-salvo',
          city_id: '1',
          venue_id: '1',
          starts_at: '2024-12-25T20:00:00Z',
          ends_at: '2024-12-25T23:00:00Z',
          status: 'draft'
        }])
      });
    });
    
    // Navigate to edit page
    await page.goto('/admin-v3/agenda/mock-event-id');
    
    // Wait for form to load with data
    await page.waitForSelector('input[name="title"]');
    
    // Verify values are loaded correctly
    await expect(page.locator('input[name="title"]')).toHaveValue('Evento Salvo');
    await expect(page.locator('input[name="slug"]')).toHaveValue('evento-salvo');
    await expect(page.locator('input[name="starts_at"]')).toHaveValue('2024-12-25T20:00');
    await expect(page.locator('input[name="ends_at"]')).toHaveValue('2024-12-25T23:00');
  });
});

test.describe('Venue Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Similar login setup as above
    await page.goto('/admin-v3/login');
    
    // Mock auth and basic data
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'mock-user-id', email: 'admin@test.com', role: 'admin' }
        })
      });
    });

    await page.route('**/rest/v1/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ user_id: 'mock-user-id', role: 'admin' }])
      });
    });

    await page.route('**/rest/v1/cities**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'São Paulo', slug: 'sao-paulo' },
          { id: '2', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' }
        ])
      });
    });

    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should create venue with city and type selection', async ({ page }) => {
    // Navigate to new venue page
    await page.goto('/admin-v3/venues/novo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="name"]');
    
    // Fill venue name
    await page.fill('input[name="name"]', 'Novo Teatro');
    await page.fill('input[name="slug"]', 'novo-teatro');
    
    // Select city
    await page.click('[data-testid="city-select-trigger"]');
    await page.waitForSelector('[data-testid="city-select-option"]');
    await page.click('[data-testid="city-select-option"]:has-text("São Paulo")');
    
    // Select venue type
    await page.click('[data-testid="venue-type-select-trigger"]');
    await page.waitForSelector('[data-testid="venue-type-option"]');
    await page.click('[data-testid="venue-type-option"]:has-text("Theater")');
    
    // Fill address
    await page.fill('input[name="address"]', 'Rua das Flores, 123');
    
    // Mock save API
    await page.route('**/rest/v1/venues**', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-venue-id',
          name: 'Novo Teatro',
          slug: 'novo-teatro',
          city_id: '1',
          venue_type: 'theater',
          address: 'Rua das Flores, 123'
        })
      });
    });
    
    // Save venue
    await page.click('button:has-text("Salvar e voltar")');
    
    // Wait for success message
    await page.waitForSelector('.sonner-toast:has-text("salvo com sucesso")');
  });
});

test.describe('Revista (Blog Post) Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Similar login setup
    await page.goto('/admin-v3/login');
    
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'mock-user-id', email: 'admin@test.com', role: 'admin' }
        })
      });
    });

    await page.route('**/rest/v1/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ user_id: 'mock-user-id', role: 'admin' }])
      });
    });

    // Mock categories
    await page.route('**/rest/v1/categories**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Música', slug: 'musica', kind: 'revista' },
          { id: 2, name: 'Cultura', slug: 'cultura', kind: 'revista' }
        ])
      });
    });

    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should create blog post with category and cover', async ({ page }) => {
    // Navigate to new post page
    await page.goto('/admin-v3/revista/novo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="title"]');
    
    // Fill post title
    await page.fill('input[name="title"]', 'Artigo de Teste');
    await page.fill('input[name="slug"]', 'artigo-de-teste');
    
    // Select category
    await page.click('[data-testid="category-select-trigger"]');
    await page.waitForSelector('[data-testid="category-select-option"]');
    await page.click('[data-testid="category-select-option"]:has-text("Música")');
    
    // Fill content
    await page.fill('textarea[name="excerpt"]', 'Resumo do artigo de teste');
    await page.fill('textarea[name="content"]', 'Conteúdo completo do artigo');
    
    // Mock file upload for cover
    await page.route('**/storage/v1/object/blog-covers/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Key: 'blog-covers/mock-cover.jpg'
        })
      });
    });

    await page.route('**/storage/v1/object/public/blog-covers/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          publicUrl: 'https://example.com/mock-cover.jpg'
        })
      });
    });
    
    // Upload cover image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-cover.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock-image-data')
    });
    
    // Mock save API
    await page.route('**/rest/v1/blog_posts**', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-post-id',
          title: 'Artigo de Teste',
          slug: 'artigo-de-teste',
          category_ids: [1],
          cover_image: 'https://example.com/mock-cover.jpg',
          status: 'draft'
        })
      });
    });
    
    // Save draft
    await page.click('button:has-text("Salvar rascunho")');
    
    // Wait for success message
    await page.waitForSelector('.sonner-toast:has-text("salvo com sucesso")');
    
    // Verify form values
    await expect(page.locator('input[name="title"]')).toHaveValue('Artigo de Teste');
    await expect(page.locator('input[name="slug"]')).toHaveValue('artigo-de-teste');
  });
});