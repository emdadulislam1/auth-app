import { Database } from 'bun:sqlite';

// Create in-memory database for testing
export function createTestDatabase() {
  const db = new Database(':memory:');
  
  // Create the same schema as production
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    totp_secret TEXT,
    totp_enabled INTEGER DEFAULT 0,
    last_login TEXT
  )`);

  return db;
}

// Helper to clean up database
export function cleanupTestDatabase(db: Database) {
  try {
    db.run('DELETE FROM users');
  } catch (error) {
    // Database might already be closed
  }
  db.close();
}

// Helper to create test user
export async function createTestUser(db: Database, email: string = 'test@example.com', passwordHash: string = 'hashedpassword') {
  const result = db.run(
    'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id',
    [email, passwordHash]
  );
  
  return {
    id: result.lastInsertRowid,
    email,
    password_hash: passwordHash,
    totp_enabled: 0,
    totp_secret: null,
    last_login: null
  };
}

// Helper to create test user with 2FA
export async function createTestUserWith2FA(db: Database, email: string = 'test2fa@example.com', totpSecret: string = 'JBSWY3DPEHPK3PXP') {
  const result = db.run(
    'INSERT INTO users (email, password_hash, totp_secret, totp_enabled) VALUES (?, ?, ?, 1)',
    [email, 'hashedpassword', totpSecret]
  );
  
  return {
    id: result.lastInsertRowid,
    email,
    password_hash: 'hashedpassword',
    totp_enabled: 1,
    totp_secret: totpSecret,
    last_login: null
  };
}

// Helper to get user by email
export function getUserByEmail(db: Database, email: string) {
  return db.query('SELECT * FROM users WHERE email = ?').get(email);
}

// Helper to count users
export function getUserCount(db: Database) {
  const result = db.query('SELECT COUNT(*) as count FROM users').get() as any;
  return result.count;
} 