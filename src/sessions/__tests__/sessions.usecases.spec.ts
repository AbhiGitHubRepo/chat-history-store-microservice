import { Test, TestingModule } from '@nestjs/testing';
import { CreateSessionUC, RenameSessionUC, FavoriteSessionUC, DeleteSessionUC, ListSessionsUC, SESSION_REPO } from '../application/usecases';
import { SessionsRepository } from '../domain/sessions.repository';

describe('Sessions Use Cases', () => {
  let createUC: CreateSessionUC;
  let renameUC: RenameSessionUC;
  let favUC: FavoriteSessionUC;
  let deleteUC: DeleteSessionUC;
  let listUC: ListSessionsUC;
  let mockRepository: jest.Mocked<SessionsRepository>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      rename: jest.fn(),
      favorite: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionUC,
        RenameSessionUC,
        FavoriteSessionUC,
        DeleteSessionUC,
        ListSessionsUC,
        { provide: SESSION_REPO, useValue: mockRepository },
      ],
    }).compile();

    createUC = module.get<CreateSessionUC>(CreateSessionUC);
    renameUC = module.get<RenameSessionUC>(RenameSessionUC);
    favUC = module.get<FavoriteSessionUC>(FavoriteSessionUC);
    deleteUC = module.get<DeleteSessionUC>(DeleteSessionUC);
    listUC = module.get<ListSessionsUC>(ListSessionsUC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateSessionUC', () => {
    it('should create a session with title', async () => {
      const input = { userId: 'user123', title: 'Test Session' };
      const expectedResult = { id: 'session123' };

      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await createUC.execute(input);

      expect(mockRepository.create).toHaveBeenCalledWith('user123', 'Test Session');
      expect(result).toEqual(expectedResult);
    });

    it('should create a session without title', async () => {
      const input = { userId: 'user123' };
      const expectedResult = { id: 'session123' };

      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await createUC.execute(input);

      expect(mockRepository.create).toHaveBeenCalledWith('user123', undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('RenameSessionUC', () => {
    it('should rename a session', async () => {
      const input = { id: 'session123', userId: 'user123', title: 'New Title' };

      mockRepository.rename.mockResolvedValue();

      await renameUC.execute(input);

      expect(mockRepository.rename).toHaveBeenCalledWith('session123', 'user123', 'New Title');
    });
  });

  describe('FavoriteSessionUC', () => {
    it('should set session as favorite', async () => {
      const input = { id: 'session123', userId: 'user123', favorite: true };

      mockRepository.favorite.mockResolvedValue();

      await favUC.execute(input);

      expect(mockRepository.favorite).toHaveBeenCalledWith('session123', 'user123', true);
    });

    it('should remove session from favorites', async () => {
      const input = { id: 'session123', userId: 'user123', favorite: false };

      mockRepository.favorite.mockResolvedValue();

      await favUC.execute(input);

      expect(mockRepository.favorite).toHaveBeenCalledWith('session123', 'user123', false);
    });
  });

  describe('DeleteSessionUC', () => {
    it('should delete a session', async () => {
      const input = { id: 'session123', userId: 'user123' };

      mockRepository.delete.mockResolvedValue();

      await deleteUC.execute(input);

      expect(mockRepository.delete).toHaveBeenCalledWith('session123', 'user123');
    });
  });

  describe('ListSessionsUC', () => {
    it('should list sessions with pagination', async () => {
      const input = { userId: 'user123', page: 1, pageSize: 20 };
      const expectedResult = {
        items: [
          { id: 'session1', title: 'Session 1', favorite: true, createdAt: new Date() },
          { id: 'session2', title: 'Session 2', favorite: false, createdAt: new Date() },
        ],
        total: 2,
      };

      mockRepository.list.mockResolvedValue(expectedResult);

      const result = await listUC.execute(input);

      expect(mockRepository.list).toHaveBeenCalledWith('user123', 1, 20);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty results', async () => {
      const input = { userId: 'user123', page: 1, pageSize: 20 };
      const expectedResult = { items: [], total: 0 };

      mockRepository.list.mockResolvedValue(expectedResult);

      const result = await listUC.execute(input);

      expect(mockRepository.list).toHaveBeenCalledWith('user123', 1, 20);
      expect(result).toEqual(expectedResult);
    });
  });
});
