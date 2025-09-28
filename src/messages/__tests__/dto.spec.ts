import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AddMessageDto, ListMessagesQuery } from '../dto';

describe('Message DTOs', () => {
  describe('AddMessageDto', () => {
    it('should validate with valid user message', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'user',
        content: 'Hello, how are you?',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with valid assistant message', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'assistant',
        content: 'I am doing well, thank you!',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with valid system message', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'system',
        content: 'System initialization complete.',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing sessionId', async () => {
      const dto = plainToClass(AddMessageDto, {
        role: 'user',
        content: 'Hello',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
    });

    it('should fail validation with empty sessionId', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: '',
        role: 'user',
        content: 'Hello',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
    });

    it('should fail validation with missing role', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        content: 'Hello',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
    });

    it('should fail validation with invalid role', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'invalid',
        content: 'Hello',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
    });

    it('should fail validation with missing content', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'user',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
    });

    it('should fail validation with empty content', async () => {
      const dto = plainToClass(AddMessageDto, {
        sessionId: 'session123',
        role: 'user',
        content: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
    });
  });

  describe('ListMessagesQuery', () => {
    it('should validate with valid data', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        sessionId: 'session123',
        page: 1,
        pageSize: 50,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only sessionId', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        sessionId: 'session123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing sessionId', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        page: 1,
        pageSize: 50,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
    });

    it('should fail validation with empty sessionId', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        sessionId: '',
        page: 1,
        pageSize: 50,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
    });

    it('should fail validation with page less than 1', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        sessionId: 'session123',
        page: 0,
        pageSize: 50,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
    });

    it('should fail validation with pageSize less than 1', async () => {
      const dto = plainToClass(ListMessagesQuery, {
        sessionId: 'session123',
        page: 1,
        pageSize: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('pageSize');
    });
  });
});
