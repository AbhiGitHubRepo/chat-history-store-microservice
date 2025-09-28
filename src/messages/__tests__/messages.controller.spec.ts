import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagesController } from '../http/messages.controller';
import { AddMessageUC, ListMessagesUC, DeleteMessageUC } from '../application/usecases';
import { AddMessageDto } from '../dto';
import { ApiKeyGuard } from '../../common/guard/api-key.gaurd';
import { RateLimitGuard } from '../../common/guard/rate-limit.gaurd';

describe('MessagesController', () => {
  let controller: MessagesController;
  let addUC: AddMessageUC;
  let listUC: ListMessagesUC;
  let delUC: DeleteMessageUC;

  const mockAddUC = {
    execute: jest.fn(),
  };

  const mockListUC = {
    execute: jest.fn(),
  };

  const mockDelUC = {
    execute: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: AddMessageUC, useValue: mockAddUC },
        { provide: ListMessagesUC, useValue: mockListUC },
        { provide: DeleteMessageUC, useValue: mockDelUC },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RateLimitGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<MessagesController>(MessagesController);
    addUC = module.get<AddMessageUC>(AddMessageUC);
    listUC = module.get<ListMessagesUC>(ListMessagesUC);
    delUC = module.get<DeleteMessageUC>(DeleteMessageUC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add a user message', async () => {
      const dto: AddMessageDto = {
        sessionId: 'session123',
        role: 'user',
        content: 'Hello, how are you?',
      };
      const expectedResult = { id: 'message123' };

      mockAddUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.add(dto);

      expect(mockAddUC.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should add an assistant message', async () => {
      const dto: AddMessageDto = {
        sessionId: 'session123',
        role: 'assistant',
        content: 'I am doing well, thank you!',
      };
      const expectedResult = { id: 'message124' };

      mockAddUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.add(dto);

      expect(mockAddUC.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should add a system message', async () => {
      const dto: AddMessageDto = {
        sessionId: 'session123',
        role: 'system',
        content: 'System initialization complete.',
      };
      const expectedResult = { id: 'message125' };

      mockAddUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.add(dto);

      expect(mockAddUC.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('list', () => {
    it('should list messages with default pagination', async () => {
      const sessionId = 'session123';
      const page = 1;
      const pageSize = 50;
      const expectedResult = {
        items: [
          { id: 'message1', role: 'user', content: 'Hello', createdAt: new Date() },
          { id: 'message2', role: 'assistant', content: 'Hi there!', createdAt: new Date() },
        ],
        total: 2,
      };

      mockListUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.list(sessionId, page, pageSize);

      expect(mockListUC.execute).toHaveBeenCalledWith({
        sessionId,
        page,
        pageSize,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should list messages with custom pagination', async () => {
      const sessionId = 'session123';
      const page = 2;
      const pageSize = 10;
      const expectedResult = {
        items: [
          { id: 'message3', role: 'user', content: 'How are you?', createdAt: new Date() },
        ],
        total: 15,
      };

      mockListUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.list(sessionId, page, pageSize);

      expect(mockListUC.execute).toHaveBeenCalledWith({
        sessionId,
        page,
        pageSize,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty message list', async () => {
      const sessionId = 'session123';
      const page = 1;
      const pageSize = 50;
      const expectedResult = { items: [], total: 0 };

      mockListUC.execute.mockResolvedValue(expectedResult);

      const result = await controller.list(sessionId, page, pageSize);

      expect(mockListUC.execute).toHaveBeenCalledWith({
        sessionId,
        page,
        pageSize,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete a message', async () => {
      const id = 'message123';

      mockDelUC.execute.mockResolvedValue(undefined);

      await controller.delete(id);

      expect(mockDelUC.execute).toHaveBeenCalledWith({ id });
    });
  });
});
