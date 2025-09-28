# Chat Application Message Store

A robust, scalable chat application backend built with **NestJS**, **Prisma**, and **PostgreSQL**. This application provides a complete message storage and session management system with enterprise-grade features including authentication, rate limiting, and comprehensive testing.

## 🚀 Features

### Core Functionality
- **Session Management** - Create, update, delete, and favorite chat sessions
- **Message Handling** - Store and retrieve messages with role-based content (user, assistant, system)
- **User Isolation** - Secure multi-user support with data separation
- **Pagination** - Efficient data retrieval with configurable page sizes

### Enterprise Features
- **API Authentication** - API key-based authentication with configurable keys
- **Rate Limiting** - Built-in rate limiting (60 requests/minute per IP/API key)
- **Input Validation** - Comprehensive DTO validation with class-validator
- **Soft Deletion** - Data preservation with soft delete functionality
- **Health Monitoring** - Built-in health check endpoints
- **Structured Logging** - Pino-based logging with request/response tracking

### Development & Quality
- **Comprehensive Testing** - 108+ unit, integration, and E2E tests
- **Type Safety** - Full TypeScript implementation with strict typing
- **Clean Architecture** - Hexagonal architecture with clear separation of concerns
- **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- **Docker Support** - Complete containerization with docker-compose

## 🏗️ Architecture

This application follows **Hexagonal Architecture** (Clean Architecture) principles:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Layer    │    │ Application     │    │   Domain        │
│                 │    │   Layer         │    │   Layer         │
│ Controllers     │───▶│ Use Cases       │───▶│ Repositories    │
│ DTOs            │    │ Services        │    │ Entities        │
│ Guards          │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Infrastructure  │    │ Configuration   │    │   Database      │
│   Layer         │    │   Layer         │    │   Layer         │
│ Prisma Client   │    │ Environment     │    │ PostgreSQL      │
│ External APIs   │    │ Validation      │    │ Migrations      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Modules
- **Sessions Module** - Chat session management
- **Messages Module** - Message storage and retrieval
- **Common Module** - Shared guards, filters, and utilities
- **Configuration Module** - Environment configuration and validation

## 🛠️ Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript with strict configuration
- **Testing**: Jest with comprehensive test coverage
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino with structured logging
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint, Prettier

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.0+
- npm 10.8.2+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd chat-application-message-store
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - API_KEY
# - PORT
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
docker compose up -d postgres

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### 4. Start Development Server
```bash
# Development mode with hot reload
npm run dev

# Or start with Docker
docker compose up --build app
```

### 5. Verify Installation
```bash
# Health check
curl http://localhost:4000/health

# API documentation
open http://localhost:4000/docs
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000
```

### Authentication
All endpoints (except `/health`) require an API key:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:4000/sessions
```

### Key Endpoints

#### Sessions
- `POST /sessions` - Create a new chat session
- `GET /sessions` - List user sessions with pagination
- `PATCH /sessions/:id/rename` - Rename a session
- `PATCH /sessions/:id/favorite` - Toggle session favorite status
- `DELETE /sessions/:id` - Soft delete a session

#### Messages
- `POST /messages` - Add a new message to a session
- `GET /messages` - List session messages with pagination
- `DELETE /messages/:id` - Soft delete a message

#### Health
- `GET /health` - Application health status

> 📖 **Full API Documentation**: Visit `/docs` when the server is running for interactive Swagger documentation.

## 🧪 Testing

### Test Commands
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only
npm run test:all          # All test types sequentially

# Development
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
```

### Test Coverage
- **108+ tests** across 14 test suites
- **Unit Tests** - Controllers, use cases, repositories, DTOs
- **Integration Tests** - API endpoints with database
- **E2E Tests** - Complete user workflows

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Production
```bash
# Build production image
docker build -t chat-app .

# Run with environment
docker run -d \
  --name chat-app \
  -p 4000:4000 \
  -e DATABASE_URL="your-db-url" \
  -e API_KEY="your-api-key" \
  chat-app
```

## 📁 Project Structure

```
src/
├── sessions/              # Session management module
│   ├── http/             # HTTP controllers
│   ├── application/      # Use cases
│   ├── domain/           # Repository interfaces
│   └── dto.ts            # Data transfer objects
├── messages/             # Message management module
│   ├── http/             # HTTP controllers
│   ├── application/      # Use cases
│   ├── domain/           # Repository interfaces
│   └── dto.ts            # Data transfer objects
├── common/               # Shared functionality
│   ├── guard/            # Authentication guards
│   └── filters/          # Exception filters
├── config/               # Configuration management
├── adapters/             # Infrastructure adapters
│   └── persistence/      # Database implementations
└── shared/               # Shared services
    └── prisma/           # Prisma service
```

## ⚙️ Configuration

### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Application port | Yes | 4000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `API_KEY` | API authentication key | No | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | * |
| `POSTGRES_HOST` | Database host | Yes | localhost |
| `POSTGRES_PORT` | Database port | Yes | 5432 |
| `POSTGRES_USER` | Database username | Yes | - |
| `POSTGRES_PASSWORD` | Database password | Yes | - |
| `POSTGRES_DB` | Database name | Yes | - |

## 🔧 Development

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npx tsc --noEmit
```

### Database Management
```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 📈 Performance

### Rate Limiting
- **60 requests/minute** per IP address
- **60 requests/minute** per API key
- **1-minute sliding window**

### Database Optimization
- **Indexed queries** on frequently accessed fields
- **Soft deletion** for data recovery
- **Pagination** for large datasets
- **Connection pooling** with Prisma

## 🛡️ Security

- **API Key Authentication** - Configurable API keys
- **Input Validation** - Comprehensive DTO validation
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Configurable origin restrictions
- **Helmet Integration** - Security headers
- **Structured Logging** - Audit trail capabilities

## 📋 Roadmap

- [ ] **Real-time Features** - WebSocket support for live chat
- [ ] **Message Search** - Full-text search capabilities
- [ ] **File Attachments** - Support for file uploads
- [ ] **Message Reactions** - Like/dislike functionality
- [ ] **Message Threading** - Reply-to-message features
- [ ] **Advanced Analytics** - Usage metrics and reporting
- [ ] **Multi-tenancy** - Organization-level data isolation
- [ ] **Message Encryption** - End-to-end encryption support

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) framework
- Database powered by [Prisma](https://prisma.io/)
- Testing with [Jest](https://jestjs.io/)
- Containerized with [Docker](https://docker.com/)

---

**Made with ❤️ for modern chat applications**