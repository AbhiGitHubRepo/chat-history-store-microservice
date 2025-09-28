import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

describe('Chat Application E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let apiKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Set up the app similar to main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    await app.init();

    // Get API key from config
    apiKey = configService.get<string>('API_KEY') || 'test-api-key';
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.message.deleteMany();
    await prismaService.session.deleteMany();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Complete Chat Workflow', () => {
    it('should handle a complete chat conversation workflow', async () => {
      const userId = 'user123';
      let sessionId: string;
      let messageIds: string[] = [];

      // Step 1: Create a new session
      const createSessionResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send({
          userId,
          title: 'My Chat Session',
        })
        .expect(201);

      sessionId = createSessionResponse.body.id;
      expect(sessionId).toBeTruthy();

      // Step 2: Add user message
      const userMessageResponse = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send({
          sessionId,
          role: 'user',
          content: 'Hello, can you help me with TypeScript?',
        })
        .expect(201);

      messageIds.push(userMessageResponse.body.id);

      // Step 3: Add assistant response
      const assistantMessageResponse = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send({
          sessionId,
          role: 'assistant',
          content: 'Of course! I\'d be happy to help you with TypeScript. What specific aspect would you like to learn about?',
        })
        .expect(201);

      messageIds.push(assistantMessageResponse.body.id);

      // Step 4: Add system message
      const systemMessageResponse = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send({
          sessionId,
          role: 'system',
          content: 'Context: User is learning TypeScript basics.',
        })
        .expect(201);

      messageIds.push(systemMessageResponse.body.id);

      // Step 5: List all messages in the session
      const listMessagesResponse = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(listMessagesResponse.body.items).toHaveLength(3);
      expect(listMessagesResponse.body.total).toBe(3);
      expect(listMessagesResponse.body.items[0].content).toBe('Hello, can you help me with TypeScript?');
      expect(listMessagesResponse.body.items[1].content).toBe('Of course! I\'d be happy to help you with TypeScript. What specific aspect would you like to learn about?');
      expect(listMessagesResponse.body.items[2].content).toBe('Context: User is learning TypeScript basics.');

      // Step 6: Mark session as favorite
      await request(app.getHttpServer())
        .patch(`/sessions/${sessionId}/favorite`)
        .query({ userId })
        .set('X-API-Key', apiKey)
        .send({ favorite: true })
        .expect(200);

      // Step 7: Rename the session
      await request(app.getHttpServer())
        .patch(`/sessions/${sessionId}/rename`)
        .query({ userId })
        .set('X-API-Key', apiKey)
        .send({ title: 'TypeScript Learning Session' })
        .expect(200);

      // Step 8: List sessions to verify changes
      const listSessionsResponse = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(listSessionsResponse.body.items).toHaveLength(1);
      expect(listSessionsResponse.body.total).toBe(1);
      expect(listSessionsResponse.body.items[0].id).toBe(sessionId);
      expect(listSessionsResponse.body.items[0].title).toBe('TypeScript Learning Session');
      expect(listSessionsResponse.body.items[0].favorite).toBe(true);

      // Step 9: Delete a message
      await request(app.getHttpServer())
        .delete(`/messages/${messageIds[2]}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      // Step 10: Verify message was deleted (should not appear in list)
      const listMessagesAfterDeleteResponse = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(listMessagesAfterDeleteResponse.body.items).toHaveLength(2);
      expect(listMessagesAfterDeleteResponse.body.total).toBe(2);

      // Step 11: Delete the session
      await request(app.getHttpServer())
        .delete(`/sessions/${sessionId}`)
        .query({ userId })
        .set('X-API-Key', apiKey)
        .expect(200);

      // Step 12: Verify session was deleted (should not appear in list)
      const listSessionsAfterDeleteResponse = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(listSessionsAfterDeleteResponse.body.items).toHaveLength(0);
      expect(listSessionsAfterDeleteResponse.body.total).toBe(0);
    });

    it('should handle multiple users with separate sessions', async () => {
      const user1Id = 'user1';
      const user2Id = 'user2';

      // Create sessions for both users
      const user1SessionResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send({
          userId: user1Id,
          title: 'User 1 Session',
        })
        .expect(201);

      const user2SessionResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send({
          userId: user2Id,
          title: 'User 2 Session',
        })
        .expect(201);

      const user1SessionId = user1SessionResponse.body.id;
      const user2SessionId = user2SessionResponse.body.id;

      // Add messages to both sessions
      await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send({
          sessionId: user1SessionId,
          role: 'user',
          content: 'User 1 message',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send({
          sessionId: user2SessionId,
          role: 'user',
          content: 'User 2 message',
        })
        .expect(201);

      // Verify users can only see their own sessions
      const user1SessionsResponse = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId: user1Id })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(user1SessionsResponse.body.items).toHaveLength(1);
      expect(user1SessionsResponse.body.items[0].id).toBe(user1SessionId);

      const user2SessionsResponse = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId: user2Id })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(user2SessionsResponse.body.items).toHaveLength(1);
      expect(user2SessionsResponse.body.items[0].id).toBe(user2SessionId);

      // Verify users cannot access each other's sessions
      await request(app.getHttpServer())
        .patch(`/sessions/${user2SessionId}/rename`)
        .query({ userId: user1Id })
        .set('X-API-Key', apiKey)
        .send({ title: 'Hacked Title' })
        .expect(404);
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user123';

      // Create multiple sessions
      const sessionPromises = Array.from({ length: 25 }, (_, i) =>
        request(app.getHttpServer())
          .post('/sessions')
          .set('X-API-Key', apiKey)
          .send({
            userId,
            title: `Session ${i + 1}`,
          })
          .expect(201)
      );

      const sessions = await Promise.all(sessionPromises);
      const sessionIds = sessions.map(response => response.body.id);

      // Test pagination
      const page1Response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId, page: 1, pageSize: 10 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(page1Response.body.items).toHaveLength(10);
      expect(page1Response.body.total).toBe(25);

      const page2Response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId, page: 2, pageSize: 10 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(page2Response.body.items).toHaveLength(10);
      expect(page2Response.body.total).toBe(25);

      const page3Response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId, page: 3, pageSize: 10 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(page3Response.body.items).toHaveLength(5);
      expect(page3Response.body.total).toBe(25);

      // Verify no overlap between pages
      const page1Ids = page1Response.body.items.map(item => item.id);
      const page2Ids = page2Response.body.items.map(item => item.id);
      const page3Ids = page3Response.body.items.map(item => item.id);

      expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);
      expect(page2Ids.some(id => page3Ids.includes(id))).toBe(false);
      expect(page1Ids.some(id => page3Ids.includes(id))).toBe(false);
    });

    it('should handle rate limiting', async () => {
      const requests = Array.from({ length: 65 }, () =>
        request(app.getHttpServer())
          .get('/sessions')
          .query({ userId: 'user123' })
          .set('X-API-Key', apiKey)
      );

      const responses = await Promise.allSettled(requests);
      
      // First 60 requests should succeed
      const successfulResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );
      
      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(successfulResponses.length).toBeGreaterThanOrEqual(60);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
