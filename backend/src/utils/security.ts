import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export async function hashPassword(password: string) {
  return await Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash);
}

export function generateJWT(user: any) {
  return jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: '7d' });
}

export function isValidEmail(email: string) {
  // More strict email validation that rejects emails like 'test@.com'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional checks for edge cases
  if (email.includes('..') || email.startsWith('@') || email.endsWith('@') || 
      email.includes(' ') || email.includes('@.') || email.includes('.@')) {
    return false;
  }
  
  return true;
}

export function isValidPassword(password: string) {
  return typeof password === 'string' && password.length >= 8;
}
