# Architecture Documentation

## Overview

The Chat Application Message Store follows **Hexagonal Architecture** (also known as Clean Architecture or Ports and Adapters pattern). This architectural approach ensures loose coupling, high testability, and maintainability by separating business logic from external concerns.

## Architecture Principles

### 1. Dependency Inversion
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Abstractions don't depend on details; details depend on abstractions

### 2. Separation of Concerns
- Each layer has a single responsibility
- Clear boundaries between layers
- Minimal coupling between modules

### 3. Testability
- Business logic is isolated and easily testable
- Dependencies can be mocked or stubbed
- Integration points are clearly defined

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Controllers │  │    Guards   │  │       Filters           │ │
│  │    DTOs     │  │  Rate Limit │  │   Exception Handling    │ │
│  │ Validation  │  │   API Key   │  │       Logging           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Application Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Use Cases   │  │   Services  │  │      Configuration      │ │
│  │ Business    │  │   Cross-    │  │     Environment         │ │
│  │ Logic       │  │   cutting   │  │      Validation         │ │
│  │             │  │  Concerns   │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Domain Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Repository  │  │  Entities   │  │      Value Objects      │ │
│  │ Interfaces  │  │    Models   │  │       Business          │ │
│  │ Contracts   │  │             │  │       Rules             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                 Infrastructure Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Database  │  │  External   │  │        Logging          │ │
│  │   Prisma    │  │   APIs      │  │       Monitoring        │ │
│  │  PostgreSQL │  │   Services  │  │       Security          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Details

### HTTP Layer (Presentation)
**Purpose**: Handles HTTP requests, validation, and responses

**Components**:
- **Controllers**: Route HTTP requests to use cases
- **DTOs**: Data validation and transformation
- **Guards**: Authentication and authorization
- **Filters**: Exception handling and logging
- **Pipes**: Input validation and transformation

**Responsibilities**:
- Request/response handling
- Input validation
- Authentication/authorization
- Error formatting
- API documentation (Swagger)

### Application Layer (Business Logic)
**Purpose**: Contains business logic and orchestrates domain operations

**Components**:
- **Use Cases**: Business operation implementations
- **Services**: Cross-cutting concerns
- **Configuration**: Environment and application settings

**Responsibilities**:
- Business logic implementation
- Use case orchestration
- Transaction management
- Cross-cutting concerns (logging, caching)

### Domain Layer (Core Business)
**Purpose**: Contains core business entities and rules

**Components**:
- **Repository Interfaces**: Data access contracts
- **Entities**: Core business objects
- **Value Objects**: Immutable business concepts

**Responsibilities**:
- Business rules and constraints
- Domain entity definitions
- Repository contracts
- Business invariants

### Infrastructure Layer (External Concerns)
**Purpose**: Implements external dependencies and technical concerns

**Components**:
- **Database Implementations**: Prisma repositories
- **External Services**: Third-party integrations
- **Logging**: Application monitoring
- **Security**: Authentication mechanisms

**Responsibilities**:
- Database operations
- External service integration
- Logging and monitoring
- Security implementations

## Module Architecture

### Sessions Module
```
sessions/
├── http/
│   └── sessions.controller.ts    # HTTP endpoints
├── application/
│   └── usecases.ts              # Business logic
├── domain/
│   └── sessions.repository.ts   # Repository interface
├── dto.ts                       # Data transfer objects
└── sessions.module.ts           # Module configuration
```

**Responsibilities**:
- Chat session management
- Session CRUD operations
- User session isolation
- Session metadata handling

### Messages Module
```
messages/
├── http/
│   └── messages.controller.ts   # HTTP endpoints
├── application/
│   └── usecases.ts              # Business logic
├── domain/
│   └── messages.repository.ts   # Repository interface
├── dto.ts                       # Data transfer objects
└── messages.module.ts           # Module configuration
```

**Responsibilities**:
- Message storage and retrieval
- Message role validation
- Message pagination
- Session-message relationships

### Common Module
```
common/
├── guard/
│   ├── api-key.guard.ts         # API authentication
│   └── rate-limit.guard.ts      # Rate limiting
└── filters/
    └── all-exceptions.filter.ts # Global exception handling
```

**Responsibilities**:
- Cross-cutting concerns
- Shared utilities
- Global guards and filters
- Common types and interfaces

## Data Flow

### Request Processing Flow
```
1. HTTP Request
   ↓
2. Guards (Authentication, Rate Limiting)
   ↓
3. Controller (Route Handling)
   ↓
4. DTO Validation (Input Validation)
   ↓
5. Use Case (Business Logic)
   ↓
6. Repository Interface (Domain Contract)
   ↓
7. Repository Implementation (Infrastructure)
   ↓
8. Database (PostgreSQL)
   ↓
9. Response (Data Transformation)
   ↓
10. HTTP Response
```

### Session Creation Example
```
POST /sessions
├── RateLimitGuard (check rate limits)
├── ApiKeyGuard (validate API key)
├── SessionsController.create()
├── StartSessionDto validation
├── CreateSessionUC.execute()
├── SessionsRepository.create()
├── PrismaSessionsRepository.create()
├── PostgreSQL INSERT
└── Response: { id: "session-id" }
```

## Design Patterns

### 1. Repository Pattern
**Purpose**: Abstract data access logic

**Implementation**:
```typescript
// Domain interface
interface SessionsRepository {
  create(userId: string, title?: string): Promise<{ id: string }>;
  list(userId: string, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
}

// Infrastructure implementation
class PrismaSessionsRepository implements SessionsRepository {
  // Implementation details
}
```

### 2. Use Case Pattern
**Purpose**: Encapsulate business operations

**Implementation**:
```typescript
@Injectable()
export class CreateSessionUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  
  execute(input: { userId: string; title?: string }) {
    return this.repo.create(input.userId, input.title);
  }
}
```

### 3. Dependency Injection
**Purpose**: Manage object dependencies

**Implementation**:
```typescript
// Module configuration
providers: [
  { provide: SESSION_REPO, useClass: PrismaSessionsRepository },
  CreateSessionUC,
]
```

### 4. Guard Pattern
**Purpose**: Cross-cutting concerns

**Implementation**:
```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Authentication logic
  }
}
```

## Database Design

### Entity Relationship Diagram
```
┌─────────────────┐    ┌─────────────────┐
│     Session     │    │     Message     │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ userId          │◄───┤ sessionId (FK)  │
│ title           │    │ role            │
│ favorite        │    │ content         │
│ createdAt       │    │ createdAt       │
│ deletedAt       │    │ deletedAt       │
└─────────────────┘    └─────────────────┘
```

### Key Design Decisions

1. **Soft Deletion**: Records are marked as deleted rather than physically removed
2. **User Isolation**: All queries include userId for data separation
3. **Indexing**: Optimized indexes on frequently queried fields
4. **Cascading**: Message deletion cascades from session deletion

## Security Architecture

### Authentication Flow
```
1. Client Request with API Key
   ↓
2. ApiKeyGuard validates key
   ↓
3. Request proceeds if valid
   ↓
4. User context extracted from request
   ↓
5. Data access filtered by user context
```

### Rate Limiting Strategy
```
1. Extract client identifier (IP + API Key)
   ↓
2. Check current request count
   ↓
3. Allow if under limit (60/minute)
   ↓
4. Reject with 429 if over limit
   ↓
5. Reset counter after time window
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side session storage
- **Database Scaling**: Read replicas for query distribution
- **Load Balancing**: Multiple application instances
- **Rate Limiting**: Distributed rate limiting (Redis-based)

### Performance Optimization
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Indexed database queries
- **Pagination**: Efficient large dataset handling
- **Caching**: Strategic caching for frequently accessed data

## Monitoring and Observability

### Logging Strategy
- **Structured Logging**: JSON-formatted logs with Pino
- **Request Tracking**: Unique request IDs for tracing
- **Error Logging**: Detailed error context and stack traces
- **Performance Metrics**: Request duration and database query times

### Health Monitoring
- **Health Endpoints**: Application and dependency health checks
- **Metrics Collection**: Request counts, error rates, response times
- **Alerting**: Proactive monitoring and alerting systems

## Testing Strategy

### Test Pyramid
```
        ┌─────────────┐
        │   E2E Tests │  ← Few, high-level scenarios
        └─────────────┘
       ┌─────────────────┐
       │ Integration     │  ← API and database tests
       │ Tests           │
       └─────────────────┘
     ┌─────────────────────┐
     │    Unit Tests       │  ← Many, isolated components
     └─────────────────────┘
```

### Test Isolation
- **Unit Tests**: Mock all dependencies
- **Integration Tests**: Real database, mocked external services
- **E2E Tests**: Full application stack

## Deployment Architecture

### Container Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │    Database     │    │    Monitoring   │
│   Container     │    │   Container     │    │    Container    │
│                 │    │                 │    │                 │
│  - NestJS App   │    │  - PostgreSQL   │    │  - pgAdmin      │
│  - Prisma       │    │  - Persistence  │    │  - Logs         │
│  - Health       │    │  - Backups      │    │  - Metrics      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Configuration
- **Development**: Local Docker Compose setup
- **Staging**: Container orchestration with environment variables
- **Production**: Scalable deployment with load balancing

## Future Architecture Considerations

### Microservices Migration
- **Session Service**: Dedicated session management
- **Message Service**: Dedicated message handling
- **User Service**: User management and authentication
- **Notification Service**: Real-time notifications

### Event-Driven Architecture
- **Event Sourcing**: Message history as events
- **CQRS**: Separate read/write models
- **Message Queues**: Asynchronous processing
- **Event Streaming**: Real-time data synchronization

---

This architecture provides a solid foundation for a scalable, maintainable chat application while following industry best practices and design patterns.
