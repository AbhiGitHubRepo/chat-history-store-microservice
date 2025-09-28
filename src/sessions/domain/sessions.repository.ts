export interface SessionsRepository {
    create(userId: string, title?: string): Promise<{ id: string }>;
    rename(id: string, userId: string, title: string): Promise<void>;
    favorite(id: string, userId: string, favorite: boolean): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
    list(userId: string, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
    get(id: string, userId: string): Promise<any | null>;
  }
  