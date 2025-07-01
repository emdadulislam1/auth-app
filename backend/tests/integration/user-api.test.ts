import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Hono } from 'hono';
import { registerUserRoutes } from '../../src/api/user';
import { generateJWT } from '../../src/utils/security';
import { createTestDatabase, cleanupTestDatabase, createTestUser, createTestUserWith2FA } from '../helpers/database';

let testDb: any;

describe('User API', () => {
  let app: Hono;

  beforeEach(() => {
    // Create test database
    testDb = createTestDatabase();
    
    // Mock the db import
    mock.module('../../src/db', () => ({
      db: testDb
    }));

    // Create fresh app instance
    app = new Hono();
    registerUserRoutes(app);
  });

  afterEach(() => {
    if (testDb) {
      cleanupTestDatabase(testDb);
    }
    mock.restore();
  });

  describe('GET /api/me', () => {
    it('should return user info for valid authenticated user', async () => {
      // Create test user
      const user = await createTestUser(testDb, 'test@example.com', 'hashedpassword');
      const token = generateJWT(user);

      const response = await app.request('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { email: string; totpEnabled: boolean; lastLogin: string | null };
      expect(result.email).toBe('test@example.com');
      expect(result.totpEnabled).toBe(false);
      expect(result.lastLogin).toBeNull();
    });

    it('should return user info for user with 2FA enabled', async () => {
      // Create test user with 2FA
      const user = await createTestUserWith2FA(testDb, 'test2fa@example.com', 'JBSWY3DPEHPK3PXP');
      const token = generateJWT(user);

      const response = await app.request('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { email: string; totpEnabled: boolean; lastLogin: string | null };
      expect(result.email).toBe('test2fa@example.com');
      expect(result.totpEnabled).toBe(true);
      expect(result.lastLogin).toBeNull();
    });

    it('should return 401 without authorization header', async () => {
      const response = await app.request('/api/me', {
        method: 'GET'
      });

      expect(response.status).toBe(401);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Unauthorized');
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.request('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      expect(response.status).toBe(401);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('Invalid token');
    });

    it('should return 404 when user does not exist in database', async () => {
      // Create token for non-existent user
      const fakeUser = { id: 999, email: 'nonexistent@example.com' };
      const token = generateJWT(fakeUser);

      const response = await app.request('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(404);
      const result = await response.json() as { error: string };
      expect(result.error).toBe('User not found');
    });

    it('should include lastLogin timestamp when available', async () => {
      // Create test user and update last login
      const user = await createTestUser(testDb, 'test@example.com', 'hashedpassword');
      const loginTime = new Date().toISOString();
      testDb.run('UPDATE users SET last_login = ? WHERE id = ?', [loginTime, user.id]);
      
      const token = generateJWT(user);

      const response = await app.request('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      const result = await response.json() as { email: string; totpEnabled: boolean; lastLogin: string | null };
      expect(result.email).toBe('test@example.com');
      expect(result.totpEnabled).toBe(false);
      expect(result.lastLogin).toBe(loginTime);
    });
  });
}); 