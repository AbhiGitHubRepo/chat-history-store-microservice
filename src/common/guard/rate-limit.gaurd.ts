import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

const BUCKET = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 60;

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = (req.ip || 'ip') + ':' + (req.headers['x-api-key'] || '');
    const now = Date.now();
    const bucket = BUCKET.get(key);
    if (!bucket || now - bucket.ts > WINDOW_MS) {
      BUCKET.set(key, { count: 1, ts: now });
      return true;
    }
    bucket.count++;
    if (bucket.count > LIMIT) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
