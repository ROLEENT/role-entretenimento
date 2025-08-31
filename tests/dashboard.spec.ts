import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('redirects anonymous users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('loads dashboard for authenticated users', async ({ page }) => {
    // Mock authentication for testing
    await page.goto('/');
    
    // Add mock auth state - this would need to be adjusted based on actual auth implementation
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('displays KPI cards', async ({ page }) => {
    // Setup mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Check for KPI cards
    await expect(page.locator('[data-testid="kpi-card"]').first()).toBeVisible();
    
    // Should have at least 3 KPI cards (published, scheduled, draft, agents)
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards).toHaveCount(4);
  });

  test('displays Quick Actions section', async ({ page }) => {
    // Setup mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Check for Quick Actions
    await expect(page.locator('text=Ações Rápidas')).toBeVisible();
    
    // Should have action buttons
    await expect(page.locator('text=Nova Agenda')).toBeVisible();
    await expect(page.locator('text=Novo Artista')).toBeVisible();
    await expect(page.locator('text=Nova Revista')).toBeVisible();
  });

  test('displays Recent Activity table or empty state', async ({ page }) => {
    // Setup mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Check for Activity section
    await expect(page.locator('text=Atividade Recente')).toBeVisible();
    
    // Should either show table with data or empty state
    const hasTable = await page.locator('table').isVisible();
    const hasEmptyState = await page.locator('text=Nenhuma atividade recente').isVisible();
    
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('displays Health Card', async ({ page }) => {
    // Setup mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Check for Health Card
    await expect(page.locator('text=Saúde do Sistema')).toBeVisible();
    
    // Should show status indicators
    await expect(page.locator('text=Banco')).toBeVisible();
    await expect(page.locator('text=Storage')).toBeVisible();
    await expect(page.locator('text=Versão do schema')).toBeVisible();
  });

  test('displays Events Weekly Chart', async ({ page }) => {
    // Setup mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@test.com' }
      }));
    });

    await page.goto('/dashboard');
    
    // Check for Charts section
    await expect(page.locator('text=Eventos por Semana')).toBeVisible();
    
    // Should show either chart or empty state
    const hasChart = await page.locator('.recharts-wrapper').isVisible();
    const hasEmptyChart = await page.locator('text=Nenhum evento encontrado').isVisible();
    
    expect(hasChart || hasEmptyChart).toBeTruthy();
  });
});