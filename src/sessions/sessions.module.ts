import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { PrismaSessionsRepository } from '../adapters/persistence/prisma/prisma-sessions.repository';
import { CreateSessionUC, DeleteSessionUC, FavoriteSessionUC, ListSessionsUC, RenameSessionUC, SESSION_REPO } from './application/usecases';
import { SessionsController } from './http/sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [
    PrismaService,
    { provide: SESSION_REPO, useClass: PrismaSessionsRepository },
    CreateSessionUC, RenameSessionUC, FavoriteSessionUC, DeleteSessionUC, ListSessionsUC
  ],
})
export class SessionsModule {}
