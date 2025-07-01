# 🐳 Docker Deployment Guide

This guide covers deploying the Auth App using Docker and Docker Compose for both development and production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🔧 Prerequisites

### Required Software

- **Docker**: >= 20.0.0
  - [Download Docker Desktop](https://docs.docker.com/get-docker/)
  - [Install Docker on Linux](https://docs.docker.com/engine/install/)

- **Docker Compose**: >= 2.0.0
  - Included with Docker Desktop
  - [Install separately on Linux](https://docs.docker.com/compose/install/)

### System Requirements

- **Memory**: Minimum 2GB RAM available for containers
- **Storage**: At least 1GB free space for images and volumes
- **Ports**: 80 (frontend) and 3001 (backend) must be available

## 🚀 Quick Start

### Automated Setup

The fastest way to get started is using our setup script:

```bash
# Clone the repository
git clone https://github.com/emdadulislam1/auth-app.git
cd auth-app

# Run the automated setup
./docker-setup.sh
```

This script will:
1. ✅ Verify Docker installation
2. 🔐 Generate secure environment variables
3. 🏗️ Build Docker images
4. 🚀 Start all services
5. 🩺 Perform health checks
6. 📊 Display service status

### Manual Quick Start

If you prefer manual control:

```bash
# Clone and navigate
git clone https://github.com/emdadulislam1/auth-app.git
cd auth-app

# Copy environment template
cp docker.env .env

# Generate secure JWT secret
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env

# Build and start services
docker compose up --build -d

# Check status
docker compose ps
```

## 🛠️ Manual Setup

### Step 1: Environment Configuration

Create a `.env` file in the project root:

```env
# JWT Secret (generate a secure one)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DATABASE_PATH=/app/data/auth-app.sqlite

# Application Configuration
NODE_ENV=production
PORT=3001

# Optional: Security Configuration
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: CORS Configuration
# CORS_ORIGIN=https://yourdomain.com
```

### Step 2: Build Images

```bash
# Build all services
docker compose build

# Or build individually
docker compose build backend
docker compose build frontend
```

### Step 3: Start Services

```bash
# Start in detached mode
docker compose up -d

# Start with logs visible
docker compose up

# Start specific services
docker compose up backend frontend
```

### Step 4: Verify Deployment

```bash
# Check service status
docker compose ps

# View logs
docker compose logs

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost/health
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `DATABASE_PATH` | SQLite database file path | `/app/data/auth-app.sqlite` | ❌ |
| `NODE_ENV` | Environment mode | `production` | ❌ |
| `PORT` | Backend service port | `3001` | ❌ |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | ❌ |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15min) | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | ❌ |

### Service Configuration

#### Backend Service
- **Image**: Custom Bun + Alpine Linux
- **Port**: 3001
- **Health Check**: `/api/health` endpoint
- **Volume**: Persistent database storage
- **Security**: Non-root user, minimal dependencies

#### Frontend Service
- **Image**: Multi-stage build (Bun builder + Nginx)
- **Port**: 80
- **Health Check**: `/health` endpoint
- **Features**: Gzip compression, security headers, SPA routing
- **API Proxy**: Nginx proxies `/api/*` to backend

### Docker Compose Services

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - backend_data:/app/data
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🌐 Production Deployment

### Security Considerations

1. **Generate Strong JWT Secret**:
   ```bash
   openssl rand -base64 64
   ```

2. **Configure CORS Properly**:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Use HTTPS**: Deploy behind a reverse proxy (Nginx, Traefik, Cloudflare)

4. **Update Regularly**: Keep Docker images updated

### Reverse Proxy Setup

#### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Traefik Configuration

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.myresolver.acme.email=your-email@domain.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"

  backend:
    build: ./backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"
```

## 📊 Monitoring & Maintenance

### Health Checks

Both services include health checks:

```bash
# Check service health
curl -f http://localhost:3001/api/health
curl -f http://localhost/health

# View health status
docker compose ps
```

### Logging

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Service-specific logs
docker compose logs backend
docker compose logs frontend

# Last N lines
docker compose logs --tail=50 backend
```

### Backup & Restore

#### Database Backup
```bash
# Create backup
docker compose exec backend sh -c 'cp /app/data/auth-app.sqlite /app/data/backup-$(date +%Y%m%d-%H%M%S).sqlite'

# Copy backup to host
docker cp auth-app-backend:/app/data/backup-20231201-120000.sqlite ./backup.sqlite
```

#### Volume Backup
```bash
# Backup volume data
docker run --rm -v auth-app_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore volume data
docker run --rm -v auth-app_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

### Updates

```bash
# Update to latest images
docker compose pull
docker compose up -d

# Rebuild and update
docker compose up --build -d

# Update specific service
docker compose up --build backend -d
```

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start

1. **Check port conflicts**:
   ```bash
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3001
   ```

2. **Check Docker daemon**:
   ```bash
   docker info
   systemctl status docker  # On Linux
   ```

3. **Check logs**:
   ```bash
   docker compose logs backend
   docker compose logs frontend
   ```

#### Backend Connection Issues

1. **Verify backend health**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check environment variables**:
   ```bash
   docker compose exec backend env | grep JWT_SECRET
   ```

3. **Database permissions**:
   ```bash
   docker compose exec backend ls -la /app/data/
   ```

#### Frontend Not Loading

1. **Check nginx configuration**:
   ```bash
   docker compose exec frontend nginx -t
   ```

2. **Verify build artifacts**:
   ```bash
   docker compose exec frontend ls -la /usr/share/nginx/html/
   ```

3. **Check API proxy**:
   ```bash
   curl -v http://localhost/api/health
   ```

### Performance Issues

#### High Memory Usage

```bash
# Check container resource usage
docker stats

# Limit container memory
echo "
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
" >> docker-compose.override.yml
```

#### Slow Database

```bash
# Check database size
docker compose exec backend sh -c 'ls -lh /app/data/auth-app.sqlite'

# Vacuum database
docker compose exec backend sh -c 'echo "VACUUM;" | sqlite3 /app/data/auth-app.sqlite'
```

### Debug Mode

Enable debug logging:

```bash
# Add to .env
echo "DEBUG=true" >> .env

# Restart services
docker compose restart
```

## ⚡ Advanced Configuration

### Custom Nginx Configuration

Create `frontend/nginx.custom.conf`:

```nginx
# Custom rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    # ... existing configuration ...
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        # ... existing proxy configuration ...
    }
}
```

Update Dockerfile:
```dockerfile
COPY nginx.custom.conf /etc/nginx/conf.d/default.conf
```

### Multi-Environment Setup

Create environment-specific compose files:

**docker-compose.dev.yml**:
```yaml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=development
      - DEBUG=true
    volumes:
      - ./backend/src:/app/src:ro

  frontend:
    command: ["npm", "run", "dev"]
    ports:
      - "5173:5173"
```

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  backend:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  frontend:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

Use with:
```