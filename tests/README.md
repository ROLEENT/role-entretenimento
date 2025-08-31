# Tests

## Overview
This directory contains automated tests for the application, including E2E tests with Playwright and unit tests with Vitest.

## Test Structure

### E2E Tests (Playwright)
- `forms.e2e.spec.ts` - Tests for main form workflows (Agenda, Venue, Revista)
- `rhf-select.e2e.spec.ts` - Tests for RHFSelect and RHFSelectAsync components
- `admin.e2e.spec.ts` - Admin dashboard tests
- `agenda.e2e.spec.ts` - Agenda-specific tests
- `city-links.e2e.spec.ts` - City navigation tests

### Unit Tests (Vitest)
- `unit/RHFSelect.test.tsx` - Unit tests for RHFSelect component
- `unit/RHFSelectAsync.test.tsx` - Unit tests for RHFSelectAsync component

## New Form Tests

### Agenda Form Tests
- Create new agenda item with city/venue selection
- Save draft and verify persistence
- Reopen saved draft and verify values are loaded correctly

### Venue Form Tests  
- Create venue with city and type selection
- Verify all required fields are validated
- Test form submission and success handling

### Revista (Blog Post) Form Tests
- Create blog post with category selection
- Upload cover image
- Test content creation and saving

### RHF Component Tests
- Test value changes propagate to React Hook Form
- Test validation and error handling
- Test async loading and selection
- Test search functionality
- Test disabled states

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test forms.e2e.spec.ts

# Run unit tests (if vitest is set up)
npx vitest

# Run with UI
npx playwright test --ui

# Run tests in debug mode
npx playwright test --debug
```

## Test Data Mocking
All tests use mocked API responses to ensure consistent, fast, and reliable test execution. The mocks include:
- Authentication responses
- Supabase database queries
- File upload responses
- Form submission responses

## Admin Test Account Setup

For admin tests to work, create a test admin account:

1. Go to your Supabase dashboard
2. In Authentication > Users, create:
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
3. Add to approved_admins table:
   ```sql
   INSERT INTO approved_admins (email, approved_by, is_active) 
   VALUES ('admin@test.com', 'system', true);
   ```