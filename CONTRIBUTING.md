# Contributing Guide

Thank you for your interest in contributing to the Chat Application Message Store! This guide will help you understand our development process, coding standards, and how to submit contributions.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Convention](#commit-message-convention)
- [Code Review Process](#code-review-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 20.19.0 or higher
- **npm**: 10.8.2 or higher
- **Docker**: 20.10+ (for database)
- **Docker Compose**: 2.0+ (for multi-service setup)
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript Hero
  - Prisma

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/chat-application-message-store.git
   cd chat-application-message-store
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/chat-application-message-store.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration for development
nano .env
```

**Development Environment Variables**:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/chat_app_dev
API_KEY=dev-api-key-12345
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

### 3. Database Setup

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

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run dev

# Or start all services with Docker
docker compose up --build
```

### 5. Verify Setup

```bash
# Health check
curl http://localhost:4000/health

# API documentation
open http://localhost:4000/docs

# Run tests
npm test
```

## Coding Standards

### TypeScript Guidelines

#### Code Style
- Use **TypeScript strict mode**
- Prefer **explicit types** over `any`
- Use **interfaces** for object shapes
- Use **enums** for constants
- Use **type guards** for runtime type checking

#### Example:
```typescript
// ✅ Good
interface CreateSessionRequest {
  userId: string;
  title?: string;
}

const createSession = async (request: CreateSessionRequest): Promise<{ id: string }> => {
  // Implementation
};

// ❌ Bad
const createSession = async (request: any): Promise<any> => {
  // Implementation
};
```

#### Naming Conventions
- **Classes**: PascalCase (`UserService`, `CreateSessionUC`)
- **Functions/Variables**: camelCase (`createSession`, `userId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase with descriptive names (`CreateSessionRequest`)
- **Enums**: PascalCase (`UserRole`, `MessageType`)

#### File Organization
```
src/
├── sessions/
│   ├── http/
│   │   └── sessions.controller.ts
│   ├── application/
│   │   └── usecases.ts
│   ├── domain/
│   │   └── sessions.repository.ts
│   ├── dto.ts
│   └── sessions.module.ts
```

### NestJS Best Practices

#### Module Structure
```typescript
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SessionsController],
  providers: [
    CreateSessionUC,
    ListSessionsUC,
    { provide: SESSION_REPO, useClass: PrismaSessionsRepository },
  ],
  exports: [CreateSessionUC, ListSessionsUC],
})
export class SessionsModule {}
```

#### Use Case Pattern
```typescript
@Injectable()
export class CreateSessionUC {
  constructor(
    @Inject(SESSION_REPO) private readonly repo: SessionsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: CreateSessionRequest): Promise<{ id: string }> {
    this.logger.log('Creating session', { userId: input.userId });
    
    try {
      const result = await this.repo.create(input.userId, input.title);
      this.logger.log('Session created', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Failed to create session', error);
      throw error;
    }
  }
}
```

#### DTO Validation
```typescript
export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  title?: string;
}
```

### Error Handling

#### Custom Exceptions
```typescript
export class SessionNotFoundException extends NotFoundException {
  constructor(sessionId: string) {
    super(`Session with ID ${sessionId} not found`);
  }
}

export class UnauthorizedAccessException extends UnauthorizedException {
  constructor(userId: string, resourceId: string) {
    super(`User ${userId} is not authorized to access resource ${resourceId}`);
  }
}
```

#### Error Response Format
```typescript
{
  "statusCode": 404,
  "message": "Session with ID session123 not found",
  "error": "Not Found",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/sessions/session123"
}
```

### Database Guidelines

#### Repository Pattern
```typescript
export interface SessionsRepository {
  create(userId: string, title?: string): Promise<{ id: string }>;
  list(userId: string, page: number, pageSize: number): Promise<{ items: Session[]; total: number }>;
  findById(id: string, userId: string): Promise<Session | null>;
  update(id: string, userId: string, data: Partial<Session>): Promise<Session>;
  delete(id: string, userId: string): Promise<void>;
}
```

#### Prisma Best Practices
```typescript
// ✅ Good - Use transactions for related operations
async createSessionWithMessage(userId: string, title: string, message: string) {
  return this.prisma.$transaction(async (tx) => {
    const session = await tx.session.create({
      data: { userId, title },
    });

    await tx.message.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    });

    return session;
  });
}

// ✅ Good - Use select to limit returned fields
async findSessions(userId: string) {
  return this.prisma.session.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      title: true,
      favorite: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

## Testing Guidelines

### Test Structure

#### Unit Tests
- **Location**: `src/**/*.spec.ts`
- **Purpose**: Test individual components in isolation
- **Coverage**: Controllers, use cases, repositories, services

#### Integration Tests
- **Location**: `test/integration/*.spec.ts`
- **Purpose**: Test API endpoints with real database
- **Coverage**: HTTP endpoints, database operations

#### E2E Tests
- **Location**: `test/e2e/*.spec.ts`
- **Purpose**: Test complete user workflows
- **Coverage**: Full application scenarios

### Writing Tests

#### Unit Test Example
```typescript
describe('CreateSessionUC', () => {
  let useCase: CreateSessionUC;
  let repository: jest.Mocked<SessionsRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionUC,
        { provide: SESSION_REPO, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateSessionUC>(CreateSessionUC);
    repository = module.get(SESSION_REPO);
  });

  it('should create a session successfully', async () => {
    const input = { userId: 'user123', title: 'Test Session' };
    const expectedResult = { id: 'session123' };

    repository.create.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input.userId, input.title);
    expect(result).toEqual(expectedResult);
  });

  it('should handle repository errors', async () => {
    const input = { userId: 'user123', title: 'Test Session' };
    const error = new Error('Database connection failed');

    repository.create.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow(error);
  });
});
```

#### Integration Test Example
```typescript
describe('Sessions API (Integration)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database
    await prismaService.session.deleteMany();
    await prismaService.message.deleteMany();
  });

  it('should create a session', async () => {
    const createSessionDto = {
      userId: 'user123',
      title: 'Test Session',
    };

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .set('X-API-Key', 'test-api-key')
      .send(createSessionDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('string');
  });
});
```

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
npm run test:debug        # Debug mode
```

### Test Coverage Requirements

- **Minimum Coverage**: 80%
- **Unit Tests**: All business logic
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

## Pull Request Process

### 1. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/add-message-search

# Or for bug fixes
git checkout -b fix/rate-limit-memory-leak
```

### 2. Make Changes

- Write your code following the coding standards
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(sessions): add message search functionality"

# Push to your fork
git push origin feature/add-message-search
```

### 4. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Assign reviewers
5. Link related issues

### 5. Address Feedback

- Respond to code review comments
- Make requested changes
- Push updates to your branch
- Mark conversations as resolved

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Feature
feat(sessions): add session archiving functionality

# Bug fix
fix(messages): resolve pagination issue with large datasets

# Documentation
docs(api): update endpoint documentation

# Refactoring
refactor(common): extract rate limiting to separate service

# Tests
test(sessions): add integration tests for session creation

# Chore
chore(deps): update dependencies to latest versions
```

### Scope Examples
- `sessions`: Session-related changes
- `messages`: Message-related changes
- `common`: Shared/common functionality
- `config`: Configuration changes
- `docs`: Documentation changes

## Code Review Process

### Review Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

#### Code Quality
- [ ] Code follows style guidelines
- [ ] No code duplication
- [ ] Proper separation of concerns
- [ ] Clear and descriptive names

#### Testing
- [ ] Tests cover new functionality
- [ ] Tests are meaningful and not trivial
- [ ] Integration tests for API changes
- [ ] All tests pass

#### Documentation
- [ ] Code is well-documented
- [ ] API documentation is updated
- [ ] README changes if needed
- [ ] Breaking changes documented

### Review Guidelines

#### For Reviewers
- Be constructive and respectful
- Explain the reasoning behind suggestions
- Focus on the code, not the person
- Approve when ready, don't delay unnecessarily

#### For Authors
- Respond to all comments
- Ask questions if feedback is unclear
- Make changes promptly
- Test changes before marking as resolved

## Issue Reporting

### Bug Reports

Use the bug report template and include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, etc.
6. **Additional Context**: Screenshots, logs, etc.

### Example Bug Report
```markdown
## Bug Description
Sessions are not being created when the title contains special characters.

## Steps to Reproduce
1. Send POST request to `/sessions`
2. Include title with special characters: `"Test & Session"`
3. Observe error response

## Expected Behavior
Session should be created successfully with the title `"Test & Session"`

## Actual Behavior
Returns 400 Bad Request with validation error

## Environment
- OS: macOS 13.0
- Node.js: 20.19.0
- Application Version: 1.2.0

## Additional Context
Error occurs with any title containing `&`, `<`, or `>` characters.
```

## Feature Requests

### Feature Request Template

1. **Feature Description**: Clear description of the feature
2. **Problem Statement**: What problem does this solve?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Other solutions considered
5. **Additional Context**: Screenshots, mockups, etc.

### Example Feature Request
```markdown
## Feature Description
Add ability to search messages within sessions

## Problem Statement
Users need to find specific messages in long conversation histories.

## Proposed Solution
Add a search endpoint that accepts query parameters and returns matching messages:
```
GET /sessions/{id}/messages/search?q=search_term&page=1&pageSize=20
```

## Alternatives
- Full-text search using PostgreSQL
- Elasticsearch integration
- Client-side search with pagination

## Additional Context
This would be especially useful for support teams reviewing customer conversations.
```

## Documentation

### Documentation Standards

#### Code Documentation
```typescript
/**
 * Creates a new chat session for a user
 * @param userId - Unique identifier for the user
 * @param title - Optional title for the session
 * @returns Promise resolving to session creation result
 * @throws {ValidationError} When userId is invalid
 * @throws {DatabaseError} When database operation fails
 */
async createSession(userId: string, title?: string): Promise<{ id: string }> {
  // Implementation
}
```

#### API Documentation
- Use Swagger/OpenAPI decorators
- Provide examples for requests/responses
- Document error cases
- Include authentication requirements

#### README Updates
- Update setup instructions
- Add new features to feature list
- Update API examples
- Include breaking changes

### Documentation Types

1. **Code Comments**: Inline documentation for complex logic
2. **API Documentation**: Swagger/OpenAPI specs
3. **Architecture Documentation**: System design and patterns
4. **User Documentation**: Setup and usage guides
5. **Developer Documentation**: Contributing and development guides

## Development Workflow

### Daily Development

1. **Start Development**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Write code following standards
   - Add tests
   - Update documentation

3. **Test Changes**
   ```bash
   npm run lint
   npm run test:all
   npm run build
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

5. **Create PR and Review**

### Release Process

1. **Prepare Release Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b release/v1.2.0
   ```

2. **Update Version**
   ```bash
   npm version minor  # or patch/major
   git push origin release/v1.2.0
   ```

3. **Create Release PR**
4. **Merge and Tag**
5. **Deploy to Production**

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the golden rule

### Getting Help

- Check existing documentation first
- Search closed issues for solutions
- Ask questions in discussions
- Provide context when asking for help

### Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- GitHub contributors page

---

Thank you for contributing to the Chat Application Message Store! Your contributions help make this project better for everyone.
