# 🔧 Backend Documentation

The backend is built with [Bun](https://bun.sh/) and [Hono](https://hono.dev/), providing a fast and secure authentication API with SQLite database.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/           # API route handlers
│   │   ├── auth.ts    # Authentication endpoints
│   │   └── user.ts    # User management endpoints
│   ├── config/        # Configuration files
│   ├── db/            # Database setup and models
│   ├── middleware/    # Custom middleware
│   │   ├── auth.ts    # JWT authentication middleware
│   │   ├── cors.ts    # CORS configuration
│   │   ├── logger.ts  # Request logging
│   │   └── rateLimit.ts # Rate limiting
│   ├── utils/         # Utility functions
│   │   ├── security.ts # Password hashing, JWT
│   │   └── totp.ts    # TOTP/2FA utilities
│   ├── app.ts         # Express app configuration
│   └── server.ts      # Server entry point
├── auth-app.sqlite    # SQLite database file
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0

### Installation

```bash
cd backend
bun install
```

### Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_PATH=auth-app.sqlite

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration (comma-separated list)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost,http://localhost:80,http://frontend,http://frontend:80

# Rate Limiting Configuration
RATE_LIMIT_REGISTER_MAX=5
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

**Important Security Notes:**
- Always change `JWT_SECRET` in production
- Use a strong, random JWT secret (at least 32 characters)
- Set `NODE_ENV=production` for production deployments
- Adjust rate limits based on your requirements

### Development

```bash
# Start development server with auto-reload
bun run dev

# Production build and start
bun run build
bun start
```

## 📚 API Reference

### Base URL

```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Error):**
```json
{
  "error": "Registration failed"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters

---

#### Login User

```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success - No 2FA):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "user@example.com",
    "totpEnabled": false
  }
}
```

**Response (Success - 2FA Required):**
```json
{
  "requiresTOTP": true
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### Login with 2FA

```http
POST /api/login-2fa
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "totpCode": "123456"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "user@example.com",
    "totpEnabled": true
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid 2FA code"
}
```

### User Endpoints

#### Get Current User

```http
GET /api/me
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "email": "user@example.com",
  "totpEnabled": true,
  "lastLogin": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "error": "Unauthorized"
}
```

### 2FA Management Endpoints

#### Setup 2FA

```http
POST /api/2fa/setup
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

#### Verify and Enable 2FA

```http
POST /api/2fa/verify
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

---

#### Disable 2FA

```http
POST /api/2fa/disable
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true
}
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER DEFAULT 0,
  last_login TEXT
);
```

**Field Descriptions:**
- `id`: Primary key, auto-incremented
- `email`: User's email address (unique)
- `password_hash`: Bcrypt hashed password
- `totp_secret`: Base32 encoded TOTP secret (null if 2FA not set up)
- `totp_enabled`: Boolean flag (0/1) indicating if 2FA is active
- `last_login`: ISO timestamp of last successful login

## 🔒 Security Features

### Password Security

- **Hashing**: Passwords are hashed using bcrypt with automatic salt generation
- **Validation**: Minimum 8 characters required
- **No Plain Text**: Passwords are never stored in plain text

### JWT Authentication

- **Stateless**: No server-side session storage required
- **Expiration**: Tokens expire after 7 days
- **Claims**: Include user ID and email
- **Secret**: Configurable JWT secret for signing

### Rate Limiting

**Registration**: 5 attempts per minute per IP
**Login**: 10 attempts per minute per IP
**2FA Login**: 10 attempts per minute per IP

### CORS Protection

- **Allowed Origins**: Configurable for development/production
- **Credentials**: Supports credentials for authenticated requests
- **Methods**: Limited to required HTTP methods
- **Headers**: Restricted to necessary headers

### Input Validation

- **Email Format**: RFC compliant email validation
- **Password Strength**: Minimum length enforcement
- **SQL Injection**: Prepared statements prevent injection attacks
- **XSS Protection**: Input sanitization

## 🛠️ Development

### Adding New Endpoints

1. Create route handler in appropriate file (`src/api/`)
2. Add route registration in `src/app.ts`
3. Add necessary middleware (auth, validation, rate limiting)
4. Update documentation

### Middleware Usage

```typescript
// Authentication required
app.post('/api/protected-route', authMiddleware, async (c) => {
  const user = c.get('user'); // JWT payload
  // Route logic here
});

// Rate limiting
app.post('/api/rate-limited', async (c) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  if (rateLimit(ip, 'route-key', 5, 60000)) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  // Route logic here
});
```

### Database Operations

```typescript
import { db } from '../db';

// Insert
db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);

// Select
const user = db.query('SELECT * FROM users WHERE email = ?').get(email);

// Update
db.run('UPDATE users SET last_login = ? WHERE id = ?', [timestamp, userId]);
```

### Error Handling

- **Consistent Format**: All errors return JSON with `error` field
- **HTTP Status Codes**: Appropriate status codes for different error types
- **Logging**: Error details logged for debugging
- **Security**: No sensitive information in error responses

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `supersecret` |
| `PORT` | Server port | `3001` |
| `DATABASE_PATH` | SQLite database file path | `./auth-app.sqlite` |

### CORS Settings

Development allows `localhost:5173` and `localhost:5174`. For production, update the allowed origins in `src/app.ts`.

## 🧪 Testing

```bash
# Test registration
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'

# Test login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'

# Test protected route
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/me
```

## 📈 Performance

- **Runtime**: Bun provides excellent JavaScript performance
- **Framework**: Hono is optimized for speed and low overhead
- **Database**: SQLite provides fast local development and deployment
- **Middleware**: Minimal middleware stack for optimal performance

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set secure `JWT_SECRET`
2. **CORS**: Update allowed origins for production domain
3. **Database**: Consider PostgreSQL for production use
4. **SSL/TLS**: Ensure HTTPS in production
5. **Rate Limiting**: Adjust limits based on expected traffic
6. **Monitoring**: Add logging and monitoring solutions

### Docker Deployment

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

COPY . .
EXPOSE 3001

CMD ["bun", "run", "src/server.ts"]
```

## 🤝 Contributing

When contributing to the backend:

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Add tests for new features
6. Ensure security considerations

## 📞 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

**Database locked:**
```bash
rm auth-app.sqlite
# Restart server to recreate database
```

**CORS errors:**
- Check frontend port matches allowed origins in `src/app.ts`
- Ensure backend is running on correct port

**JWT errors:**
- Verify `JWT_SECRET` is set
- Check token format in Authorization header
