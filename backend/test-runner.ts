#!/usr/bin/env bun

/**
 * Test Runner for Auth App Backend
 * 
 * This script runs all tests and provides formatted output
 * suitable for CI/CD and Docker environments.
 */

import { spawn } from 'bun';

async function runTests() {
  console.log('🧪 Starting Auth App Backend Tests');
  console.log('=====================================\n');

  const startTime = Date.now();

  try {
    // Run Bun tests
    const testProcess = spawn({
      cmd: ['bun', 'test'],
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
    });

    const exitCode = await testProcess.exited;
    const duration = (Date.now() - startTime) / 1000;

    console.log('\n=====================================');
    
    if (exitCode === 0) {
      console.log(`✅ All tests passed in ${duration.toFixed(2)}s`);
      console.log('🎉 Backend is ready for deployment!');
    } else {
      console.log(`❌ Tests failed with exit code ${exitCode}`);
      console.log(`⏱️  Test duration: ${duration.toFixed(2)}s`);
      process.exit(exitCode);
    }
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  runTests();
} 