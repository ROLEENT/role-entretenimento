import { test, expect } from '@playwright/test';

test.describe('Revista ROLÊ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/revista');
  });

  test('deve exibir título e descrição da revista', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Revista ROLÊ' })).toBeVisible();
    await expect(page.getByText('Mergulhos profundos em cultura')).toBeVisible();
  });

  test('navegação por chips de seção', async ({ page }) => {
    // Clicar no chip Editorial
    await page.getByRole('link', { name: 'Editorial' }).click();
    await expect(page).toHaveURL(/secao=editorial/);
    
    // Verificar que o chip está ativo
    await expect(page.getByRole('link', { name: 'Editorial' })).toHaveAttribute('aria-current', 'page');
    
    // Clicar em "Todos" para resetar
    await page.getByRole('link', { name: 'Todos' }).click();
    await expect(page).toHaveURL(/^[^?]*(\?(?!.*secao=).*)?$/);
  });

  test('filtros de busca e seção', async ({ page }) => {
    // Buscar por texto
    await page.getByPlaceholder('Buscar artigos por título').fill('música');
    await expect(page).toHaveURL(/q=m%C3%BAsica/);
    
    // Filtrar por seção
    await page.getByLabel('Seção').selectOption('bpm');
    await expect(page).toHaveURL(/secao=bpm/);
    
    // Verificar que não há filtro de cidade
    await expect(page.getByLabel('Cidade')).toHaveCount(0);
  });

  test('filtro de ordenação', async ({ page }) => {
    // Alterar ordenação
    await page.getByLabel('Ordenar por').selectOption('most_read');
    await expect(page).toHaveURL(/sort=most_read/);
    
    // Verificar opções disponíveis
    const sortSelect = page.getByLabel('Ordenar por');
    await expect(sortSelect).toHaveValue('most_read');
  });

  test('limpar filtros', async ({ page }) => {
    // Aplicar filtros
    await page.getByPlaceholder('Buscar artigos por título').fill('teste');
    await page.getByLabel('Seção').selectOption('editorial');
    await page.getByLabel('Ordenar por').selectOption('most_read');
    
    // Limpar filtros
    await page.getByText('Limpar filtros').click();
    
    // Verificar que os filtros foram resetados
    await expect(page.getByPlaceholder('Buscar artigos por título')).toHaveValue('');
    await expect(page.getByLabel('Seção')).toHaveValue('');
    await expect(page.getByLabel('Ordenar por')).toHaveValue('recent');
    await expect(page).toHaveURL(/^[^?]*(\?(?!.*(q|secao|sort)=).*)?$/);
  });

  test('contador de artigos com aria-live', async ({ page }) => {
    const counter = page.locator('[aria-live="polite"]');
    await expect(counter).toBeVisible();
    await expect(counter).toContainText(/\d+ artigos? encontrados?/);
  });

  test('responsividade em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que os filtros ainda são visíveis
    await expect(page.getByPlaceholder('Buscar artigos por título')).toBeVisible();
    await expect(page.getByLabel('Seção')).toBeVisible();
    
    // Verificar que os chips se comportam bem em telas pequenas
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Editorial' })).toBeVisible();
  });

  test('sidebar não aparece em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar deve estar oculta em mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCount(0);
  });

  test('sidebar visível em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Sidebar deve estar visível em desktop
    await expect(page.getByRole('complementary')).toBeVisible();
    await expect(page.getByText('Mais lidos da semana')).toBeVisible();
    await expect(page.getByText('Tópicos em alta')).toBeVisible();
    await expect(page.getByText('Newsletter ROLÊ')).toBeVisible();
  });

  test('acessibilidade - landmarks e labels', async ({ page }) => {
    // Verificar landmarks
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Seções da revista' })).toBeVisible();
    
    // Verificar labels dos formulários
    await expect(page.getByLabel('Seção')).toBeVisible();
    await expect(page.getByLabel('Ordenar por')).toBeVisible();
    await expect(page.getByLabelText('Buscar artigos')).toBeVisible();
  });

  test('foco visível nos elementos interativos', async ({ page }) => {
    // Testar foco no teclado
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verificar que elementos têm outline visível quando focados
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCSS('outline-width', /[1-9]/);
  });
});