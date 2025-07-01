#!/bin/bash

# 🔐 Auth App Setup Script
# This script automates the initial setup process for the Auth App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${PURPLE}"
    echo "🔐 Auth App Setup"
    echo "=================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

# Generate random secret
generate_secret() {
    openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n' 2>/dev/null || echo "change-this-secret-in-production"
}

print_header

# Check prerequisites
print_step "Checking prerequisites..."

if check_command bun; then
    BUN_VERSION=$(bun --version)
    print_success "Bun found (version: $BUN_VERSION)"
else
    print_error "Bun is not installed. Please install Bun from https://bun.sh/"
    exit 1
fi

if check_command git; then
    print_success "Git found"
else
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Create environment files
print_step "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    JWT_SECRET=$(generate_secret)
    cat > backend/.env << EOF
# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=3001

# Database Configuration (optional)
# DATABASE_PATH=./auth-app.sqlite
EOF
    print_success "Created backend/.env with secure JWT secret"
else
    print_warning "backend/.env already exists, skipping..."
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
EOF
    print_success "Created frontend/.env"
else
    print_warning "frontend/.env already exists, skipping..."
fi

# Install dependencies
print_step "Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
if bun install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

echo "Installing frontend dependencies..."
cd ../frontend
if bun install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Initialize database
print_step "Initializing database..."
cd backend
if timeout 10s bun run src/server.ts > /dev/null 2>&1 & 
then
    sleep 3
    pkill -f "bun run src/server.ts" 2>/dev/null || true
    if [ -f "auth-app.sqlite" ]; then
        print_success "Database initialized"
    else
        print_warning "Database file not found, will be created on first run"
    fi
else
    print_warning "Could not verify database initialization"
fi
cd ..

# Create startup scripts
print_step "Creating startup scripts..."

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash

# 🔐 Auth App Startup Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔐 Starting Auth App...${NC}"
echo

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    jobs -p | xargs kill 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend && bun run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend && bun run dev &
FRONTEND_PID=$!

echo
echo -e "${BLUE}🎉 Auth App is starting up!${NC}"
echo
echo -e "${GREEN}📱 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}🔧 Backend:  http://localhost:3001${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo

# Wait for background processes
wait
EOF

chmod +x start.sh
print_success "Created start.sh script"

# Create package.json for root directory
if [ ! -f "package.json" ]; then
    cat > package.json << 'EOF'
{
  "name": "auth-app",
  "version": "1.0.0",
  "description": "Modern authentication system with 2FA support",
  "scripts": {
    "start": "./start.sh",
    "dev": "./start.sh",
    "setup": "./setup.sh",
    "backend": "cd backend && bun run dev",
    "frontend": "cd frontend && bun run dev",
    "build:frontend": "cd frontend && bun run build",
    "clean": "rm -rf backend/node_modules frontend/node_modules backend/auth-app.sqlite"
  },
  "keywords": ["authentication", "2fa", "jwt", "security", "react", "typescript"],
  "license": "MIT",
  "engines": {
    "bun": ">=1.0.0"
  }
}
EOF
    print_success "Created root package.json"
fi

# Print completion message
echo
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. ${BLUE}Start the application:${NC} ./start.sh"
echo -e "  2. ${BLUE}Open your browser:${NC} http://localhost:5173"
echo -e "  3. ${BLUE}Register a new account${NC}"
echo -e "  4. ${BLUE}Enable 2FA in dashboard${NC}"
echo
echo -e "${CYAN}Available commands:${NC}"
echo -e "  • ${BLUE}bun run start${NC}     - Start both servers"
echo -e "  • ${BLUE}bun run backend${NC}   - Start only backend"
echo -e "  • ${BLUE}bun run frontend${NC}  - Start only frontend"
echo -e "  • ${BLUE}bun run build:frontend${NC} - Build frontend for production"
echo
echo -e "${CYAN}Documentation:${NC}"
echo -e "  • ${BLUE}README.md${NC}         - Project overview"
echo -e "  • ${BLUE}backend/README.md${NC} - Backend documentation"
echo -e "  • ${BLUE}frontend/README.md${NC} - Frontend documentation"
echo -e "  • ${BLUE}CONTRIBUTING.md${NC}   - Contributing guidelines"
echo
echo -e "${GREEN}Happy coding! 🚀${NC}" 