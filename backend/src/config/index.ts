export const config = {
  // Application Configuration
  NODE_ENV: Bun.env.NODE_ENV || 'development',
  PORT: Number(Bun.env.PORT) || 3001,
  
  // Database Configuration
  DATABASE_PATH: Bun.env.DATABASE_PATH || 'auth-app.sqlite',
  
  // Security Configuration
  JWT_SECRET: Bun.env.JWT_SECRET || 'supersecret',
  
  // CORS Configuration
  ALLOWED_ORIGINS: Bun.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
   
  ],
  
  // Rate Limiting Configuration
  RATE_LIMIT: {
    REGISTER_MAX: Number(Bun.env.RATE_LIMIT_REGISTER_MAX) || 5,
    LOGIN_MAX: Number(Bun.env.RATE_LIMIT_LOGIN_MAX) || 10,
    WINDOW_MS: Number(Bun.env.RATE_LIMIT_WINDOW_MS) || 60000
  }
};

export default config;
