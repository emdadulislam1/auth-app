import { serve } from 'bun';
import { app } from './app';
import { log } from './middleware/logger';
import { config } from './config';

serve({ fetch: app.fetch, port: config.PORT });
log(`API server running on http://localhost:${config.PORT}`);
