import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const header = (req.headers['x-api-key'] ?? req.headers['X-API-Key']) as string | undefined;
    const expected = this.config.get<string>('API_KEY');
    if (expected && header !== expected) throw new UnauthorizedException('Invalid API key');
    return true;
  }
}
