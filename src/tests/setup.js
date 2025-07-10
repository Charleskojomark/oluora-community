// Load test environment variables first
require('dotenv').config({ path: '.env.test' });

const { PrismaClient } = require('@prisma/client');

// Use a single Prisma client instance for all tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Global test setup
beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully for tests');
    
    // Clean up any existing test data
    await cleanupDatabase();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Final cleanup
    await cleanupDatabase();
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error.message);
  }
});

// Clean up function that respects foreign key constraints
async function cleanupDatabase() {
  try {
    // Delete in the correct order to avoid foreign key constraint errors
    await prisma.vote.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.townhall.deleteMany({});
    await prisma.xUpdate.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
    // Don't throw here to avoid stopping the test suite
  }
}

// Export the shared prisma instance and cleanup function
module.exports = { 
  prisma,
  cleanupDatabase
};