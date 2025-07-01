#!/bin/bash

# Auth App Docker Setup Script
# This script helps you get the Auth App running with Docker quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Generate environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        
        # Generate a secure JWT secret
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n')
        
        cat > .env << EOF
# Auth App Docker Environment Configuration
# Generated on $(date)

# JWT Secret - Automatically generated secure key
JWT_SECRET=${JWT_SECRET}

# Database Configuration
DATABASE_PATH=/app/data/auth-app.sqlite

# Application Configuration
NODE_ENV=production
PORT=3001

# Security Configuration (Optional - defaults are secure)
# BCRYPT_ROUNDS=12
# JWT_EXPIRES_IN=24h
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration (Optional - defaults allow all origins in development)
# CORS_ORIGIN=https://yourdomain.com
EOF
        
        print_success ".env file created with secure JWT secret!"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting Docker services..."
    
    # Build and start services
    if docker compose version >/dev/null 2>&1; then
        docker compose up --build -d
    else
        docker-compose up --build -d
    fi
    
    print_success "Services started successfully!"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for backend to be healthy
    print_status "Checking backend health..."
    for i in {1..30}; do
        if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
            print_success "Backend is healthy!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend failed to start properly"
            exit 1
        fi
        sleep 2
    done
    
    # Wait for frontend to be healthy
    print_status "Checking frontend health..."
    for i in {1..30}; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            print_success "Frontend is healthy!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend failed to start properly"
            exit 1
        fi
        sleep 2
    done
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo
    
    if docker compose version >/dev/null 2>&1; then
        docker compose ps
    else
        docker-compose ps
    fi
    
    echo
    print_success "🎉 Auth App is now running!"
    echo
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:3001/api"
    echo "Health Check: http://localhost:3001/api/health"
    echo
    echo "To view logs:"
    echo "  docker compose logs -f"
    echo
    echo "To stop services:"
    echo "  docker compose down"
    echo
    echo "To stop and remove volumes:"
    echo "  docker compose down -v"
}

# Main execution
main() {
    echo "🚀 Auth App Docker Setup"
    echo "========================"
    echo
    
    check_prerequisites
    setup_environment
    start_services
    wait_for_services
    show_status
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Auth App Docker Setup Script"
        echo
        echo "Usage: $0 [OPTION]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --stop         Stop all services"
        echo "  --restart      Restart all services"
        echo "  --logs         Show service logs"
        echo "  --status       Show service status"
        echo "  --clean        Stop services and remove volumes"
        echo
        exit 0
        ;;
    --stop)
        print_status "Stopping services..."
        if docker compose version >/dev/null 2>&1; then
            docker compose down
        else
            docker-compose down
        fi
        print_success "Services stopped!"
        exit 0
        ;;
    --restart)
        print_status "Restarting services..."
        if docker compose version >/dev/null 2>&1; then
            docker compose restart
        else
            docker-compose restart
        fi
        print_success "Services restarted!"
        exit 0
        ;;
    --logs)
        if docker compose version >/dev/null 2>&1; then
            docker compose logs -f
        else
            docker-compose logs -f
        fi
        exit 0
        ;;
    --status)
        if docker compose version >/dev/null 2>&1; then
            docker compose ps
        else
            docker-compose ps
        fi
        exit 0
        ;;
    --clean)
        print_warning "This will stop services and remove all data volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if docker compose version >/dev/null 2>&1; then
                docker compose down -v
            else
                docker-compose down -v
            fi
            print_success "Services stopped and volumes removed!"
        else
            print_status "Operation cancelled."
        fi
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 