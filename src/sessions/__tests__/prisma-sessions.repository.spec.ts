import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSessionsRepository } from '../../adapters/persistence/prisma/prisma-sessions.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';

describe('PrismaSessionsRepository', () => {
  let repository: PrismaSessionsRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      session: {
        create: jest.fn().mockResolvedValue({ id: 'test-id' }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockResolvedValue([[], 0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSessionsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaSessionsRepository>(PrismaSessionsRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a session with title', async () => {
      const userId = 'user123';
      const title = 'Test Session';
      const expectedResult = { id: 'session123' };

      (prismaService.session.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.create(userId, title);

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: { userId, title },
        select: { id: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a session without title', async () => {
      const userId = 'user123';
      const expectedResult = { id: 'session123' };

      (prismaService.session.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.create(userId);

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: { userId, title: undefined },
        select: { id: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('rename', () => {
    it('should rename a session', async () => {
      const id = 'session123';
      const userId = 'user123';
      const title = 'New Title';

      (prismaService.session.update as jest.Mock).mockResolvedValue({});

      await repository.rename(id, userId, title);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
        data: { title },
      });
    });
  });

  describe('favorite', () => {
    it('should set session as favorite', async () => {
      const id = 'session123';
      const userId = 'user123';
      const favorite = true;

      (prismaService.session.update as jest.Mock).mockResolvedValue({});

      await repository.favorite(id, userId, favorite);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
        data: { favorite },
      });
    });

    it('should remove session from favorites', async () => {
      const id = 'session123';
      const userId = 'user123';
      const favorite = false;

      (prismaService.session.update as jest.Mock).mockResolvedValue({});

      await repository.favorite(id, userId, favorite);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
        data: { favorite },
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a session', async () => {
      const id = 'session123';
      const userId = 'user123';
      const mockDate = new Date();

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      (prismaService.session.update as jest.Mock).mockResolvedValue({});

      await repository.delete(id, userId);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
        data: { deletedAt: mockDate },
      });

      jest.restoreAllMocks();
    });
  });

  describe('list', () => {
    it('should list sessions with pagination', async () => {
      const userId = 'user123';
      const page = 1;
      const pageSize = 20;
      const mockItems = [
        { id: 'session1', title: 'Session 1', favorite: true, createdAt: new Date() },
        { id: 'session2', title: 'Session 2', favorite: false, createdAt: new Date() },
      ];
      const mockTotal = 2;

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockItems, mockTotal]);

      const result = await repository.list(userId, page, pageSize);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.session.findMany({
          where: { userId, deletedAt: null },
          orderBy: [{ favorite: 'desc' }, { createdAt: 'desc' }],
          skip: 0,
          take: 20,
          select: { id: true, title: true, favorite: true, createdAt: true },
        }),
        prismaService.session.count({ where: { userId, deletedAt: null } }),
      ]);
      expect(result).toEqual({ items: mockItems, total: mockTotal });
    });

    it('should handle second page pagination', async () => {
      const userId = 'user123';
      const page = 2;
      const pageSize = 10;
      const mockItems = [{ id: 'session3', title: 'Session 3', favorite: false, createdAt: new Date() }];
      const mockTotal = 15;

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockItems, mockTotal]);

      const result = await repository.list(userId, page, pageSize);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.session.findMany({
          where: { userId, deletedAt: null },
          orderBy: [{ favorite: 'desc' }, { createdAt: 'desc' }],
          skip: 10,
          take: 10,
          select: { id: true, title: true, favorite: true, createdAt: true },
        }),
        prismaService.session.count({ where: { userId, deletedAt: null } }),
      ]);
      expect(result).toEqual({ items: mockItems, total: mockTotal });
    });
  });

  describe('get', () => {
    it('should get a session by id and userId', async () => {
      const id = 'session123';
      const userId = 'user123';
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        title: 'Test Session',
        favorite: false,
        createdAt: new Date(),
        deletedAt: null,
        messages: [],
      };

      (prismaService.session.findFirst as jest.Mock).mockResolvedValue(mockSession);

      const result = await repository.get(id, userId);

      expect(prismaService.session.findFirst).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null if session not found', async () => {
      const id = 'nonexistent';
      const userId = 'user123';

      (prismaService.session.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.get(id, userId);

      expect(prismaService.session.findFirst).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
      });
      expect(result).toBeNull();
    });
  });
});
