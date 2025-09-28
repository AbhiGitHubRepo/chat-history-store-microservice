import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './validate';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate })],
})
export class AppConfigModule {}
