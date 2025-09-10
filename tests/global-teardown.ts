import { execSync } from 'child_process';

async function globalTeardown() {
  console.log('🧹 Running global teardown for E2E tests...');
  
  try {
    // Clean up test data
    execSync('npm run cleanup:e2e', { stdio: 'inherit' });
    console.log('✅ Test cleanup complete');
  } catch (error) {
    console.warn('⚠️ Failed to cleanup test data:', error);
    // Don't throw here - cleanup failure shouldn't fail the tests
  }
}

export default globalTeardown;