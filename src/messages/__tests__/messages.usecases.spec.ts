import { Test, TestingModule } from '@nestjs/testing';
import { AddMessageUC, ListMessagesUC, DeleteMessageUC, MESSAGE_REPO } from '../application/usecases';
import { MessagesRepository } from '../domain/messages.repository';

describe('Messages Use Cases', () => {
  let addUC: AddMessageUC;
  let listUC: ListMessagesUC;
  let deleteUC: DeleteMessageUC;
  let mockRepository: jest.Mocked<MessagesRepository>;

  beforeEach(async () => {
    mockRepository = {
      add: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddMessageUC,
        ListMessagesUC,
        DeleteMessageUC,
        { provide: MESSAGE_REPO, useValue: mockRepository },
      ],
    }).compile();

    addUC = module.get<AddMessageUC>(AddMessageUC);
    listUC = module.get<ListMessagesUC>(ListMessagesUC);
    deleteUC = module.get<DeleteMessageUC>(DeleteMessageUC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AddMessageUC', () => {
    it('should add a user message', async () => {
      const input = {
        sessionId: 'session123',
        role: 'user' as const,
        content: 'Hello, how are you?',
      };
      const expectedResult = { id: 'message123' };

      mockRepository.add.mockResolvedValue(expectedResult);

      const result = await addUC.execute(input);

      expect(mockRepository.add).toHaveBeenCalledWith('session123', 'user', 'Hello, how are you?');
      expect(result).toEqual(expectedResult);
    });

    it('should add an assistant message', async () => {
      const input = {
        sessionId: 'session123',
        role: 'assistant' as const,
        content: 'I am doing well, thank you!',
      };
      const expectedResult = { id: 'message124' };

      mockRepository.add.mockResolvedValue(expectedResult);

      const result = await addUC.execute(input);

      expect(mockRepository.add).toHaveBeenCalledWith('session123', 'assistant', 'I am doing well, thank you!');
      expect(result).toEqual(expectedResult);
    });

    it('should add a system message', async () => {
      const input = {
        sessionId: 'session123',
        role: 'system' as const,
        content: 'System initialization complete.',
      };
      const expectedResult = { id: 'message125' };

      mockRepository.add.mockResolvedValue(expectedResult);

      const result = await addUC.execute(input);

      expect(mockRepository.add).toHaveBeenCalledWith('session123', 'system', 'System initialization complete.');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('ListMessagesUC', () => {
    it('should list messages with pagination', async () => {
      const input = { sessionId: 'session123', page: 1, pageSize: 50 };
      const expectedResult = {
        items: [
          { id: 'message1', role: 'user', content: 'Hello', createdAt: new Date() },
          { id: 'message2', role: 'assistant', content: 'Hi there!', createdAt: new Date() },
        ],
        total: 2,
      };

      mockRepository.list.mockResolvedValue(expectedResult);

      const result = await listUC.execute(input);

      expect(mockRepository.list).toHaveBeenCalledWith('session123', 1, 50);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty results', async () => {
      const input = { sessionId: 'session123', page: 1, pageSize: 50 };
      const expectedResult = { items: [], total: 0 };

      mockRepository.list.mockResolvedValue(expectedResult);

      const result = await listUC.execute(input);

      expect(mockRepository.list).toHaveBeenCalledWith('session123', 1, 50);
      expect(result).toEqual(expectedResult);
    });

    it('should handle pagination correctly', async () => {
      const input = { sessionId: 'session123', page: 3, pageSize: 10 };
      const expectedResult = {
        items: [{ id: 'message30', role: 'user', content: 'Last message', createdAt: new Date() }],
        total: 25,
      };

      mockRepository.list.mockResolvedValue(expectedResult);

      const result = await listUC.execute(input);

      expect(mockRepository.list).toHaveBeenCalledWith('session123', 3, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('DeleteMessageUC', () => {
    it('should delete a message', async () => {
      const input = { id: 'message123' };

      mockRepository.delete.mockResolvedValue();

      await deleteUC.execute(input);

      expect(mockRepository.delete).toHaveBeenCalledWith('message123');
    });
  });
});
