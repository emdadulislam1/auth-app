import { db } from '../db';
import { hashPassword, verifyPassword, generateJWT, isValidEmail, isValidPassword } from '../utils/security';
import { rateLimit } from '../middleware/rateLimit';
import { log, logError } from '../middleware/logger';
import { authMiddleware } from '../middleware/auth';
import { speakeasy, QRCode } from '../utils/totp';
import { Hono } from 'hono';

export function registerAuthRoutes(app: Hono) {
  // Register
  app.post('/api/register', async (c: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    if (rateLimit(ip, 'register', 5, 60_000)) {
      log('Rate limit hit for register', ip);
      return c.json({ error: 'Too many requests' }, 429);
    }
    const { email, password } = await c.req.json();
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return c.json({ error: 'Invalid email or password' }, 400);
    }
    const hash = await hashPassword(password);
    try {
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
      log('User registered', email);
      return c.json({ success: true });
    } catch (e) {
      logError('Register error', e);
      return c.json({ error: 'Registration failed' }, 400);
    }
  });

  // Login
  app.post('/api/login', async (c: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    if (rateLimit(ip, 'login', 10, 60_000)) {
      log('Rate limit hit for login', ip);
      return c.json({ error: 'Too many requests' }, 429);
    }
    const { email, password } = await c.req.json();
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const user: any = db.query('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
    if (user.totp_enabled) {
      log('Login requires 2FA', email);
      return c.json({ requiresTOTP: true });
    }
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
    const token = generateJWT(user);
    log('User logged in', email);
    return c.json({ token, user: { email: user.email, totpEnabled: !!user.totp_enabled } });
  });

  // Login with 2FA
  app.post('/api/login-2fa', async (c: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    if (rateLimit(ip, 'login2fa', 10, 60_000)) {
      log('Rate limit hit for login-2fa', ip);
      return c.json({ error: 'Too many requests' }, 429);
    }
    const { email, password, totpCode } = await c.req.json();
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const user: any = db.query('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
    if (!user.totp_enabled || !user.totp_secret) return c.json({ error: '2FA not enabled' }, 400);
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });
    if (!verified) return c.json({ error: 'Invalid 2FA code' }, 401);
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
    const token = generateJWT(user);
    log('User logged in with 2FA', email);
    return c.json({ token, user: { email: user.email, totpEnabled: !!user.totp_enabled } });
  });

  // 2FA Setup (generate secret, return QR code URL)
  app.post('/api/2fa/setup', authMiddleware, async (c: any) => {
    const user = c.get('user');
    const secret = speakeasy.generateSecret({ name: `AuthApp:${user.email}`, issuer: 'AuthApp' });
    db.run('UPDATE users SET totp_secret = ? WHERE id = ?', [secret.base32, user.id]);
    const otpauthUrl = secret.otpauth_url;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    log('2FA setup started', user.email);
    return c.json({ secret: secret.base32, qrCode: qrCodeDataUrl });
  });

  // 2FA Verify (enable 2FA)
  app.post('/api/2fa/verify', authMiddleware, async (c: any) => {
    const user = c.get('user');
    const { token } = await c.req.json();
    const dbUser: any = db.query('SELECT * FROM users WHERE id = ?').get(user.id);
    if (!dbUser || !dbUser.totp_secret) return c.json({ error: 'No 2FA setup in progress' }, 400);
    const verified = speakeasy.totp.verify({
      secret: dbUser.totp_secret,
      encoding: 'base32',
      token,
      window: 1
    });
    if (!verified) return c.json({ error: 'Invalid code' }, 400);
    db.run('UPDATE users SET totp_enabled = 1 WHERE id = ?', [user.id]);
    log('2FA enabled', user.email);
    return c.json({ success: true });
  });

  // 2FA Disable
  app.post('/api/2fa/disable', authMiddleware, async (c: any) => {
    const user = c.get('user');
    db.run('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?', [user.id]);
    log('2FA disabled', user.email);
    return c.json({ success: true });
  });
}
