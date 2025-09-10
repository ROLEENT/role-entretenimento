import { execSync } from 'child_process';

async function globalSetup() {
  console.log('🌱 Running global setup for E2E tests...');
  
  try {
    // Ensure test admin exists
    execSync('npm run seed:e2e', { stdio: 'inherit' });
    console.log('✅ Test admin setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test admin:', error);
    throw error;
  }
}

export default globalSetup;