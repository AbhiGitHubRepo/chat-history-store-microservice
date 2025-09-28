import { Test, TestingModule } from '@nestjs/testing';
import { PrismaMessagesRepository } from '../../adapters/persistence/prisma/prisma-messages.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';

describe('PrismaMessagesRepository', () => {
  let repository: PrismaMessagesRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      message: {
        create: jest.fn().mockResolvedValue({ id: 'test-id' }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn().mockResolvedValue([[], 0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaMessagesRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaMessagesRepository>(PrismaMessagesRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add a user message', async () => {
      const sessionId = 'session123';
      const role = 'user';
      const content = 'Hello, how are you?';
      const expectedResult = { id: 'message123' };

      (prismaService.message.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.add(sessionId, role, content);

      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: { sessionId, role, content },
        select: { id: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should add an assistant message', async () => {
      const sessionId = 'session123';
      const role = 'assistant';
      const content = 'I am doing well, thank you!';
      const expectedResult = { id: 'message124' };

      (prismaService.message.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.add(sessionId, role, content);

      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: { sessionId, role, content },
        select: { id: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should add a system message', async () => {
      const sessionId = 'session123';
      const role = 'system';
      const content = 'System initialization complete.';
      const expectedResult = { id: 'message125' };

      (prismaService.message.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.add(sessionId, role, content);

      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: { sessionId, role, content },
        select: { id: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('list', () => {
    it('should list messages with pagination', async () => {
      const sessionId = 'session123';
      const page = 1;
      const pageSize = 50;
      const mockItems = [
        { id: 'message1', role: 'user', content: 'Hello', createdAt: new Date() },
        { id: 'message2', role: 'assistant', content: 'Hi there!', createdAt: new Date() },
      ];
      const mockTotal = 2;

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockItems, mockTotal]);

      const result = await repository.list(sessionId, page, pageSize);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.message.findMany({
          where: { sessionId, deletedAt: null },
          orderBy: { createdAt: 'asc' },
          skip: 0,
          take: 50,
          select: { id: true, role: true, content: true, createdAt: true },
        }),
        prismaService.message.count({ where: { sessionId, deletedAt: null } }),
      ]);
      expect(result).toEqual({ items: mockItems, total: mockTotal });
    });

    it('should handle second page pagination', async () => {
      const sessionId = 'session123';
      const page = 2;
      const pageSize = 10;
      const mockItems = [
        { id: 'message11', role: 'user', content: 'How are you?', createdAt: new Date() },
      ];
      const mockTotal = 15;

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockItems, mockTotal]);

      const result = await repository.list(sessionId, page, pageSize);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.message.findMany({
          where: { sessionId, deletedAt: null },
          orderBy: { createdAt: 'asc' },
          skip: 10,
          take: 10,
          select: { id: true, role: true, content: true, createdAt: true },
        }),
        prismaService.message.count({ where: { sessionId, deletedAt: null } }),
      ]);
      expect(result).toEqual({ items: mockItems, total: mockTotal });
    });

    it('should handle empty results', async () => {
      const sessionId = 'session123';
      const page = 1;
      const pageSize = 50;
      const mockItems: any[] = [];
      const mockTotal = 0;

      (prismaService.$transaction as jest.Mock).mockResolvedValue([mockItems, mockTotal]);

      const result = await repository.list(sessionId, page, pageSize);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.message.findMany({
          where: { sessionId, deletedAt: null },
          orderBy: { createdAt: 'asc' },
          skip: 0,
          take: 50,
          select: { id: true, role: true, content: true, createdAt: true },
        }),
        prismaService.message.count({ where: { sessionId, deletedAt: null } }),
      ]);
      expect(result).toEqual({ items: mockItems, total: mockTotal });
    });
  });

  describe('delete', () => {
    it('should soft delete a message', async () => {
      const id = 'message123';
      const mockDate = new Date();

      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      (prismaService.message.update as jest.Mock).mockResolvedValue({});

      await repository.delete(id);

      expect(prismaService.message.update).toHaveBeenCalledWith({
        where: { id },
        data: { deletedAt: mockDate },
      });

      jest.restoreAllMocks();
    });
  });
});
