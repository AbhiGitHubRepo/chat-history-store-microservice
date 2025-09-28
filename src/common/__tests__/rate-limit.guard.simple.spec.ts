import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitGuard } from '../guard/rate-limit.gaurd';

describe('RateLimitGuard (Simple)', () => {
  describe('canActivate', () => {
    it('should allow first request', () => {
      const guard = new RateLimitGuard();
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow requests within rate limit', () => {
      const guard = new RateLimitGuard();
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Make 10 requests (well within limit)
      for (let i = 0; i < 10; i++) {
        const result = guard.canActivate(mockContext);
        expect(result).toBe(true);
      }
    });

    it('should use different buckets for different IPs', () => {
      const guard = new RateLimitGuard();
      
      const mockRequest1 = {
        ip: '192.168.1.1',
        headers: {},
      };

      const mockRequest2 = {
        ip: '192.168.1.2',
        headers: {},
      };

      const mockContext1 = {
        switchToHttp: () => ({
          getRequest: () => mockRequest1,
        }),
      } as ExecutionContext;

      const mockContext2 = {
        switchToHttp: () => ({
          getRequest: () => mockRequest2,
        }),
      } as ExecutionContext;

      // Make 30 requests from first IP (within limit)
      for (let i = 0; i < 30; i++) {
        guard.canActivate(mockContext1);
      }

      // Second IP should still be allowed
      const result = guard.canActivate(mockContext2);
      expect(result).toBe(true);
    });

    it('should handle missing IP gracefully', () => {
      const guard = new RateLimitGuard();
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
    });
  });
});
