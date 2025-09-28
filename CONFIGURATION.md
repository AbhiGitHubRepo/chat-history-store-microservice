# Configuration Guide

This guide covers all configuration options for the Chat Application Message Store, including environment variables, database settings, security configurations, and performance tuning.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Security Configuration](#security-configuration)
- [Performance Tuning](#performance-tuning)
- [Logging Configuration](#logging-configuration)
- [CORS Configuration](#cors-configuration)
- [Rate Limiting Configuration](#rate-limiting-configuration)
- [Application Configuration](#application-configuration)
- [Development Configuration](#development-configuration)
- [Production Configuration](#production-configuration)
- [Configuration Validation](#configuration-validation)

## Environment Variables

### Core Application Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | Yes | `development` | Environment mode (`development`, `staging`, `production`) |
| `PORT` | number | Yes | `4000` | Port number for the application server |
| `API_KEY` | string | No | - | API key for authentication (if not set, no auth required) |

### Database Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DATABASE_URL` | string | Yes | - | Complete PostgreSQL connection string |
| `POSTGRES_HOST` | string | Yes | `localhost` | PostgreSQL server hostname |
| `POSTGRES_PORT` | number | Yes | `5432` | PostgreSQL server port |
| `POSTGRES_USER` | string | Yes | - | PostgreSQL username |
| `POSTGRES_PASSWORD` | string | Yes | - | PostgreSQL password |
| `POSTGRES_DB` | string | Yes | - | PostgreSQL database name |

### CORS Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `ALLOWED_ORIGINS` | string | No | `*` | Comma-separated list of allowed origins |

### Advanced Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_OPTIONS` | string | No | - | Node.js runtime options |
| `LOG_LEVEL` | string | No | `info` | Logging level (`error`, `warn`, `info`, `debug`) |
| `RATE_LIMIT_WINDOW` | number | No | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | number | No | `60` | Maximum requests per window |

## Database Configuration

### PostgreSQL Connection String Format

The `DATABASE_URL` follows the PostgreSQL connection string format:

```
postgresql://[username[:password]@][hostname][:port][/database][?parameters]
```

### Examples

#### Local Development
```env
DATABASE_URL=postgresql://chat_user:password@localhost:5432/chat_app_dev
```

#### Docker Environment
```env
DATABASE_URL=postgresql://chat_user:password@postgres:5432/chat_app
```

#### Production with SSL
```env
DATABASE_URL=postgresql://chat_user:password@prod-db.example.com:5432/chat_app?sslmode=require
```

#### Connection Pooling
```env
DATABASE_URL=postgresql://chat_user:password@localhost:5432/chat_app?connection_limit=20&pool_timeout=20
```

### Database Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `sslmode` | SSL connection mode | `require`, `prefer`, `disable` |
| `connection_limit` | Maximum connections | `20` |
| `pool_timeout` | Connection pool timeout (seconds) | `20` |
| `connect_timeout` | Connection timeout (seconds) | `10` |
| `statement_timeout` | Query timeout (milliseconds) | `30000` |

### Prisma Configuration

The database configuration is managed through Prisma. Key settings in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Optional: connection pooling settings
  // connection_limit = 20
  // pool_timeout = 20
}
```

## Security Configuration

### API Key Authentication

#### Setting API Keys
```env
# Single API key
API_KEY=your-secure-api-key-here

# Multiple API keys (comma-separated)
API_KEY=key1,key2,key3
```

#### API Key Best Practices
- Use cryptographically secure random strings
- Minimum 32 characters length
- Include mix of letters, numbers, and symbols
- Rotate keys regularly
- Store securely (environment variables, secret management systems)

#### Generate Secure API Key
```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### CORS Configuration

#### Basic CORS Setup
```env
# Allow all origins (development only)
ALLOWED_ORIGINS=*

# Specific origins
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Development origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### CORS Security Considerations
- Never use `*` in production
- Be specific with allowed origins
- Include protocol (http/https)
- Consider subdomain wildcards carefully

## Performance Tuning

### Node.js Performance

#### Memory Configuration
```env
# Increase heap size
NODE_OPTIONS=--max-old-space-size=2048

# Enable optimizations
NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size

# Enable V8 optimizations
NODE_OPTIONS=--max-old-space-size=2048 --gc-interval=100
```

#### Garbage Collection Tuning
```env
# Aggressive garbage collection
NODE_OPTIONS=--max-old-space-size=2048 --gc-interval=100 --gc-global

# Conservative garbage collection
NODE_OPTIONS=--max-old-space-size=4096 --expose-gc
```

### Database Performance

#### Connection Pooling
```env
# Prisma connection settings
DATABASE_URL=postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20
```

#### PostgreSQL Configuration
```sql
-- postgresql.conf optimizations for chat application
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
```

### Application Performance

#### Rate Limiting Tuning
```env
# Adjust rate limits based on usage patterns
RATE_LIMIT_WINDOW=60000    # 1 minute window
RATE_LIMIT_MAX=60          # 60 requests per window

# For high-traffic applications
RATE_LIMIT_MAX=120         # Increase limit
RATE_LIMIT_WINDOW=30000    # Shorter window for better distribution
```

## Logging Configuration

### Log Levels

```env
# Available log levels
LOG_LEVEL=error    # Only errors
LOG_LEVEL=warn     # Warnings and errors
LOG_LEVEL=info     # Info, warnings, and errors (default)
LOG_LEVEL=debug    # All log levels including debug
```

### Structured Logging

The application uses Pino for structured logging. Log format:

```json
{
  "level": 30,
  "time": 1640995200000,
  "pid": 12345,
  "hostname": "server-01",
  "req": {
    "method": "POST",
    "url": "/sessions",
    "headers": {
      "content-type": "application/json",
      "x-api-key": "***"
    }
  },
  "res": {
    "statusCode": 201
  },
  "responseTime": 45
}
```

### Log Configuration Examples

#### Development Logging
```env
LOG_LEVEL=debug
NODE_ENV=development
```

#### Production Logging
```env
LOG_LEVEL=info
NODE_ENV=production
```

#### Debug Logging
```env
LOG_LEVEL=debug
DEBUG=app:*,prisma:*
```

## Rate Limiting Configuration

### Default Settings
- **Window**: 60 seconds (1 minute)
- **Limit**: 60 requests per window
- **Scope**: Per IP address + API key combination

### Customizing Rate Limits

The rate limiting is implemented in `src/common/guard/rate-limit.guard.ts`:

```typescript
const WINDOW_MS = 60_000;  // 1 minute
const LIMIT = 60;          // 60 requests
```

### Environment-Based Rate Limiting

```env
# Conservative rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=30

# Aggressive rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=120

# Shorter window for better distribution
RATE_LIMIT_WINDOW=30000
RATE_LIMIT_MAX=60
```

### Rate Limiting Strategies

#### IP-Based Limiting
```typescript
// Current implementation
const key = req.ip + ':' + (req.headers['x-api-key'] || '');
```

#### User-Based Limiting
```typescript
// Alternative implementation
const key = req.headers['x-user-id'] || req.ip;
```

#### Tiered Limiting
```typescript
// Different limits for different user types
const userTier = req.headers['x-user-tier'] || 'free';
const limits = {
  free: 60,
  premium: 120,
  enterprise: 300
};
```

## Application Configuration

### Server Configuration

#### Port Configuration
```env
# Default port
PORT=4000

# Custom port
PORT=8080

# Multiple ports (if using load balancer)
PORT=4000,4001,4002
```

#### Host Configuration
```typescript
// In main.ts
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4000;
```

### Health Check Configuration

#### Health Check Endpoints
- `/health` - Basic health check
- `/health/db` - Database connectivity check
- `/health/detailed` - Detailed system health

#### Custom Health Checks
```typescript
// Add custom health checks
@Get('health/custom')
healthCustom() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };
}
```

## Development Configuration

### Development Environment Setup

```env
# .env.development
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/chat_app_dev
API_KEY=dev-api-key-12345
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

### Hot Reload Configuration

```json
// nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "watchAssets": true,
    "assets": ["**/*.prisma"]
  }
}
```

### Database Development Setup

```bash
# Development database
createdb chat_app_dev
psql chat_app_dev < migrations/001_initial.sql

# Test database
createdb chat_app_test
```

## Production Configuration

### Production Environment Setup

```env
# .env.production
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://prod_user:very_secure_password@prod-db:5432/chat_app_prod
API_KEY=production-api-key-very-secure
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size
```

### Production Security Settings

```env
# Security headers
SECURITY_HEADERS=true

# CORS settings
ALLOWED_ORIGINS=https://yourdomain.com

# API key rotation
API_KEY_ROTATION_ENABLED=true
API_KEY_EXPIRY_DAYS=90
```

### Production Database Settings

```env
# Production database with SSL
DATABASE_URL=postgresql://prod_user:password@prod-db:5432/chat_app?sslmode=require&connection_limit=20&pool_timeout=20

# Read replica for reporting
READ_REPLICA_URL=postgresql://readonly_user:password@read-replica:5432/chat_app?sslmode=require
```

## Configuration Validation

### Environment Validation

The application validates all environment variables on startup using the configuration in `src/config/validate.ts`:

```typescript
class EnvVars {
  @IsInt() @Min(1) PORT!: number;
  @IsString() @IsOptional() ALLOWED_ORIGINS?: string;
  @IsString() @IsOptional() API_KEY?: string;
  @IsString() POSTGRES_USER!: string;
  @IsString() POSTGRES_PASSWORD!: string;
  @IsString() POSTGRES_DB!: string;
  @IsString() POSTGRES_HOST!: string;
  @IsInt() POSTGRES_PORT!: number;
  @IsString() DATABASE_URL!: string;
}
```

### Configuration Testing

```bash
# Test configuration validation
npm run config:validate

# Test with invalid configuration
NODE_ENV=invalid npm start
```

### Configuration Examples

#### Minimal Configuration
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/chat_app
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=chat_app
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

#### Full Configuration
```env
# Application
NODE_ENV=production
PORT=4000
API_KEY=your-secure-api-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chat_app?sslmode=require
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=chat_app
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Performance
NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60
```

### Configuration Templates

#### Development Template
```env
# Development Environment
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/chat_app_dev
API_KEY=dev-api-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

#### Staging Template
```env
# Staging Environment
NODE_ENV=staging
PORT=4000
DATABASE_URL=postgresql://staging_user:staging_password@staging-db:5432/chat_app_staging
API_KEY=staging-api-key
ALLOWED_ORIGINS=https://staging.yourdomain.com
LOG_LEVEL=info
```

#### Production Template
```env
# Production Environment
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://prod_user:very_secure_password@prod-db:5432/chat_app_prod?sslmode=require
API_KEY=production-api-key-very-secure
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size
```

## Configuration Management

### Environment-Specific Files

```
.env                    # Default environment
.env.local             # Local overrides (git-ignored)
.env.development       # Development environment
.env.staging          # Staging environment
.env.production       # Production environment
.env.test             # Test environment
```

### Configuration Loading Order

1. `.env`
2. `.env.local`
3. `.env.${NODE_ENV}`
4. `.env.${NODE_ENV}.local`

### Configuration Secrets

#### Using Secret Management
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id chat-app/database --query SecretString --output text

# HashiCorp Vault
vault kv get -field=database_url secret/chat-app

# Azure Key Vault
az keyvault secret show --vault-name chat-app-vault --name database-url --query value -o tsv
```

#### Docker Secrets
```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
    secrets:
      - database_url

secrets:
  database_url:
    file: ./secrets/database_url.txt
```

---

This configuration guide provides comprehensive information about all configuration options available in the Chat Application Message Store, helping you optimize the application for different environments and use cases.
