import { test, expect } from '@playwright/test';

test.describe('Event Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin-v3/login');
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navegar para criação de eventos
    await page.goto('/admin-v3/eventos/criar');
  });

  test('should create a complete event successfully', async ({ page }) => {
    // Etapa 1: Informações Básicas
    await page.fill('[data-testid="title-input"]', 'Festival Test 2024');
    await page.fill('[data-testid="subtitle-input"]', 'O maior festival de teste');
    await page.fill('[data-testid="description-textarea"]', 'Descrição completa do evento de teste');
    
    // Upload de imagem
    await page.setInputFiles('[data-testid="cover-upload"]', 'test/fixtures/event-cover.jpg');
    
    await page.click('[data-testid="next-step-button"]');

    // Etapa 2: Local e Data
    await page.fill('[data-testid="venue-search"]', 'Memorial da América Latina');
    await page.click('[data-testid="venue-option-0"]'); // Primeiro resultado
    
    await page.fill('[data-testid="date-start"]', '2024-12-15T20:00');
    await page.fill('[data-testid="date-end"]', '2024-12-15T23:59');
    
    await page.click('[data-testid="next-step-button"]');

    // Etapa 3: Lineup
    await page.click('[data-testid="add-lineup-slot"]');
    await page.fill('[data-testid="slot-name-0"]', 'Palco Principal');
    
    await page.fill('[data-testid="artist-search-0"]', 'DJ Test');
    await page.click('[data-testid="add-artist-0"]');
    
    await page.click('[data-testid="next-step-button"]');

    // Etapa 4: Parceiros
    await page.click('[data-testid="add-partner"]');
    await page.fill('[data-testid="partner-search-0"]', 'Produtora Test');
    await page.selectOption('[data-testid="partner-role-0"]', 'organizer');
    
    await page.click('[data-testid="next-step-button"]');

    // Etapa 5: Detalhes
    await page.fill('[data-testid="price-min"]', '50');
    await page.fill('[data-testid="price-max"]', '150');
    await page.fill('[data-testid="ticket-url"]', 'https://ingressos.test.com');
    
    await page.click('[data-testid="next-step-button"]');

    // Etapa 6: Revisão e Publicação
    await expect(page.locator('[data-testid="event-title-preview"]')).toContainText('Festival Test 2024');
    await expect(page.locator('[data-testid="checklist-basic-info"]')).toHaveClass(/.*success.*/);
    
    await page.click('[data-testid="publish-button"]');
    
    // Verificar sucesso
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin-v3\/eventos$/);
  });

  test('should validate required fields', async ({ page }) => {
    // Tentar ir para próxima etapa sem preencher título
    await page.click('[data-testid="next-step-button"]');
    
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Título é obrigatório');
    await expect(page.locator('[data-testid="step-indicator-1"]')).not.toHaveClass(/.*active.*/);
  });

  test('should save as draft', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', 'Evento Rascunho');
    await page.fill('[data-testid="description-textarea"]', 'Evento em desenvolvimento');
    
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[data-testid="draft-saved-message"]')).toBeVisible();
  });

  test('should handle venue search', async ({ page }) => {
    // Ir para etapa de local
    await page.fill('[data-testid="title-input"]', 'Test Event');
    await page.click('[data-testid="next-step-button"]');
    
    // Buscar venue
    await page.fill('[data-testid="venue-search"]', 'Memorial');
    
    // Aguardar resultados aparecerem
    await expect(page.locator('[data-testid="venue-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue-option-0"]')).toContainText('Memorial');
    
    // Selecionar venue
    await page.click('[data-testid="venue-option-0"]');
    
    await expect(page.locator('[data-testid="selected-venue"]')).toContainText('Memorial');
  });

  test('should handle lineup drag and drop', async ({ page }) => {
    // Setup até etapa de lineup
    await page.fill('[data-testid="title-input"]', 'Test Event');
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="venue-search"]', 'Test Venue');
    await page.click('[data-testid="venue-option-0"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Adicionar múltiplos slots
    await page.click('[data-testid="add-lineup-slot"]');
    await page.fill('[data-testid="slot-name-0"]', 'Slot 1');
    
    await page.click('[data-testid="add-lineup-slot"]');
    await page.fill('[data-testid="slot-name-1"]', 'Slot 2');
    
    // Testar drag and drop
    const slot1 = page.locator('[data-testid="slot-item-0"]');
    const slot2 = page.locator('[data-testid="slot-item-1"]');
    
    await slot1.dragTo(slot2);
    
    // Verificar ordem alterada
    await expect(page.locator('[data-testid="slot-item-0"] [data-testid="slot-name"]')).toContainText('Slot 2');
    await expect(page.locator('[data-testid="slot-item-1"] [data-testid="slot-name"]')).toContainText('Slot 1');
  });

  test('should handle partner roles correctly', async ({ page }) => {
    // Setup até etapa de parceiros
    await page.fill('[data-testid="title-input"]', 'Test Event');
    await page.click('[data-testid="next-step-button"]');
    await page.click('[data-testid="skip-location-button"]');
    await page.click('[data-testid="skip-lineup-button"]');
    
    // Adicionar organizador
    await page.click('[data-testid="add-partner"]');
    await page.fill('[data-testid="partner-search-0"]', 'Organizadora Test');
    await page.selectOption('[data-testid="partner-role-0"]', 'organizer');
    await page.check('[data-testid="partner-main-0"]');
    
    // Adicionar patrocinador
    await page.click('[data-testid="add-partner"]');
    await page.fill('[data-testid="partner-search-1"]', 'Patrocinador Test');
    await page.selectOption('[data-testid="partner-role-1"]', 'sponsor');
    
    // Verificar badges aparecem corretamente
    await expect(page.locator('[data-testid="partner-badge-0"]')).toContainText('Organizador Principal');
    await expect(page.locator('[data-testid="partner-badge-1"]')).toContainText('Patrocinador');
  });

  test('should preview event correctly', async ({ page }) => {
    // Criar evento completo
    await page.fill('[data-testid="title-input"]', 'Preview Test Event');
    await page.fill('[data-testid="subtitle-input"]', 'Evento para teste de preview');
    await page.click('[data-testid="next-step-button"]');
    
    // Pular etapas para chegar no preview
    await page.click('[data-testid="skip-location-button"]');
    await page.click('[data-testid="skip-lineup-button"]');
    await page.click('[data-testid="skip-partners-button"]');
    await page.click('[data-testid="skip-details-button"]');
    
    // Verificar preview
    await expect(page.locator('[data-testid="preview-title"]')).toContainText('Preview Test Event');
    await expect(page.locator('[data-testid="preview-subtitle"]')).toContainText('Evento para teste de preview');
    
    // Testar botão de preview externo
    const previewButton = page.locator('[data-testid="external-preview-button"]');
    await expect(previewButton).toHaveAttribute('href', /\/preview\/eventos\/.+/);
  });
});

test.describe('Event Management', () => {
  test('should filter events correctly', async ({ page }) => {
    await page.goto('/admin-v3/eventos');
    
    // Filtrar por cidade
    await page.selectOption('[data-testid="city-filter"]', 'sao-paulo');
    await expect(page.locator('[data-testid="event-card"]')).toContainText('São Paulo');
    
    // Filtrar por status
    await page.selectOption('[data-testid="status-filter"]', 'published');
    await expect(page.locator('[data-testid="status-badge"]')).toContainText('Publicado');
    
    // Busca por texto
    await page.fill('[data-testid="search-input"]', 'festival');
    await expect(page.locator('[data-testid="event-title"]')).toContainText('festival', { ignoreCase: true });
  });

  test('should edit existing event', async ({ page }) => {
    await page.goto('/admin-v3/eventos');
    
    // Clicar no primeiro evento
    await page.click('[data-testid="event-card-0"] [data-testid="edit-button"]');
    
    // Verificar se formulário carrega com dados
    await expect(page.locator('[data-testid="title-input"]')).not.toHaveValue('');
    
    // Alterar título
    await page.fill('[data-testid="title-input"]', 'Título Editado');
    
    // Salvar
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should duplicate event', async ({ page }) => {
    await page.goto('/admin-v3/eventos');
    
    // Clicar em duplicar
    await page.click('[data-testid="event-card-0"] [data-testid="duplicate-button"]');
    
    // Verificar se abre formulário com dados copiados
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue(/Cópia de/);
    
    // Verificar se está em modo de criação
    await expect(page).toHaveURL(/\/criar$/);
  });
});