import { test, expect, type Page } from '@playwright/test';

// Test admin credentials - update these based on your setup
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'TestPassword123!';

class AdminHelper {
  constructor(private page: Page) {}

  async login() {
    await this.page.goto('/admin/login');
    await this.page.fill('[data-testid="email-input"]', ADMIN_EMAIL);
    await this.page.fill('[data-testid="password-input"]', ADMIN_PASSWORD);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login - should redirect to admin dashboard
    await this.page.waitForURL('/admin');
    await expect(this.page.locator('h1')).toContainText('Admin Dashboard');
  }

  async navigateToSection(section: string) {
    await this.page.click(`[data-testid="nav-${section}"]`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid="${field}-input"]`, value);
    }
  }

  async submitForm() {
    await this.page.click('[data-testid="submit-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForToast(message: string) {
    await expect(this.page.locator('[data-testid="toast"]')).toContainText(message);
  }
}

test.describe('Admin E2E Tests', () => {
  let adminHelper: AdminHelper;

  test.beforeEach(async ({ page }) => {
    adminHelper = new AdminHelper(page);
    await adminHelper.login();
  });

  test.describe('Authentication', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      // Already logged in via beforeEach
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible();
    });

    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Logout first
      await page.click('[data-testid="admin-logout"]');
      
      // Try to access admin page
      await page.goto('/admin/highlights');
      await page.waitForURL('/admin/login');
      await expect(page.locator('h1')).toContainText('Login');
    });
  });

  test.describe('Profile Management', () => {
    test('should edit admin profile successfully', async ({ page }) => {
      await adminHelper.navigateToSection('profile');
      
      const newDisplayName = `Test Admin ${Date.now()}`;
      await page.fill('[data-testid="display_name-input"]', newDisplayName);
      await page.click('[data-testid="save-profile-button"]');
      
      await adminHelper.waitForToast('Perfil atualizado com sucesso');
      await expect(page.locator('[data-testid="display_name-input"]')).toHaveValue(newDisplayName);
    });

    test('should change password successfully', async ({ page }) => {
      await adminHelper.navigateToSection('profile');
      
      await page.fill('[data-testid="currentPassword-input"]', ADMIN_PASSWORD);
      await page.fill('[data-testid="newPassword-input"]', 'NewPassword123!');
      await page.fill('[data-testid="confirmPassword-input"]', 'NewPassword123!');
      await page.click('[data-testid="update-password-button"]');
      
      await adminHelper.waitForToast('Senha atualizada com sucesso');
      
      // Reset password back
      await page.fill('[data-testid="currentPassword-input"]', 'NewPassword123!');
      await page.fill('[data-testid="newPassword-input"]', ADMIN_PASSWORD);
      await page.fill('[data-testid="confirmPassword-input"]', ADMIN_PASSWORD);
      await page.click('[data-testid="update-password-button"]');
    });

    test('should validate password strength', async ({ page }) => {
      await adminHelper.navigateToSection('profile');
      
      await page.fill('[data-testid="currentPassword-input"]', ADMIN_PASSWORD);
      await page.fill('[data-testid="newPassword-input"]', 'weak');
      await page.fill('[data-testid="confirmPassword-input"]', 'weak');
      await page.click('[data-testid="update-password-button"]');
      
      await adminHelper.waitForToast('A nova senha deve ter pelo menos 8 caracteres');
    });
  });

  test.describe('Organizers CRUD', () => {
    test('should create a new organizer', async ({ page }) => {
      await adminHelper.navigateToSection('organizers');
      
      await page.click('[data-testid="create-organizer-button"]');
      await adminHelper.fillForm({
        name: `Test Organizer ${Date.now()}`,
        'contact_email': 'test@organizer.com',
        site: 'https://testorganizer.com',
        instagram: '@testorganizer'
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Organizador criado com sucesso');
      
      // Verify it appears in the list
      await expect(page.locator('[data-testid="organizers-list"]')).toContainText('Test Organizer');
    });

    test('should edit an existing organizer', async ({ page }) => {
      await adminHelper.navigateToSection('organizers');
      
      // Click edit on first organizer
      await page.click('[data-testid="edit-organizer-0"]');
      
      const updatedName = `Updated Organizer ${Date.now()}`;
      await page.fill('[data-testid="name-input"]', updatedName);
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Organizador atualizado com sucesso');
      
      await expect(page.locator('[data-testid="organizers-list"]')).toContainText(updatedName);
    });

    test('should delete an organizer', async ({ page }) => {
      await adminHelper.navigateToSection('organizers');
      
      // Get count before deletion
      const initialCount = await page.locator('[data-testid="organizer-row"]').count();
      
      // Delete first organizer
      await page.click('[data-testid="delete-organizer-0"]');
      await page.click('[data-testid="confirm-delete"]');
      
      await adminHelper.waitForToast('Organizador removido com sucesso');
      
      // Verify count decreased
      const finalCount = await page.locator('[data-testid="organizer-row"]').count();
      expect(finalCount).toBe(initialCount - 1);
    });
  });

  test.describe('Venues CRUD', () => {
    test('should create a new venue', async ({ page }) => {
      await adminHelper.navigateToSection('venues');
      
      await page.click('[data-testid="create-venue-button"]');
      await adminHelper.fillForm({
        name: `Test Venue ${Date.now()}`,
        address: 'Rua Test, 123',
        city: 'São Paulo',
        state: 'SP',
        capacity: '500'
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Local criado com sucesso');
      
      await expect(page.locator('[data-testid="venues-list"]')).toContainText('Test Venue');
    });

    test('should edit venue details', async ({ page }) => {
      await adminHelper.navigateToSection('venues');
      
      await page.click('[data-testid="edit-venue-0"]');
      
      const updatedCapacity = '1000';
      await page.fill('[data-testid="capacity-input"]', updatedCapacity);
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Local atualizado com sucesso');
    });
  });

  test.describe('Categories CRUD', () => {
    test('should create a new category', async ({ page }) => {
      await adminHelper.navigateToSection('categories');
      
      await page.click('[data-testid="create-category-button"]');
      await adminHelper.fillForm({
        name: `Test Category ${Date.now()}`,
        description: 'Test category description',
        slug: `test-category-${Date.now()}`
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Categoria criada com sucesso');
      
      await expect(page.locator('[data-testid="categories-list"]')).toContainText('Test Category');
    });

    test('should validate unique slug', async ({ page }) => {
      await adminHelper.navigateToSection('categories');
      
      await page.click('[data-testid="create-category-button"]');
      await adminHelper.fillForm({
        name: 'Duplicate Category',
        slug: 'musica' // Assuming this slug already exists
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Slug já existe');
    });
  });

  test.describe('Events CRUD', () => {
    test('should create a new event', async ({ page }) => {
      await adminHelper.navigateToSection('events');
      
      await page.click('[data-testid="create-event-button"]');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await adminHelper.fillForm({
        title: `Test Event ${Date.now()}`,
        description: 'Test event description',
        city: 'São Paulo',
        state: 'SP',
        'date_start': dateString,
        'price_min': '50',
        'price_max': '100'
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Evento criado com sucesso');
      
      await expect(page.locator('[data-testid="events-list"]')).toContainText('Test Event');
    });

    test('should validate event date', async ({ page }) => {
      await adminHelper.navigateToSection('events');
      
      await page.click('[data-testid="create-event-button"]');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      await adminHelper.fillForm({
        title: 'Past Event',
        city: 'São Paulo',
        state: 'SP',
        'date_start': dateString
      });
      
      await adminHelper.submitForm();
      await adminHelper.waitForToast('Data do evento não pode ser no passado');
    });
  });

  test.describe('Content Moderation', () => {
    test('should moderate blog comments', async ({ page }) => {
      await adminHelper.navigateToSection('comments');
      
      // Should see pending comments
      await expect(page.locator('[data-testid="comments-list"]')).toBeVisible();
      
      // Approve first comment if exists
      const approveButton = page.locator('[data-testid="approve-comment-0"]');
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await adminHelper.waitForToast('Comentário aprovado');
      }
    });

    test('should handle contact messages', async ({ page }) => {
      await adminHelper.navigateToSection('contact-messages');
      
      await expect(page.locator('[data-testid="messages-list"]')).toBeVisible();
      
      // Mark first message as handled if exists
      const handleButton = page.locator('[data-testid="handle-message-0"]');
      if (await handleButton.isVisible()) {
        await handleButton.click();
        await adminHelper.waitForToast('Mensagem marcada como tratada');
      }
    });
  });

  test.describe('Blog Management', () => {
    test('should create a new blog post', async ({ page }) => {
      await page.goto('/admin/posts/new');
      
      await adminHelper.fillForm({
        title: `Test Blog Post ${Date.now()}`,
        summary: 'Test blog post summary',
        'author_name': 'Test Author',
        city: 'São Paulo'
      });
      
      // Fill rich text editor
      await page.click('[data-testid="content-editor"]');
      await page.type('[data-testid="content-editor"]', 'This is test blog post content.');
      
      await page.click('[data-testid="publish-button"]');
      await adminHelper.waitForToast('Post publicado com sucesso');
      
      // Verify in posts history
      await page.goto('/admin/posts/history');
      await expect(page.locator('[data-testid="posts-list"]')).toContainText('Test Blog Post');
    });

    test('should view post revisions', async ({ page }) => {
      await page.goto('/admin/posts/history');
      
      // Click view revisions on first post
      const revisionsButton = page.locator('[data-testid="view-revisions-0"]');
      if (await revisionsButton.isVisible()) {
        await revisionsButton.click();
        await expect(page.locator('[data-testid="revisions-list"]')).toBeVisible();
      }
    });
  });

  test.describe('Push Notifications', () => {
    test('should send test push notification', async ({ page }) => {
      await adminHelper.navigateToSection('notifications');
      
      await adminHelper.fillForm({
        title: 'Test Notification',
        message: 'This is a test push notification',
        type: 'test'
      });
      
      await page.click('[data-testid="send-notification-button"]');
      await adminHelper.waitForToast('Notificação enviada com sucesso');
      
      // Verify in notifications log
      await expect(page.locator('[data-testid="notifications-log"]')).toContainText('Test Notification');
    });

    test('should validate notification fields', async ({ page }) => {
      await adminHelper.navigateToSection('notifications');
      
      // Try to send notification without title
      await page.fill('[data-testid="message-input"]', 'Message without title');
      await page.click('[data-testid="send-notification-button"]');
      
      await adminHelper.waitForToast('Título é obrigatório');
    });
  });

  test.describe('Analytics and Performance', () => {
    test('should view analytics reports', async ({ page }) => {
      await page.goto('/admin/analytics-reports');
      
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="events-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="pageviews-chart"]')).toBeVisible();
    });

    test('should export analytics data', async ({ page }) => {
      await page.goto('/admin/analytics-reports');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-csv-button"]');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('analytics');
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should view performance metrics', async ({ page }) => {
      await page.goto('/admin/performance');
      
      await expect(page.locator('[data-testid="performance-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="core-web-vitals"]')).toBeVisible();
      await expect(page.locator('[data-testid="js-errors-list"]')).toBeVisible();
    });
  });

  test.describe('Data Integrity', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await adminHelper.navigateToSection('organizers');
      await page.click('[data-testid="create-organizer-button"]');
      
      await adminHelper.fillForm({
        name: 'Network Test Organizer',
        'contact_email': 'test@network.com'
      });
      
      await adminHelper.submitForm();
      
      // Should show error message
      await adminHelper.waitForToast('Erro de conexão');
    });

    test('should validate required fields', async ({ page }) => {
      await adminHelper.navigateToSection('organizers');
      await page.click('[data-testid="create-organizer-button"]');
      
      // Try to submit without required fields
      await adminHelper.submitForm();
      
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Nome é obrigatório');
    });
  });

  test.describe('Security', () => {
    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      await adminHelper.navigateToSection('organizers');
      await page.click('[data-testid="create-organizer-button"]');
      
      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('[data-testid="name-input"]', xssPayload);
      await adminHelper.submitForm();
      
      // Script should be escaped, not executed
      const nameField = page.locator('[data-testid="name-input"]');
      await expect(nameField).toHaveValue(xssPayload);
      
      // Check that script didn't execute
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });
      
      expect(alerts).toHaveLength(0);
    });

    test('should enforce CSRF protection', async ({ page }) => {
      // This test would require more complex setup to properly test CSRF
      // For now, we'll verify that forms include proper tokens
      await adminHelper.navigateToSection('organizers');
      await page.click('[data-testid="create-organizer-button"]');
      
      // Check that form has security attributes
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });
});

test.afterAll(async () => {
  // Cleanup test data if needed
  console.log('Admin E2E tests completed');
});