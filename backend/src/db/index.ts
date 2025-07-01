import { Database } from 'bun:sqlite';
import { config } from '../config';

export const db = new Database(config.DATABASE_PATH);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER DEFAULT 0,
  last_login TEXT
)`);
