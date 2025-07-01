import { describe, it, expect, beforeEach } from 'bun:test';
import * as jwt from 'jsonwebtoken';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  isValidEmail,
  isValidPassword
} from '../../src/utils/security';

describe('Security Utils', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Verification', () => {
    it('should verify a correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject password with invalid hash', async () => {
      const password = 'testpassword123';
      const invalidHash = 'invalid-hash';
      
      try {
        await verifyPassword(password, invalidHash);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('JWT Generation', () => {
    it('should generate a valid JWT token', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateJWT(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate tokens with correct payload', () => {
      const user = { id: 123, email: 'user@test.com' };
      const token = generateJWT(user);
      
      const secret = Bun.env.JWT_SECRET || 'supersecret';
      const decoded = jwt.verify(token, secret) as any;
      
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should generate different tokens for different users', () => {
      const user1 = { id: 1, email: 'user1@test.com' };
      const user2 = { id: 2, email: 'user2@test.com' };
      
      const token1 = generateJWT(user1);
      const token2 = generateJWT(user2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
        'simple@test.io'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test @example.com',
        '',
        'test@.com'
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate passwords with minimum length', () => {
      const validPasswords = [
        'password123',
        'verylongpassword',
        '12345678',
        'Pass123!'
      ];

      validPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    it('should reject passwords that are too short', () => {
      const invalidPasswords = [
        'short',
        '1234567',
        '',
        'pass'
      ];

      invalidPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should reject non-string passwords', () => {
      const invalidPasswords = [
        null,
        undefined,
        123,
        {},
        []
      ];

      invalidPasswords.forEach(password => {
        expect(isValidPassword(password as any)).toBe(false);
      });
    });
  });
}); 