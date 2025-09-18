import { MongoClient } from 'mongodb';

async function globalTeardown() {
  console.log('🧹 Starting Playwright E2E Test Teardown...');

  // Clean up test database
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app-test';
  console.log(`📦 Cleaning up test database: ${mongoUri}`);

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db();

    // Clean up all test data
    await db.collection('todos').deleteMany({});
    console.log('🧹 Test database cleaned successfully');

    await client.close();
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    // Don't throw error in teardown to avoid masking test failures
  }

  console.log('✅ Global teardown completed!');
}

export default globalTeardown;