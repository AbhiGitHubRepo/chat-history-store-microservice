# Deployment Guide

This guide covers deploying the Chat Application Message Store to various environments, from development to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Deployment](#development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Security Considerations](#security-considerations)
- [Scaling & Performance](#scaling--performance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 20.19.0 or higher
- **npm**: 10.8.2 or higher
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for multi-service deployment)
- **PostgreSQL**: 13+ (or use Docker)

### Development Tools
- **Git**: For version control
- **Code Editor**: VS Code, WebStorm, or similar
- **Database Client**: pgAdmin, DBeaver, or similar

## Development Deployment

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd chat-application-message-store
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### 4. Database Setup
```bash
# Start PostgreSQL with Docker
docker compose up -d postgres pgadmin

# Wait for database to be ready
sleep 10

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

#### 5. Start Development Server
```bash
# Development mode with hot reload
npm run dev

# Or start all services with Docker
docker compose up --build
```

#### 6. Verify Deployment
```bash
# Health check
curl http://localhost:4000/health

# API documentation
open http://localhost:4000/docs

# Database admin (optional)
open http://localhost:5050
```

### Development with Docker

#### Using Docker Compose
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down

# Rebuild and restart
docker compose up --build --force-recreate
```

#### Individual Services
```bash
# Database only
docker compose up -d postgres pgadmin

# Application only (requires external DB)
docker compose up --build app
```

## Staging Deployment

### Staging Environment Setup

#### 1. Infrastructure Preparation
```bash
# Create staging environment
mkdir -p staging
cd staging

# Copy configuration
cp ../docker-compose.yml ./docker-compose.staging.yml
cp ../.env.example ./staging.env
```

#### 2. Environment Configuration
```bash
# Edit staging environment
nano staging.env
```

**Staging Environment Variables**:
```env
# Application
NODE_ENV=staging
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@staging-db:5432/chat_app_staging
POSTGRES_HOST=staging-db
POSTGRES_PORT=5432
POSTGRES_USER=chat_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=chat_app_staging

# Security
API_KEY=staging-api-key-here

# Monitoring
ALLOWED_ORIGINS=https://staging.yourdomain.com
```

#### 3. Deploy to Staging
```bash
# Build and deploy
docker compose -f docker-compose.staging.yml up -d --build

# Run migrations
docker compose -f docker-compose.staging.yml exec app npm run prisma:migrate

# Verify deployment
curl https://staging.yourdomain.com/health
```

#### 4. Staging Validation
```bash
# Run tests against staging
npm run test:e2e -- --baseUrl=https://staging.yourdomain.com

# Load testing
npm install -g artillery
artillery quick --count 10 --num 10 https://staging.yourdomain.com/health
```

## Production Deployment

### Production Infrastructure

#### 1. Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **Network**: High bandwidth, low latency
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### 2. Production Environment Setup
```bash
# Create production environment
mkdir -p production
cd production

# Copy configuration
cp ../docker-compose.yml ./docker-compose.prod.yml
cp ../.env.example ./production.env
```

#### 3. Production Environment Variables
```bash
# Edit production environment
nano production.env
```

**Production Environment Variables**:
```env
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://prod_user:very_secure_password@prod-db:5432/chat_app_prod
POSTGRES_HOST=prod-db
POSTGRES_PORT=5432
POSTGRES_USER=chat_prod_user
POSTGRES_PASSWORD=very_secure_password_here
POSTGRES_DB=chat_app_prod

# Security
API_KEY=production-api-key-very-secure

# Monitoring & Logging
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Performance
NODE_OPTIONS=--max-old-space-size=2048
```

### Production Deployment Options

#### Option 1: Single Server Deployment
```bash
# Deploy on single server
docker compose -f docker-compose.prod.yml up -d --build

# Setup SSL with Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

#### Option 2: Multi-Server Deployment
```bash
# Database server
docker run -d \
  --name postgres-prod \
  -e POSTGRES_DB=chat_app_prod \
  -e POSTGRES_USER=chat_prod_user \
  -e POSTGRES_PASSWORD=secure_password \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# Application server
docker run -d \
  --name chat-app-prod \
  -e DATABASE_URL=postgresql://chat_prod_user:secure_password@db-server:5432/chat_app_prod \
  -e API_KEY=production-api-key \
  -p 4000:4000 \
  chat-app:latest
```

#### Option 3: Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chat-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chat-app
  template:
    metadata:
      labels:
        app: chat-app
    spec:
      containers:
      - name: chat-app
        image: chat-app:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: chat-app-secrets
              key: database-url
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: chat-app-secrets
              key: api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: chat-app-service
spec:
  selector:
    app: chat-app
  ports:
  - port: 80
    targetPort: 4000
  type: LoadBalancer
```

## Docker Deployment

### Production Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:20.19.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Production stage
FROM node:20.19.0-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main.js"]
```

### Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/chat_app
      - API_KEY=${API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=chat_app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d chat_app"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Deploy
```bash
# Build production image
docker build -t chat-app:latest .

# Tag for registry
docker tag chat-app:latest your-registry/chat-app:latest

# Push to registry
docker push your-registry/chat-app:latest

# Deploy with compose
docker compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Environment Variables Reference

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `NODE_ENV` | Environment mode | Yes | development | `production` |
| `PORT` | Application port | Yes | 4000 | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - | `postgresql://user:pass@host:5432/db` |
| `API_KEY` | API authentication key | No | - | `your-secure-api-key` |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | * | `https://yourdomain.com` |
| `POSTGRES_HOST` | Database host | Yes | localhost | `localhost` |
| `POSTGRES_PORT` | Database port | Yes | 5432 | `5432` |
| `POSTGRES_USER` | Database username | Yes | - | `chat_user` |
| `POSTGRES_PASSWORD` | Database password | Yes | - | `secure_password` |
| `POSTGRES_DB` | Database name | Yes | - | `chat_app` |

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/chat_app_dev
API_KEY=dev-api-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Staging
```env
NODE_ENV=staging
PORT=4000
DATABASE_URL=postgresql://staging_user:staging_password@staging-db:5432/chat_app_staging
API_KEY=staging-api-key
ALLOWED_ORIGINS=https://staging.yourdomain.com
```

#### Production
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://prod_user:very_secure_password@prod-db:5432/chat_app_prod
API_KEY=production-api-key-very-secure
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Database Setup

### PostgreSQL Configuration

#### Production Database Settings
```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### Database Initialization
```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE chat_app_prod;
CREATE USER chat_prod_user WITH PASSWORD 'very_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chat_app_prod TO chat_prod_user;
\q

# Run migrations
npm run prisma:migrate

# Verify setup
psql -h localhost -U chat_prod_user -d chat_app_prod -c "\dt"
```

### Database Backup Strategy
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="chat_app_prod"

# Create backup
pg_dump -h localhost -U chat_prod_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Setup cron job (daily backup at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Monitoring & Health Checks

### Health Check Endpoints
```bash
# Application health
curl http://localhost:4000/health

# Database connectivity (custom endpoint)
curl http://localhost:4000/health/db

# System metrics (if implemented)
curl http://localhost:4000/metrics
```

### Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'chat-app'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Chat Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### Log Management
```bash
# Configure log rotation
cat > /etc/logrotate.d/chat-app << 'EOF'
/var/log/chat-app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        systemctl reload chat-app
    endscript
}
EOF
```

## Security Considerations

### API Security
```bash
# Generate secure API key
openssl rand -hex 32

# Set secure headers
# Add to nginx configuration:
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Database Security
```sql
-- Create read-only user for monitoring
CREATE USER chat_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE chat_app_prod TO chat_readonly;
GRANT USAGE ON SCHEMA public TO chat_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO chat_readonly;

-- Revoke unnecessary privileges
REVOKE CREATE ON SCHEMA public FROM chat_prod_user;
```

### SSL/TLS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Scaling & Performance

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/chat_app
      - API_KEY=${API_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=chat_app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### Load Balancer Configuration
```nginx
# nginx-lb.conf
upstream chat_app {
    server app_1:4000;
    server app_2:4000;
    server app_3:4000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://chat_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Performance Optimization
```bash
# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"

# Database connection pooling
# Add to Prisma schema:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 20
}
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker compose logs app

# Check port conflicts
netstat -tulpn | grep :4000

# Check environment variables
docker compose exec app env | grep DATABASE_URL
```

#### Database Connection Issues
```bash
# Test database connectivity
docker compose exec app npx prisma db pull

# Check database status
docker compose exec postgres pg_isready -U user -d chat_app

# Reset database
docker compose exec app npx prisma migrate reset
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats

# Increase memory limits
docker run -m 2g --oom-kill-disable chat-app:latest
```

#### Performance Issues
```bash
# Check database performance
docker compose exec postgres psql -U user -d chat_app -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# Monitor application metrics
curl http://localhost:4000/metrics
```

### Debugging Commands
```bash
# Application debugging
docker compose exec app npm run debug

# Database debugging
docker compose exec postgres psql -U user -d chat_app

# Network debugging
docker compose exec app ping postgres
docker compose exec app nslookup postgres
```

### Recovery Procedures

#### Database Recovery
```bash
# Restore from backup
gunzip backup_20240101_020000.sql.gz
psql -h localhost -U chat_prod_user -d chat_app_prod < backup_20240101_020000.sql

# Verify restoration
psql -h localhost -U chat_prod_user -d chat_app_prod -c "SELECT COUNT(*) FROM sessions;"
```

#### Application Rollback
```bash
# Rollback to previous version
docker tag chat-app:latest chat-app:broken
docker tag chat-app:previous chat-app:latest
docker compose up -d --force-recreate app
```

---

This deployment guide provides comprehensive instructions for deploying the Chat Application Message Store across different environments, from development to production.
