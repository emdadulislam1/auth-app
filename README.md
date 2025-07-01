# 🔐 Auth App - Modern Authentication System

A full-stack authentication application built with modern technologies, featuring secure user registration, login, and Two-Factor Authentication (2FA) using TOTP.

## ✨ Features

- **🔒 Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **📱 Two-Factor Authentication**: TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, etc.)
- **🛡️ Security Features**: Rate limiting, CORS protection, secure headers
- **⚡ Modern Tech Stack**: React + TypeScript frontend, Bun + Hono backend
- **🎨 Beautiful UI**: Modern, responsive design with Tailwind CSS
- **📊 Real-time Feedback**: Loading states, error handling, and user feedback
- **🔄 State Management**: React Query for efficient data fetching and caching

## 🏗️ Architecture

```
auth-app/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Bun + Hono + SQLite
└── docs/             # Documentation
```

## 🚀 Quick Start

Choose your preferred deployment method:

### 🐳 Docker Deployment (Recommended)

**Prerequisites:**
- [Docker](https://docs.docker.com/get-docker/) >= 20.0.0
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0.0

**One-command setup:**
```bash
git clone https://github.com/emdadulislam1/auth-app.git
cd auth-app
./docker-setup.sh
```

The setup script will:
- ✅ Check Docker prerequisites
- 🔐 Generate secure environment configuration
- 🏗️ Build and start all services
- 🩺 Wait for health checks to pass
- 🎉 Show you the running application URLs

**Access your application:**
- 🌐 Frontend: http://localhost
- 🔌 Backend API: http://localhost:3001/api
- 💓 Health Check: http://localhost:3001/api/health

**Docker management commands:**
```bash
./docker-setup.sh --help      # Show all available options
./docker-setup.sh --logs      # View service logs
./docker-setup.sh --status    # Check service status
./docker-setup.sh --stop      # Stop all services
./docker-setup.sh --restart   # Restart services
./docker-setup.sh --clean     # Stop and remove all data
```

📖 **For detailed Docker deployment information, see [DOCKER.md](DOCKER.md)**

### 💻 Local Development

**Prerequisites:**
- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18.0.0 (for some frontend tooling)

**Installation:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/emdadulislam1/auth-app.git
   cd auth-app
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   bun install
   
   # Frontend
   cd ../frontend
   bun install
   ```

3. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   bun run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   bun run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173 (or http://localhost:5174 if 5173 is in use)
   - Backend API: http://localhost:3001

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📱 Usage

### Registration
1. Navigate to the registration page
2. Enter your email and password (minimum 8 characters)
3. Click "Register" to create your account

### Login
1. Enter your email and password
2. If 2FA is enabled, you'll be redirected to the verification page
3. Enter the 6-digit code from your authenticator app

### Setting up 2FA
1. After logging in, go to the dashboard
2. Click "Enable MFA"
3. Scan the QR code with your authenticator app
4. Enter the verification code to enable 2FA

## 🛠️ Development

### Backend Development
```bash
cd backend
bun run dev        # Start with auto-reload
```

### Frontend Development
```bash
cd frontend
bun run dev        # Start development server
bun run build      # Build for production
bun run preview    # Preview production build
```

### Database

The application uses SQLite with the following schema:

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

## 🔒 Security Features

- **Password Hashing**: Bcrypt with automatic salting
- **JWT Tokens**: Secure, stateless authentication
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Email and password validation
- **TOTP 2FA**: Time-based one-time passwords for enhanced security

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/login-2fa` - Login with 2FA verification
- `GET /api/me` - Get current user info

### 2FA Endpoints

- `POST /api/2fa/setup` - Initialize 2FA setup
- `POST /api/2fa/verify` - Enable 2FA with verification
- `POST /api/2fa/disable` - Disable 2FA

For detailed API documentation, see [Backend Documentation](./backend/README.md).

## 🎨 Frontend Documentation

The frontend is built with React, TypeScript, and modern development practices. For detailed information, see [Frontend Documentation](./frontend/README.md).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hono](https://hono.dev/) - Ultra-fast web framework
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Speakeasy](https://github.com/speakeasyjs/speakeasy) - TOTP implementation

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or reach out to the maintainers.

---

**⭐ If you find this project helpful, please consider giving it a star!** 