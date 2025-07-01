import { generateJWT } from '../utils/security';
import { logError } from './logger';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (e) {
    logError('JWT error', e);
    return c.json({ error: 'Invalid token' }, 401);
  }
}
