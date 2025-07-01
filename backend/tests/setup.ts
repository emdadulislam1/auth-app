// Global test setup file
// This file runs before all tests to set up the testing environment

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-testing-only';

// Suppress console.log during tests (optional)
// Uncomment the following lines if you want to suppress logging during tests
// const originalConsoleLog = console.log;
// console.log = () => {};

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Reset console if needed
  // resetConsole: () => { console.log = originalConsoleLog; }
};

// Global test cleanup
process.on('exit', () => {
  // Cleanup any global resources if needed
  console.log('🧹 Test suite completed, cleaning up...');
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Type declaration for global test utilities
declare global {
  var testUtils: {
    delay: (ms: number) => Promise<void>;
  };
} 