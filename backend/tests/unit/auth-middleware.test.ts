import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { generateJWT } from '../../src/utils/security';
import { createTestDatabase, cleanupTestDatabase, createTestUser } from '../helpers/database';
import * as jwt from 'jsonwebtoken';

let testDb: any;

describe('Auth Middleware', () => {
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

  describe('JWT Token Validation', () => {
    it('should validate correct JWT token', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateJWT(user);
      
      const JWT_SECRET = Bun.env.JWT_SECRET || 'supersecret';
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        expect(decoded.id).toBe(user.id);
        expect(decoded.email).toBe(user.email);
      } catch (error) {
        throw new Error('Valid token should not throw error');
      }
    });

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid-token';
      const JWT_SECRET = Bun.env.JWT_SECRET || 'supersecret';
      
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(user, 'wrong-secret');
      const JWT_SECRET = Bun.env.JWT_SECRET || 'supersecret';
      
      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    it('should handle expired token', () => {
      const user = { id: 1, email: 'test@example.com' };
      const JWT_SECRET = Bun.env.JWT_SECRET || 'supersecret';
      const expiredToken = jwt.sign(user, JWT_SECRET, { expiresIn: '0s' });
      
      // Wait a moment to ensure expiration
      setTimeout(() => {
        expect(() => {
          jwt.verify(expiredToken, JWT_SECRET);
        }).toThrow();
      }, 10);
    });
  });

  describe('Authorization Header Parsing', () => {
    it('should extract Bearer token correctly', () => {
      const token = 'sample-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      // Simulate the auth header parsing logic
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const extractedToken = authHeader.slice(7);
        expect(extractedToken).toBe(token);
      } else {
        throw new Error('Should extract token correctly');
      }
    });

    it('should reject invalid authorization format', () => {
      const invalidHeaders = [
        'Basic dXNlcjpwYXNz',
        'Bearer',
        'Token sample-token',
        'sample-token',
        ''
      ];

      invalidHeaders.forEach(header => {
        const isValid = header && header.startsWith('Bearer ') && header.length > 7;
        expect(!!isValid).toBe(false); // Convert to boolean for consistent comparison
      });
    });

    it('should accept valid Bearer token format', () => {
      const validHeaders = [
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'Bearer sample-jwt-token-here',
        'Bearer a.b.c'
      ];

      validHeaders.forEach(header => {
        const isValid = header && header.startsWith('Bearer ') && header.length > 7;
        expect(isValid).toBe(true);
      });
    });
  });
}); 