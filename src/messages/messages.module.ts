import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { PrismaMessagesRepository } from '../adapters/persistence/prisma/prisma-messages.repository';
import { AddMessageUC, DeleteMessageUC, ListMessagesUC, MESSAGE_REPO } from './application/usecases';
import { MessagesController } from './http/messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [
    PrismaService,
    { provide: MESSAGE_REPO, useClass: PrismaMessagesRepository },
    AddMessageUC, ListMessagesUC, DeleteMessageUC
  ]
})
export class MessagesModule {}
