import { chromium, FullConfig } from '@playwright/test';
import { MongoClient } from 'mongodb';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright E2E Test Setup...');

  // Connect to test database and ensure it's clean
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app-test';
  console.log(`📦 Connecting to test database: ${mongoUri}`);

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db();

    // Clean up any existing test data
    await db.collection('todos').deleteMany({});
    console.log('🧹 Test database cleaned successfully');

    await client.close();
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }

  // Warm up the application
  console.log('🔥 Warming up application servers...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check backend health
    await page.goto('http://localhost:5001/api/health', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Backend server is ready');

    // Check frontend
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Frontend server is ready');

  } catch (error) {
    console.error('❌ Application warmup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎉 Global setup completed successfully!');
}

export default globalSetup;