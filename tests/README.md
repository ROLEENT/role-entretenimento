# Test Data Setup

This directory contains test data and utilities for E2E testing.

## Admin Test Account

For the admin tests to work, you need to create a test admin account:

1. Go to your Supabase dashboard
2. In the Authentication > Users section, create a new user:
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
3. In your database, add this user to the `approved_admins` table:
   ```sql
   INSERT INTO approved_admins (email, approved_by, is_active) 
   VALUES ('admin@test.com', 'system', true);
   ```

## Test Data

The tests will create and clean up their own test data during execution. If you want to pre-populate test data, you can add SQL scripts here.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## CI Configuration

For CI environments, ensure:
1. Admin test account exists
2. Database is properly migrated
3. Environment variables are set
4. Test server is running on port 8080