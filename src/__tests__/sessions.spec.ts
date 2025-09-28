import { Test, TestingModule } from '@nestjs/testing';
import { CreateSessionUC, SESSION_REPO } from '../sessions/application/usecases';

class FakeSessionsRepo {
  async create(userId: string, title?: string) { return { id: 'test123' }; }
  rename() { return Promise.resolve(); }
  favorite() { return Promise.resolve(); }
  delete() { return Promise.resolve(); }
  list() { return Promise.resolve({ items:[], total:0 }); }
  get() { return Promise.resolve(null); }
}

describe('CreateSessionUC (Legacy Test)', () => {
  let createUC: CreateSessionUC;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SESSION_REPO, useClass: FakeSessionsRepo },
        CreateSessionUC,
      ],
    }).compile();
    
    createUC = moduleRef.get<CreateSessionUC>(CreateSessionUC);
  });

  it('returns an id', async () => {
    const out = await createUC.execute({ userId: 'u1', title: 'T' });
    expect(out).toHaveProperty('id', 'test123');
  });

  it('should handle session creation without title', async () => {
    const out = await createUC.execute({ userId: 'u1' });
    expect(out).toHaveProperty('id', 'test123');
  });
});
