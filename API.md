# API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication

All API endpoints (except `/health`) require authentication via API key in the request header.

### API Key Header
```
X-API-Key: your-api-key-here
```

### Example Request
```bash
curl -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:4000/sessions
```

## Rate Limiting

- **Limit**: 60 requests per minute
- **Scope**: Per IP address + API key combination
- **Window**: Sliding 1-minute window
- **Headers**: Rate limit information is returned in response headers
- **Status**: `429 Too Many Requests` when limit exceeded

### Rate Limit Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/sessions"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Sessions API

### Create Session
Creates a new chat session for a user.

**Endpoint**: `POST /sessions`

**Request Body**:
```json
{
  "userId": "user123",
  "title": "My Chat Session"
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique identifier for the user |
| `title` | string | No | Optional title for the session |

**Response**: `201 Created`
```json
{
  "id": "session_cuid123"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:4000/sessions \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "My Chat Session"
  }'
```

### List Sessions
Retrieves paginated list of sessions for a user.

**Endpoint**: `GET /sessions`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userId` | string | Yes | - | User identifier |
| `page` | number | No | 1 | Page number (1-based) |
| `pageSize` | number | No | 20 | Items per page |

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "session_cuid123",
      "title": "My Chat Session",
      "favorite": true,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Example Request**:
```bash
curl "http://localhost:4000/sessions?userId=user123&page=1&pageSize=10" \
  -H "X-API-Key: your-api-key"
```

### Rename Session
Updates the title of an existing session.

**Endpoint**: `PATCH /sessions/{id}/rename`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Session identifier |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier (for authorization) |

**Request Body**:
```json
{
  "title": "New Session Title"
}
```

**Response**: `200 OK` (empty body)

**Example Request**:
```bash
curl -X PATCH "http://localhost:4000/sessions/session_cuid123/rename?userId=user123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Session Title"}'
```

### Toggle Session Favorite
Adds or removes a session from favorites.

**Endpoint**: `PATCH /sessions/{id}/favorite`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Session identifier |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier (for authorization) |

**Request Body**:
```json
{
  "favorite": true
}
```

**Response**: `200 OK` (empty body)

**Example Request**:
```bash
curl -X PATCH "http://localhost:4000/sessions/session_cuid123/favorite?userId=user123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"favorite": true}'
```

### Delete Session
Soft deletes a session (marks as deleted but preserves data).

**Endpoint**: `DELETE /sessions/{id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Session identifier |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier (for authorization) |

**Response**: `200 OK` (empty body)

**Example Request**:
```bash
curl -X DELETE "http://localhost:4000/sessions/session_cuid123?userId=user123" \
  -H "X-API-Key: your-api-key"
```

## Messages API

### Add Message
Adds a new message to a session.

**Endpoint**: `POST /messages`

**Request Body**:
```json
{
  "sessionId": "session_cuid123",
  "role": "user",
  "content": "Hello, how can I help you?"
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | Session identifier |
| `role` | string | Yes | Message role (`user`, `assistant`, or `system`) |
| `content` | string | Yes | Message content |

**Response**: `201 Created`
```json
{
  "id": "message_cuid456"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:4000/messages \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_cuid123",
    "role": "user",
    "content": "Hello, how can I help you?"
  }'
```

### List Messages
Retrieves paginated list of messages for a session.

**Endpoint**: `GET /messages`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sessionId` | string | Yes | - | Session identifier |
| `page` | number | No | 1 | Page number (1-based) |
| `pageSize` | number | No | 50 | Items per page |

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "message_cuid456",
      "role": "user",
      "content": "Hello, how can I help you?",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": "message_cuid789",
      "role": "assistant",
      "content": "I can help you with various tasks!",
      "createdAt": "2024-01-01T12:01:00.000Z"
    }
  ],
  "total": 2
}
```

**Example Request**:
```bash
curl "http://localhost:4000/messages?sessionId=session_cuid123&page=1&pageSize=20" \
  -H "X-API-Key: your-api-key"
```

### Delete Message
Soft deletes a message (marks as deleted but preserves data).

**Endpoint**: `DELETE /messages/{id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Message identifier |

**Response**: `200 OK` (empty body)

**Example Request**:
```bash
curl -X DELETE "http://localhost:4000/messages/message_cuid456" \
  -H "X-API-Key: your-api-key"
```

## Health API

### Health Check
Returns the health status of the application.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Response**: `200 OK`
```json
{
  "status": "ok"
}
```

**Example Request**:
```bash
curl http://localhost:4000/health
```

## Data Models

### Session
```typescript
interface Session {
  id: string;           // Unique identifier (CUID)
  userId: string;       // User identifier
  title: string | null; // Session title (optional)
  favorite: boolean;    // Favorite status
  createdAt: Date;      // Creation timestamp
  deletedAt: Date | null; // Deletion timestamp (soft delete)
}
```

### Message
```typescript
interface Message {
  id: string;           // Unique identifier (CUID)
  sessionId: string;    // Parent session identifier
  role: 'user' | 'assistant' | 'system'; // Message role
  content: string;      // Message content
  createdAt: Date;      // Creation timestamp
  deletedAt: Date | null; // Deletion timestamp (soft delete)
}
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  items: T[];           // Array of items
  total: number;        // Total number of items
}
```

## Validation Rules

### Session Validation
- `userId`: Required, non-empty string
- `title`: Optional, non-empty string when provided

### Message Validation
- `sessionId`: Required, non-empty string
- `role`: Required, must be one of: `user`, `assistant`, `system`
- `content`: Required, non-empty string

### Query Parameter Validation
- `page`: Must be a positive integer (minimum 1)
- `pageSize`: Must be a positive integer (minimum 1)
- `userId`: Required for session operations, non-empty string
- `sessionId`: Required for message operations, non-empty string

## Common Use Cases

### 1. Starting a New Chat
```bash
# 1. Create a session
SESSION_ID=$(curl -s -X POST http://localhost:4000/sessions \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "title": "New Chat"}' \
  | jq -r '.id')

# 2. Add first message
curl -X POST http://localhost:4000/messages \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"role\": \"user\",
    \"content\": \"Hello!\"
  }"
```

### 2. Retrieving Chat History
```bash
# Get all sessions for a user
curl "http://localhost:4000/sessions?userId=user123" \
  -H "X-API-Key: your-api-key"

# Get messages for a specific session
curl "http://localhost:4000/messages?sessionId=session_cuid123" \
  -H "X-API-Key: your-api-key"
```

### 3. Managing Favorites
```bash
# Mark session as favorite
curl -X PATCH "http://localhost:4000/sessions/session_cuid123/favorite?userId=user123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"favorite": true}'

# Remove from favorites
curl -X PATCH "http://localhost:4000/sessions/session_cuid123/favorite?userId=user123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"favorite": false}'
```

## Error Handling

### Validation Errors
When request validation fails:

```json
{
  "statusCode": 400,
  "message": [
    "userId should not be empty",
    "role must be one of the following values: user, assistant, system"
  ],
  "error": "Bad Request"
}
```

### Authorization Errors
When API key is invalid or missing:

```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

### Not Found Errors
When resource doesn't exist or user doesn't have access:

```json
{
  "statusCode": 404,
  "message": "Session not found",
  "error": "Not Found"
}
```

### Rate Limit Errors
When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "error": "Too Many Requests"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
class ChatAPI {
  constructor(private apiKey: string, private baseUrl: string = 'http://localhost:4000') {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async createSession(userId: string, title?: string) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, title }),
    });
  }

  async getSessions(userId: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams({ userId, page: page.toString(), pageSize: pageSize.toString() });
    return this.request(`/sessions?${params}`);
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, role, content }),
    });
  }

  async getMessages(sessionId: string, page = 1, pageSize = 50) {
    const params = new URLSearchParams({ sessionId, page: page.toString(), pageSize: pageSize.toString() });
    return this.request(`/messages?${params}`);
  }
}

// Usage
const api = new ChatAPI('your-api-key');
const session = await api.createSession('user123', 'My Chat');
const message = await api.addMessage(session.id, 'user', 'Hello!');
```

### Python
```python
import requests
from typing import Optional, Dict, Any

class ChatAPI:
    def __init__(self, api_key: str, base_url: str = "http://localhost:4000"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[Any, Any]:
        response = requests.request(
            method, 
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            **kwargs
        )
        response.raise_for_status()
        return response.json()

    def create_session(self, user_id: str, title: Optional[str] = None) -> Dict[Any, Any]:
        return self._request("POST", "/sessions", json={"userId": user_id, "title": title})

    def get_sessions(self, user_id: str, page: int = 1, page_size: int = 20) -> Dict[Any, Any]:
        params = {"userId": user_id, "page": page, "pageSize": page_size}
        return self._request("GET", "/sessions", params=params)

    def add_message(self, session_id: str, role: str, content: str) -> Dict[Any, Any]:
        return self._request("POST", "/messages", json={
            "sessionId": session_id,
            "role": role,
            "content": content
        })

    def get_messages(self, session_id: str, page: int = 1, page_size: int = 50) -> Dict[Any, Any]:
        params = {"sessionId": session_id, "page": page, "pageSize": page_size}
        return self._request("GET", "/messages", params=params)

# Usage
api = ChatAPI("your-api-key")
session = api.create_session("user123", "My Chat")
message = api.add_message(session["id"], "user", "Hello!")
```

## Interactive Documentation

For interactive API documentation with the ability to test endpoints directly in your browser, visit:

```
http://localhost:4000/docs
```

This provides a Swagger UI interface where you can:
- Explore all available endpoints
- View request/response schemas
- Test API calls directly
- Download OpenAPI specification

---

This API documentation covers all endpoints, data models, and common usage patterns for the Chat Application Message Store.
