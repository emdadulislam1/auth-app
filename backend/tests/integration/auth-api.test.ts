import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Hono } from 'hono';
import { registerAuthRoutes } from '../../src/api/auth';
import { hashPassword } from '../../src/utils/security';
import { createTestDatabase, cleanupTestDatabase, createTestUser, createTestUserWith2FA, getUserByEmail, getUserCount } from '../helpers/database';
import { speakeasy } from '../../src/utils/totp';

// Mock the database module
const originalDb = await import('../../src/db');
let testDb: any;

describe('Auth API', () => {
  let app: Hono;

  beforeEach(async () => {
    // Create test database
    testDb = createTestDatabase();
    
    // Mock the db import
    mock.module('../../src/db', () => ({
      db: testDb
    }));

    // Create fresh app instance
    app = new Hono();
    registerAuthRoutes(app);
  });

  afterEach(() => {
    if (testDb) {
      cleanupTestDatabase(testDb);
    }
    mock.restore();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await app.request('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { success: boolean };
      expect(result.success).toBe(true);

      // Verify user was created in database
      const user = getUserByEmail(testDb, userData.email);
      expect(user).toBeDefined();
      expect((user as any).email).toBe(userData.email);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await app.request('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(400);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'short'
      };

      const response = await app.request('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(400);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject duplicate email registration', async () => {
      const email = 'duplicate@example.com';
      await createTestUser(testDb, email, 'hashedpassword');

      const userData = {
        email,
        password: 'password123'
      };

      const response = await app.request('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.200' // Different IP to avoid rate limiting
        },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(400);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Registration failed');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create test user with hashed password
      const hashedPassword = await hashPassword('password123');
      await createTestUser(testDb, 'user@example.com', hashedPassword);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const response = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { token: string; user: { email: string; totpEnabled: boolean } };
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.user.totpEnabled).toBe(false);
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(401);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      const response = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(401);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid credentials');
    });

    it('should require 2FA when enabled', async () => {
      // Create user with 2FA enabled
      const hashedPassword = await hashPassword('password123');
      testDb.run('DELETE FROM users WHERE email = ?', ['user@example.com']);
      testDb.run(
        'INSERT INTO users (email, password_hash, totp_secret, totp_enabled) VALUES (?, ?, ?, 1)',
        ['user@example.com', hashedPassword, 'JBSWY3DPEHPK3PXP']
      );

      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const response = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { requiresTOTP: boolean; token?: string };
      expect(result.requiresTOTP).toBe(true);
      expect(result.token).toBeUndefined();
    });
  });

  describe('POST /api/login-2fa', () => {
    beforeEach(async () => {
      // Create test user with 2FA enabled
      const hashedPassword = await hashPassword('password123');
      await createTestUserWith2FA(testDb, 'user2fa@example.com', 'JBSWY3DPEHPK3PXP');
      testDb.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, 'user2fa@example.com']);
    });

    it('should login with valid 2FA code', async () => {
      // Generate valid TOTP code
      const validToken = speakeasy.totp({
        secret: 'JBSWY3DPEHPK3PXP',
        encoding: 'base32'
      });

      const loginData = {
        email: 'user2fa@example.com',
        password: 'password123',
        totpCode: validToken
      };

      const response = await app.request('/api/login-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { token: string; user: { email: string; totpEnabled: boolean } };
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.user.totpEnabled).toBe(true);
    });

    it('should reject login with invalid 2FA code', async () => {
      const loginData = {
        email: 'user2fa@example.com',
        password: 'password123',
        totpCode: '000000'
      };

      const response = await app.request('/api/login-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(401);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid 2FA code');
    });

    it('should reject login when 2FA not enabled', async () => {
      // Create user without 2FA
      const hashedPassword = await hashPassword('password123');
      await createTestUser(testDb, 'no2fa@example.com', hashedPassword);

      const loginData = {
        email: 'no2fa@example.com',
        password: 'password123',
        totpCode: '123456'
      };

      const response = await app.request('/api/login-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(400);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('2FA not enabled');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit registration attempts', async () => {
      const userData = {
        email: 'ratelimit@example.com',
        password: 'password123'
      };

      // Make 6 requests (limit is 5)
      const requests = Array(6).fill(null).map(() =>
        app.request('/api/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.1.100'
          },
          body: JSON.stringify(userData)
        })
      );

      const responses = await Promise.all(requests);
      
      // First 5 should succeed or fail normally, 6th should be rate limited
      const lastResponse = responses[responses.length - 1]!;
      expect(lastResponse).toBeDefined();
      expect(lastResponse.status).toBe(429);
      
      const result = await lastResponse.json() as { error: string };
      expect(result.error).toBe('Too many requests');
    });

    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      // Make 11 requests (limit is 10)
      const requests = Array(11).fill(null).map(() =>
        app.request('/api/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.1.101'
          },
          body: JSON.stringify(loginData)
        })
      );

      const responses = await Promise.all(requests);
      
      // Last response should be rate limited
      const lastResponse = responses[responses.length - 1]!;
      expect(lastResponse).toBeDefined();
      expect(lastResponse.status).toBe(429);
      
      const result = await lastResponse.json() as { error: string };
      expect(result.error).toBe('Too many requests');
    });
  });
}); 