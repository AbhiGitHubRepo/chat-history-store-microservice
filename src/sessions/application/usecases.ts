import { Inject, Injectable } from '@nestjs/common';
import { SessionsRepository } from '../domain/sessions.repository';

export const SESSION_REPO = Symbol('SESSION_REPO');

@Injectable()
export class CreateSessionUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  execute(input: { userId: string; title?: string }) { return this.repo.create(input.userId, input.title); }
}

@Injectable()
export class RenameSessionUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  execute(input: { id: string; userId: string; title: string }) { return this.repo.rename(input.id, input.userId, input.title); }
}

@Injectable()
export class FavoriteSessionUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  execute(input: { id: string; userId: string; favorite: boolean }) { return this.repo.favorite(input.id, input.userId, input.favorite); }
}

@Injectable()
export class DeleteSessionUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  execute(input: { id: string; userId: string }) { return this.repo.delete(input.id, input.userId); }
}

@Injectable()
export class ListSessionsUC {
  constructor(@Inject(SESSION_REPO) private readonly repo: SessionsRepository) {}
  execute(input: { userId: string; page: number; pageSize: number }) { return this.repo.list(input.userId, input.page, input.pageSize); }
}
