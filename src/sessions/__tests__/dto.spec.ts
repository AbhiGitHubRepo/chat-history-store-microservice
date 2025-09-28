import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { StartSessionDto, RenameSessionDto, ToggleFavoriteDto, ListSessionsQuery } from '../dto';

describe('Session DTOs', () => {
  describe('StartSessionDto', () => {
    it('should validate with valid data', async () => {
      const dto = plainToClass(StartSessionDto, {
        userId: 'user123',
        title: 'Test Session',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only userId', async () => {
      const dto = plainToClass(StartSessionDto, {
        userId: 'user123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing userId', async () => {
      const dto = plainToClass(StartSessionDto, {
        title: 'Test Session',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with empty userId', async () => {
      const dto = plainToClass(StartSessionDto, {
        userId: '',
        title: 'Test Session',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with non-string userId', async () => {
      const dto = plainToClass(StartSessionDto, {
        userId: 123,
        title: 'Test Session',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });
  });

  describe('RenameSessionDto', () => {
    it('should validate with valid data', async () => {
      const dto = plainToClass(RenameSessionDto, {
        title: 'New Title',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing title', async () => {
      const dto = plainToClass(RenameSessionDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with empty title', async () => {
      const dto = plainToClass(RenameSessionDto, {
        title: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with non-string title', async () => {
      const dto = plainToClass(RenameSessionDto, {
        title: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });
  });

  describe('ToggleFavoriteDto', () => {
    it('should validate with true value', async () => {
      const dto = plainToClass(ToggleFavoriteDto, {
        favorite: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with false value', async () => {
      const dto = plainToClass(ToggleFavoriteDto, {
        favorite: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing favorite', async () => {
      const dto = plainToClass(ToggleFavoriteDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('favorite');
    });

    it('should fail validation with non-boolean favorite', async () => {
      const dto = plainToClass(ToggleFavoriteDto, {
        favorite: 'true',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('favorite');
    });
  });

  describe('ListSessionsQuery', () => {
    it('should validate with valid data', async () => {
      const dto = plainToClass(ListSessionsQuery, {
        userId: 'user123',
        page: 1,
        pageSize: 20,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only userId', async () => {
      const dto = plainToClass(ListSessionsQuery, {
        userId: 'user123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing userId', async () => {
      const dto = plainToClass(ListSessionsQuery, {
        page: 1,
        pageSize: 20,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with page less than 1', async () => {
      const dto = plainToClass(ListSessionsQuery, {
        userId: 'user123',
        page: 0,
        pageSize: 20,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
    });

    it('should fail validation with pageSize less than 1', async () => {
      const dto = plainToClass(ListSessionsQuery, {
        userId: 'user123',
        page: 1,
        pageSize: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('pageSize');
    });
  });
});
