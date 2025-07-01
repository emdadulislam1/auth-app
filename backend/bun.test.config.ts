export default {
  test: {
    // Test environment variables
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-for-testing-only'
    },
    
    // Test timeout (30 seconds)
    timeout: 30000,
    
    // Test root directory
    root: './tests'
  }
}; 