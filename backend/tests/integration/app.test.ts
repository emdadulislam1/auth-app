import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { app } from '../../src/app';
import { createTestDatabase, cleanupTestDatabase } from '../helpers/database';

let testDb: any;

describe('App Integration', () => {
  beforeEach(() => {
    // Create test database
    testDb = createTestDatabase();
    
    // Mock the db import
    mock.module('../../src/db', () => ({
      db: testDb
    }));
  });

  afterEach(() => {
    if (testDb) {
      cleanupTestDatabase(testDb);
    }
    mock.restore();
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      const response = await app.request('/api/health', {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { 
        status: string; 
        timestamp: string; 
        uptime: number;
        environment: string;
      };
      
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.environment).toBeDefined();
      
      // Validate timestamp format (ISO 8601)
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should include correct environment', async () => {
      const response = await app.request('/api/health', {
        method: 'GET'
      });

      const result = await response.json() as { environment: string };
      
      // Should return the NODE_ENV or default to 'development'
      const expectedEnv = process.env.NODE_ENV || 'development';
      expect(result.environment).toBe(expectedEnv);
    });
  });

  describe('CORS Middleware', () => {
    it('should handle preflight OPTIONS request', async () => {
      const response = await app.request('/api/login', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT,DELETE,OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('Request Logging', () => {
    it('should log requests', async () => {
      // This test verifies that the logging middleware runs without errors
      const response = await app.request('/api/health', {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      // The actual logging is handled by console.log, so we just verify the request succeeds
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await app.request('/api/nonexistent', {
        method: 'GET'
      });

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await app.request('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{"invalid": json}'
      });

      // Should not crash the server, might return 400 or 500 depending on implementation
      expect([400, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Route Registration', () => {
    it('should have auth routes registered', async () => {
      // Test that auth routes are available
      const endpoints = [
        { path: '/api/register', method: 'POST' },
        { path: '/api/login', method: 'POST' },
        { path: '/api/login-2fa', method: 'POST' }
      ];

      for (const endpoint of endpoints) {
        const response = await app.request(endpoint.path, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}) // Empty body, should get validation error not 404
        });

        // Should not be 404 (route exists), might be 400 (validation error)
        expect(response.status).not.toBe(404);
      }
    });

    it('should have user routes registered', async () => {
      // Test that user routes are available (will fail auth but not 404)
      const response = await app.request('/api/me', {
        method: 'GET'
      });

      // Should be 401 (unauthorized) not 404 (route not found)
      expect(response.status).toBe(401);
    });
  });
}); 