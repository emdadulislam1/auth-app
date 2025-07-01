import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { Hono } from 'hono';

export function registerUserRoutes(app: Hono) {
  app.get('/api/me', authMiddleware, async (c: any) => {
    const user = c.get('user');
    const dbUser: any = db.query('SELECT * FROM users WHERE id = ?').get(user.id);
    if (!dbUser) return c.json({ error: 'User not found' }, 404);
    return c.json({ email: dbUser.email, totpEnabled: !!dbUser.totp_enabled, lastLogin: dbUser.last_login });
  });
}
