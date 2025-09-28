import { Inject, Injectable } from '@nestjs/common';
import { MessagesRepository } from '../domain/messages.repository';

export const MESSAGE_REPO = Symbol('MESSAGE_REPO');

@Injectable()
export class AddMessageUC {
  constructor(@Inject(MESSAGE_REPO) private readonly repo: MessagesRepository) {}
  execute(input: { sessionId: string; role: 'user'|'assistant'|'system'; content: string }) {
    return this.repo.add(input.sessionId, input.role, input.content);
  }
}

@Injectable()
export class ListMessagesUC {
  constructor(@Inject(MESSAGE_REPO) private readonly repo: MessagesRepository) {}
  execute(input: { sessionId: string; page: number; pageSize: number }) {
    return this.repo.list(input.sessionId, input.page, input.pageSize);
  }
}

@Injectable()
export class DeleteMessageUC {
  constructor(@Inject(MESSAGE_REPO) private readonly repo: MessagesRepository) {}
  execute(input: { id: string }) { return this.repo.delete(input.id); }
}
