export interface MessagesRepository {
    add(sessionId: string, role: 'user'|'assistant'|'system', content: string): Promise<{ id: string }>;
    list(sessionId: string, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
    delete(id: string): Promise<void>;
  }
  