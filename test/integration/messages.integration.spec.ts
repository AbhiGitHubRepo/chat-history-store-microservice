import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

describe('Messages Integration Tests', () => {
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

  describe('POST /messages', () => {
    beforeEach(async () => {
      // Create a test session
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Test Session',
        },
      });
    });

    it('should add a user message', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'user',
        content: 'Hello, how are you?',
      };

      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      // Verify message was created in database
      const message = await prismaService.message.findFirst({
        where: { sessionId: 'session1', role: 'user' },
      });
      expect(message).toBeTruthy();
      expect(message?.content).toBe('Hello, how are you?');
    });

    it('should add an assistant message', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'assistant',
        content: 'I am doing well, thank you!',
      };

      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify message was created in database
      const message = await prismaService.message.findFirst({
        where: { sessionId: 'session1', role: 'assistant' },
      });
      expect(message).toBeTruthy();
      expect(message?.content).toBe('I am doing well, thank you!');
    });

    it('should add a system message', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'system',
        content: 'System initialization complete.',
      };

      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify message was created in database
      const message = await prismaService.message.findFirst({
        where: { sessionId: 'session1', role: 'system' },
      });
      expect(message).toBeTruthy();
      expect(message?.content).toBe('System initialization complete.');
    });

    it('should fail without API key', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'user',
        content: 'Hello',
      };

      await request(app.getHttpServer())
        .post('/messages')
        .send(messageData)
        .expect(401);
    });

    it('should fail with invalid API key', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'user',
        content: 'Hello',
      };

      await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', 'invalid-key')
        .send(messageData)
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      const messageData = {
        // Missing sessionId
        role: 'user',
        content: 'Hello',
      };

      await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send(messageData)
        .expect(400);
    });

    it('should fail with invalid role', async () => {
      const messageData = {
        sessionId: 'session1',
        role: 'invalid',
        content: 'Hello',
      };

      await request(app.getHttpServer())
        .post('/messages')
        .set('X-API-Key', apiKey)
        .send(messageData)
        .expect(400);
    });
  });

  describe('GET /messages', () => {
    beforeEach(async () => {
      // Create test session and messages
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Test Session',
        },
      });

      await prismaService.message.createMany({
        data: [
          {
            id: 'message1',
            sessionId: 'session1',
            role: 'user',
            content: 'Hello',
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'message2',
            sessionId: 'session1',
            role: 'assistant',
            content: 'Hi there!',
            createdAt: new Date('2024-01-02'),
          },
          {
            id: 'message3',
            sessionId: 'session1',
            role: 'user',
            content: 'How are you?',
            createdAt: new Date('2024-01-03'),
          },
        ],
      });
    });

    it('should list messages for a session', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId: 'session1' })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body.items).toHaveLength(3);
      expect(response.body.total).toBe(3);
      
      // Should be ordered by createdAt asc
      expect(response.body.items[0].id).toBe('message1');
      expect(response.body.items[1].id).toBe('message2');
      expect(response.body.items[2].id).toBe('message3');
    });

    it('should handle pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId: 'session1', page: 1, pageSize: 2 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.items[0].id).toBe('message1');
      expect(response.body.items[1].id).toBe('message2');
    });

    it('should handle second page pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId: 'session1', page: 2, pageSize: 2 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(3);
      expect(response.body.items[0].id).toBe('message3');
    });

    it('should return empty list for session with no messages', async () => {
      // Create another session without messages
      await prismaService.session.create({
        data: {
          id: 'session2',
          userId: 'user123',
          title: 'Empty Session',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/messages')
        .query({ sessionId: 'session2' })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should fail without sessionId parameter', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  describe('DELETE /messages/:id', () => {
    beforeEach(async () => {
      // Create test session and message
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Test Session',
        },
      });

      await prismaService.message.create({
        data: {
          id: 'message1',
          sessionId: 'session1',
          role: 'user',
          content: 'Hello',
        },
      });
    });

    it('should soft delete a message', async () => {
      await request(app.getHttpServer())
        .delete('/messages/message1')
        .set('X-API-Key', apiKey)
        .expect(200);

      // Verify message was soft deleted
      const message = await prismaService.message.findUnique({
        where: { id: 'message1' },
      });
      expect(message?.deletedAt).toBeTruthy();
    });

    it('should fail to delete non-existent message', async () => {
      await request(app.getHttpServer())
        .delete('/messages/nonexistent')
        .set('X-API-Key', apiKey)
        .expect(404);
    });

    it('should fail without API key', async () => {
      await request(app.getHttpServer())
        .delete('/messages/message1')
        .expect(401);
    });
  });
});
