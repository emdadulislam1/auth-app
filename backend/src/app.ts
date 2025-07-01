import { Hono } from 'hono';
import { registerAuthRoutes } from './api/auth';
import { registerUserRoutes } from './api/user';
import { log } from './middleware/logger';
import { config } from './config';

const app = new Hono();

app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV
  });
});

app.use('*', async (c, next) => {
  const origin = c.req.header('origin');
  
  if (origin && config.ALLOWED_ORIGINS.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  
  if (c.req.method === 'OPTIONS') {
    c.status(204);
    return c.text('');
  }
  
  log('Request', c.req.method, c.req.url);
  return await next();
});

registerAuthRoutes(app);
registerUserRoutes(app);

export { app };
