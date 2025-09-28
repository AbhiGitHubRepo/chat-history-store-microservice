import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SessionsController } from '../http/sessions.controller';
import { CreateSessionUC, RenameSessionUC, FavoriteSessionUC, DeleteSessionUC, ListSessionsUC } from '../application/usecases';
import { StartSessionDto, RenameSessionDto, ToggleFavoriteDto } from '../dto';
import { ApiKeyGuard } from '../../common/guard/api-key.gaurd';
import { RateLimitGuard } from '../../common/guard/rate-limit.gaurd';

describe('SessionsController', () => {
  let controller: SessionsController;
  let createUC: CreateSessionUC;
  let renameUC: RenameSessionUC;
  let favUC: FavoriteSessionUC;
  let deleteUC: DeleteSessionUC;
  let listUC: ListSessionsUC;

  const mockCreateUC = {
    execute: jest.fn(),
  };

  const mockRenameUC = {
    execute: jest.fn(),
  };

  const mockFavUC = {
    execute: jest.fn(),
  };

  const mockDeleteUC = {
    execute: jest.fn(),
  };

  const mockListUC = {
    execute: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        { provide: CreateSessionUC, useValue: mockCreateUC },
        { provide: RenameSessionUC, useValue: mockRenameUC },
        { provide: FavoriteSessionUC, useValue: mockFavUC },
        { provide: DeleteSessionUC, useValue: mockDeleteUC },
        { provide: ListSessionsUC, useValue: mockListUC },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RateLimitGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<SessionsController>(SessionsController);
    createUC = module.get<CreateSessionUC>(CreateSessionUC);
    renameUC = module.get<RenameSessionUC>(RenameSessionUC);
    favUC = module.get<FavoriteSessionUC>(FavoriteSessionUC);
    deleteUC = module.get<DeleteSessionUC>(DeleteSessionUC);
    listUC = module.get<ListSessionsUC>(ListSessionsUC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const dto: StartSessionDto = { userId: 'user123', title: 'Test Session' };
      const expectedResult = { id: 'session123' };

      mockCreateUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(mockCreateUC.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should create a session without title', async () => {
      const dto: StartSessionDto = { userId: 'user123' };
      const expectedResult = { id: 'session123' };

      mockCreateUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(mockCreateUC.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('rename', () => {
    it('should rename a session', async () => {
      const id = 'session123';
      const dto: RenameSessionDto = { title: 'New Title' };
      const userId = 'user123';

      mockRenameUC.execute.mockResolvedValue(undefined);

      await controller.rename(id, dto, userId);

      expect(mockRenameUC.execute).toHaveBeenCalledWith({
        id,
        userId,
        title: dto.title,
      });
    });
  });

  describe('favorite', () => {
    it('should toggle session favorite status', async () => {
      const id = 'session123';
      const dto: ToggleFavoriteDto = { favorite: true };
      const userId = 'user123';

      mockFavUC.execute.mockResolvedValue(undefined);

      await controller.favorite(id, dto, userId);

      expect(mockFavUC.execute).toHaveBeenCalledWith({
        id,
        userId,
        favorite: dto.favorite,
      });
    });
  });

  describe('remove', () => {
    it('should delete a session', async () => {
      const id = 'session123';
      const userId = 'user123';

      mockDeleteUC.execute.mockResolvedValue(undefined);

      await controller.remove(id, userId);

      expect(mockDeleteUC.execute).toHaveBeenCalledWith({ id, userId });
    });
  });

  describe('list', () => {
    it('should list sessions with default pagination', async () => {
      const userId = 'user123';
      const page = 1;
      const pageSize = 20;
      const expectedResult = {
        items: [
          { id: 'session1', title: 'Session 1', favorite: true, createdAt: new Date() },
          { id: 'session2', title: 'Session 2', favorite: false, createdAt: new Date() },
        ],
        total: 2,
      };

      mockListUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.list(userId, page, pageSize);

      expect(mockListUC.execute).toHaveBeenCalledWith({
        userId,
        page,
        pageSize,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should list sessions with custom pagination', async () => {
      const userId = 'user123';
      const page = 2;
      const pageSize = 10;
      const expectedResult = {
        items: [{ id: 'session3', title: 'Session 3', favorite: false, createdAt: new Date() }],
        total: 15,
      };

      mockListUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.list(userId, page, pageSize);

      expect(mockListUC.execute).toHaveBeenCalledWith({
        userId,
        page,
        pageSize,
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
