import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

describe('Sessions Integration Tests', () => {
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

  describe('POST /sessions', () => {
    it('should create a new session', async () => {
      const sessionData = {
        userId: 'user123',
        title: 'Test Session',
      };

      const response = await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      // Verify session was created in database
      const session = await prismaService.session.findFirst({
        where: { userId: 'user123', title: 'Test Session' },
      });
      expect(session).toBeTruthy();
      expect(session?.favorite).toBe(false);
    });

    it('should create a session without title', async () => {
      const sessionData = {
        userId: 'user123',
      };

      const response = await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify session was created in database
      const session = await prismaService.session.findFirst({
        where: { userId: 'user123' },
      });
      expect(session).toBeTruthy();
      expect(session?.title).toBeNull();
    });

    it('should fail without API key', async () => {
      const sessionData = {
        userId: 'user123',
        title: 'Test Session',
      };

      await request(app.getHttpServer())
        .post('/sessions')
        .send(sessionData)
        .expect(401);
    });

    it('should fail with invalid API key', async () => {
      const sessionData = {
        userId: 'user123',
        title: 'Test Session',
      };

      await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', 'invalid-key')
        .send(sessionData)
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      const sessionData = {
        // Missing userId
        title: 'Test Session',
      };

      await request(app.getHttpServer())
        .post('/sessions')
        .set('X-API-Key', apiKey)
        .send(sessionData)
        .expect(400);
    });
  });

  describe('GET /sessions', () => {
    beforeEach(async () => {
      // Create test sessions
      await prismaService.session.createMany({
        data: [
          {
            id: 'session1',
            userId: 'user123',
            title: 'Session 1',
            favorite: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'session2',
            userId: 'user123',
            title: 'Session 2',
            favorite: false,
            createdAt: new Date('2024-01-02'),
          },
          {
            id: 'session3',
            userId: 'user456',
            title: 'Session 3',
            favorite: false,
            createdAt: new Date('2024-01-03'),
          },
        ],
      });
    });

    it('should list sessions for a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId: 'user123' })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(2);
      
      // Should be ordered by favorite first, then by createdAt desc
      expect(response.body.items[0].id).toBe('session1'); // favorite: true
      expect(response.body.items[1].id).toBe('session2'); // favorite: false
    });

    it('should handle pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId: 'user123', page: 1, pageSize: 1 })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(2);
    });

    it('should return empty list for user with no sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/sessions')
        .query({ userId: 'nonexistent' })
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should fail without userId parameter', async () => {
      await request(app.getHttpServer())
        .get('/sessions')
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  describe('PATCH /sessions/:id/rename', () => {
    beforeEach(async () => {
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Original Title',
        },
      });
    });

    it('should rename a session', async () => {
      const renameData = {
        title: 'New Title',
      };

      await request(app.getHttpServer())
        .patch('/sessions/session1/rename')
        .query({ userId: 'user123' })
        .set('X-API-Key', apiKey)
        .send(renameData)
        .expect(200);

      // Verify session was renamed in database
      const session = await prismaService.session.findUnique({
        where: { id: 'session1' },
      });
      expect(session?.title).toBe('New Title');
    });

    it('should fail to rename session of different user', async () => {
      const renameData = {
        title: 'New Title',
      };

      await request(app.getHttpServer())
        .patch('/sessions/session1/rename')
        .query({ userId: 'different-user' })
        .set('X-API-Key', apiKey)
        .send(renameData)
        .expect(404);
    });

    it('should fail to rename non-existent session', async () => {
      const renameData = {
        title: 'New Title',
      };

      await request(app.getHttpServer())
        .patch('/sessions/nonexistent/rename')
        .query({ userId: 'user123' })
        .set('X-API-Key', apiKey)
        .send(renameData)
        .expect(404);
    });
  });

  describe('PATCH /sessions/:id/favorite', () => {
    beforeEach(async () => {
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Test Session',
          favorite: false,
        },
      });
    });

    it('should toggle session favorite status', async () => {
      const favoriteData = {
        favorite: true,
      };

      await request(app.getHttpServer())
        .patch('/sessions/session1/favorite')
        .query({ userId: 'user123' })
        .set('X-API-Key', apiKey)
        .send(favoriteData)
        .expect(200);

      // Verify session favorite status was updated
      const session = await prismaService.session.findUnique({
        where: { id: 'session1' },
      });
      expect(session?.favorite).toBe(true);
    });

    it('should fail to toggle favorite for session of different user', async () => {
      const favoriteData = {
        favorite: true,
      };

      await request(app.getHttpServer())
        .patch('/sessions/session1/favorite')
        .query({ userId: 'different-user' })
        .set('X-API-Key', apiKey)
        .send(favoriteData)
        .expect(404);
    });
  });

  describe('DELETE /sessions/:id', () => {
    beforeEach(async () => {
      await prismaService.session.create({
        data: {
          id: 'session1',
          userId: 'user123',
          title: 'Test Session',
        },
      });
    });

    it('should soft delete a session', async () => {
      await request(app.getHttpServer())
        .delete('/sessions/session1')
        .query({ userId: 'user123' })
        .set('X-API-Key', apiKey)
        .expect(200);

      // Verify session was soft deleted
      const session = await prismaService.session.findUnique({
        where: { id: 'session1' },
      });
      expect(session?.deletedAt).toBeTruthy();
    });

    it('should fail to delete session of different user', async () => {
      await request(app.getHttpServer())
        .delete('/sessions/session1')
        .query({ userId: 'different-user' })
        .set('X-API-Key', apiKey)
        .expect(404);
    });
  });
});
