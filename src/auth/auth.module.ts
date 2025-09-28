import { Module } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guard/api-key.gaurd'; 

@Module({
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class AuthModule {}
