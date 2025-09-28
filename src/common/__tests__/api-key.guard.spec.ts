import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from '../guard/api-key.gaurd';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when API_KEY is not configured', () => {
      configService.get.mockReturnValue(undefined);

      const mockRequest = {
        headers: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('API_KEY');
    });

    it('should return true when API key matches', () => {
      const expectedApiKey = 'test-api-key';
      configService.get.mockReturnValue(expectedApiKey);

      const mockRequest = {
        headers: {
          'x-api-key': expectedApiKey,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when API key matches with uppercase header', () => {
      const expectedApiKey = 'test-api-key';
      configService.get.mockReturnValue(expectedApiKey);

      const mockRequest = {
        headers: {
          'X-API-Key': expectedApiKey,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when API key is missing', () => {
      const expectedApiKey = 'test-api-key';
      configService.get.mockReturnValue(expectedApiKey);

      const mockRequest = {
        headers: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Invalid API key');
    });

    it('should throw UnauthorizedException when API key does not match', () => {
      const expectedApiKey = 'test-api-key';
      const providedApiKey = 'wrong-api-key';
      configService.get.mockReturnValue(expectedApiKey);

      const mockRequest = {
        headers: {
          'x-api-key': providedApiKey,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Invalid API key');
    });

    it('should throw UnauthorizedException when API key is empty string', () => {
      const expectedApiKey = 'test-api-key';
      configService.get.mockReturnValue(expectedApiKey);

      const mockRequest = {
        headers: {
          'x-api-key': '',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Invalid API key');
    });
  });
});
