import { validate } from '../validate';

describe('Config Validation', () => {
  describe('validate', () => {
    it('should validate correct configuration', () => {
      const config = {
        PORT: 4000,
        ALLOWED_ORIGINS: 'http://localhost:3000',
        API_KEY: 'test-api-key',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpassword',
        POSTGRES_DB: 'testdb',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://testuser:testpassword@localhost:5432/testdb',
      };

      expect(() => validate(config)).not.toThrow();
    });

    it('should validate configuration with minimal required fields', () => {
      const config = {
        PORT: 3000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).not.toThrow();
    });

    it('should throw error for missing required PORT', () => {
      const config = {
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for invalid PORT type', () => {
      const config = {
        PORT: 'invalid',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for PORT less than 1', () => {
      const config = {
        PORT: 0,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing POSTGRES_USER', () => {
      const config = {
        PORT: 4000,
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing POSTGRES_PASSWORD', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing POSTGRES_DB', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing POSTGRES_HOST', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing POSTGRES_PORT', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for invalid POSTGRES_PORT type', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 'invalid',
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should throw error for missing DATABASE_URL', () => {
      const config = {
        PORT: 4000,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
      };

      expect(() => validate(config)).toThrow('Config validation error:');
    });

    it('should handle optional fields correctly', () => {
      const config = {
        PORT: 4000,
        ALLOWED_ORIGINS: undefined,
        API_KEY: undefined,
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        POSTGRES_PORT: 5432,
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).not.toThrow();
    });

    it('should convert string numbers to integers', () => {
      const config = {
        PORT: '4000',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        POSTGRES_HOST: 'host',
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      };

      expect(() => validate(config)).not.toThrow();
    });
  });
});
