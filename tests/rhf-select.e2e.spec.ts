import { test, expect } from '@playwright/test';

test.describe('RHFSelect Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test page for the component
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/react-hook-form@7/dist/index.umd.development.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            // Mock component for testing
            const { useState } = React;
            const { useForm, FormProvider, Controller } = ReactHookForm;
            
            function TestForm() {
              const methods = useForm({
                defaultValues: {
                  testSelect: ''
                }
              });
              
              const [formData, setFormData] = useState({});
              
              const onSubmit = (data) => {
                setFormData(data);
                console.log('Form submitted:', data);
              };
              
              return React.createElement('div', null,
                React.createElement(FormProvider, { ...methods },
                  React.createElement('form', { 
                    onSubmit: methods.handleSubmit(onSubmit),
                    'data-testid': 'test-form'
                  },
                    React.createElement(Controller, {
                      name: 'testSelect',
                      control: methods.control,
                      render: ({ field }) => React.createElement('select', {
                        ...field,
                        'data-testid': 'rhf-select',
                        onChange: (e) => {
                          field.onChange(e.target.value);
                          console.log('Select changed:', e.target.value);
                        }
                      },
                        React.createElement('option', { value: '' }, 'Selecione...'),
                        React.createElement('option', { value: 'option1' }, 'Opção 1'),
                        React.createElement('option', { value: 'option2' }, 'Opção 2'),
                        React.createElement('option', { value: 'option3' }, 'Opção 3')
                      )
                    }),
                    React.createElement('button', { 
                      type: 'submit',
                      'data-testid': 'submit-button'
                    }, 'Submit'),
                    React.createElement('div', { 
                      'data-testid': 'form-values'
                    }, JSON.stringify(formData))
                  )
                )
              );
            }
            
            ReactDOM.render(React.createElement(TestForm), document.getElementById('root'));
          </script>
        </body>
      </html>
    `);
    
    // Wait for React to render
    await page.waitForSelector('[data-testid="test-form"]');
  });

  test('should update form state when select value changes', async ({ page }) => {
    // Get the select element
    const select = page.locator('[data-testid="rhf-select"]');
    
    // Verify initial state
    await expect(select).toHaveValue('');
    
    // Change select value
    await select.selectOption('option1');
    
    // Verify the select value changed
    await expect(select).toHaveValue('option1');
    
    // Submit form to check if RHF captured the value
    await page.click('[data-testid="submit-button"]');
    
    // Wait for form submission and check the output
    await page.waitForFunction(() => {
      const valuesDiv = document.querySelector('[data-testid="form-values"]');
      return valuesDiv && valuesDiv.textContent.includes('option1');
    });
    
    // Verify form data contains the selected value
    const formValues = await page.locator('[data-testid="form-values"]').textContent();
    expect(JSON.parse(formValues || '{}')).toEqual({ testSelect: 'option1' });
  });

  test('should propagate multiple value changes correctly', async ({ page }) => {
    const select = page.locator('[data-testid="rhf-select"]');
    
    // Test multiple value changes
    await select.selectOption('option2');
    await expect(select).toHaveValue('option2');
    
    await select.selectOption('option3');
    await expect(select).toHaveValue('option3');
    
    await select.selectOption('option1');
    await expect(select).toHaveValue('option1');
    
    // Submit and verify final value
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForFunction(() => {
      const valuesDiv = document.querySelector('[data-testid="form-values"]');
      return valuesDiv && valuesDiv.textContent.includes('option1');
    });
    
    const formValues = await page.locator('[data-testid="form-values"]').textContent();
    expect(JSON.parse(formValues || '{}')).toEqual({ testSelect: 'option1' });
  });
});

test.describe('RHFSelectAsync Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase API responses
    await page.route('**/rest/v1/cities**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'São Paulo' },
          { id: '2', name: 'Rio de Janeiro' },
          { id: '3', name: 'Belo Horizonte' }
        ])
      });
    });
  });

  test('should load options asynchronously and update form', async ({ page }) => {
    // Navigate to a page with RHFSelectAsync
    await page.goto('/admin-v3/venues/novo');
    
    // Wait for the async select to load
    await page.waitForSelector('[data-testid="city-select-trigger"]');
    
    // Open the select
    await page.click('[data-testid="city-select-trigger"]');
    
    // Wait for options to load
    await page.waitForSelector('[data-testid="city-select-option"]');
    
    // Verify options are present
    await expect(page.locator('[data-testid="city-select-option"]')).toHaveCount(3);
    
    // Select an option
    await page.click('[data-testid="city-select-option"]:has-text("São Paulo")');
    
    // Verify the selection is reflected in the form
    await expect(page.locator('[data-testid="city-select-trigger"]')).toContainText('São Paulo');
  });

  test('should handle loading and error states', async ({ page }) => {
    // Mock API delay
    await page.route('**/rest/v1/cities**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.goto('/admin-v3/venues/novo');
    
    // Should show loading state initially
    await page.click('[data-testid="city-select-trigger"]');
    await expect(page.locator('text=Carregando...')).toBeVisible();
    
    // Should eventually show empty state
    await expect(page.locator('text=Nenhum resultado encontrado')).toBeVisible({ timeout: 2000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/rest/v1/cities**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/admin-v3/venues/novo');
    
    await page.click('[data-testid="city-select-trigger"]');
    
    // Should show error message
    await expect(page.locator('text=Erro ao carregar')).toBeVisible();
  });
});