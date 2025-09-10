# E2E Testing with Playwright

This project includes comprehensive E2E tests using Playwright to ensure the Admin v3 interface works correctly for artist management.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Environment variables:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   # Required for E2E tests
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   E2E_BASE_URL=http://localhost:5173
   E2E_ADMIN_EMAIL=admin.e2e@role.test
   E2E_ADMIN_PASSWORD=RoleE2E!2025
   ```

## Running Tests

### Full E2E Test Suite
```bash
# Setup admin, run tests, and cleanup
npm run seed:e2e && npm run test:e2e && npm run cleanup:e2e
```

### Individual Commands
```bash
# Create test admin user
npm run seed:e2e

# Run E2E tests only
npm run test:e2e

# Clean up test data
npm run cleanup:e2e
```

### Development
```bash
# Run tests with UI (helpful for debugging)
npx playwright test --ui

# Run specific test file
npx playwright test tests/artist.e2e.spec.ts

# Debug mode
npx playwright test --debug
```

## Test Coverage

The E2E tests cover:

### ✅ Artist Creation
- Creating new artists with all required fields
- Adding new categories by typing (creates new options)
- Adding new genres by typing (creates new options)
- Form validation and error handling
- Success feedback and navigation

### ✅ Artist Editing
- Loading existing artist data
- Modifying artist information
- Adding additional categories/genres
- Persistence verification after page reload

### ✅ Form Validation
- Required field validation
- Error message display
- Auto-scroll to first error field
- Clear feedback for missing data

### ✅ UI/UX Validation
- Save button state management (disabled during loading)
- Loading indicators ("Salvando..." text)
- Toast notifications for success/error
- Proper form submission handling

### ✅ Data Integrity
- No silent failures
- RLS policy compliance
- Clean data creation and cleanup
- Isolated test environment

## Test Data Management

### Admin User
- **Email:** `admin.e2e@role.test`
- **Password:** `RoleE2E!2025`
- Automatically created with proper admin permissions
- Exists in both `admin_users` and `approved_admins` tables

### Test Data Cleanup
- All test artists have names starting with "E2E -"
- Automatic cleanup removes related data:
  - Artist records
  - Category relationships
  - Genre relationships
  - Any categories/genres containing "E2E"

## Test Selectors

The tests use stable `data-testid` selectors:

- `[data-testid="artist-save"]` - Save button
- `[data-testid="artist-name"]` - Artist name input
- `[data-testid="artist-city"]` - City input
- `[data-testid="artist-categories"]` - Categories multiselect
- `[data-testid="artist-genres"]` - Genres multiselect
- `[data-testid="toast-success"]` - Success toast notifications

## CI/CD Integration

The tests are configured for CI environments:
- Automatic retries on failure
- Screenshot capture on failure
- Trace collection for debugging
- Headless execution
- Parallel test execution

## Troubleshooting

### Common Issues

1. **Service Role Key Missing**
   ```
   Error: SUPABASE_SERVICE_ROLE_KEY is required
   ```
   Solution: Add the service role key to your `.env` file

2. **Admin Creation Failed**
   ```
   Error creating test admin user
   ```
   Solution: Check Supabase connection and permissions

3. **Tests Timeout**
   ```
   Test timeout of 30000ms exceeded
   ```
   Solution: Ensure dev server is running on correct port

4. **Toast Not Found**
   ```
   Error: Toast element not visible
   ```
   Solution: Check if sonner is properly configured with test IDs

### Debug Mode

Run tests in debug mode to step through interactions:
```bash
npx playwright test --debug tests/artist.e2e.spec.ts
```

### Viewing Test Results

After test runs, view the HTML report:
```bash
npx playwright show-report
```

## Architecture

### Test Structure
```
tests/
├── artist.e2e.spec.ts        # Main artist management tests
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test cleanup
└── .auth/                    # Authentication state storage

scripts/
├── seed-test-admin.ts        # Admin user creation
└── cleanup-e2e.ts           # Test data cleanup
```

### Admin Authentication
Tests use a persistent admin user that:
- Has proper RLS permissions
- Can create/edit/delete artists
- Can manage categories and genres
- Is isolated from production data

The authentication state is preserved between tests for efficiency.