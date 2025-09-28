import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestHelpers {
  constructor(private readonly app: INestApplication, private readonly apiKey: string) {}

  async createSession(userId: string, title?: string) {
    const response = await request(this.app.getHttpServer())
      .post('/sessions')
      .set('X-API-Key', this.apiKey)
      .send({ userId, title })
      .expect(201);
    
    return response.body;
  }

  async getSessions(userId: string, page = 1, pageSize = 20) {
    const response = await request(this.app.getHttpServer())
      .get('/sessions')
      .query({ userId, page, pageSize })
      .set('X-API-Key', this.apiKey)
      .expect(200);
    
    return response.body;
  }

  async renameSession(id: string, userId: string, title: string) {
    await request(this.app.getHttpServer())
      .patch(`/sessions/${id}/rename`)
      .query({ userId })
      .set('X-API-Key', this.apiKey)
      .send({ title })
      .expect(200);
  }

  async toggleFavorite(id: string, userId: string, favorite: boolean) {
    await request(this.app.getHttpServer())
      .patch(`/sessions/${id}/favorite`)
      .query({ userId })
      .set('X-API-Key', this.apiKey)
      .send({ favorite })
      .expect(200);
  }

  async deleteSession(id: string, userId: string) {
    await request(this.app.getHttpServer())
      .delete(`/sessions/${id}`)
      .query({ userId })
      .set('X-API-Key', this.apiKey)
      .expect(200);
  }

  async createMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string) {
    const response = await request(this.app.getHttpServer())
      .post('/messages')
      .set('X-API-Key', this.apiKey)
      .send({ sessionId, role, content })
      .expect(201);
    
    return response.body;
  }

  async getMessages(sessionId: string, page = 1, pageSize = 50) {
    const response = await request(this.app.getHttpServer())
      .get('/messages')
      .query({ sessionId, page, pageSize })
      .set('X-API-Key', this.apiKey)
      .expect(200);
    
    return response.body;
  }

  async deleteMessage(id: string) {
    await request(this.app.getHttpServer())
      .delete(`/messages/${id}`)
      .set('X-API-Key', this.apiKey)
      .expect(200);
  }

  async healthCheck() {
    const response = await request(this.app.getHttpServer())
      .get('/health')
      .expect(200);
    
    return response.body;
  }

  async makeRequestWithoutApiKey(method: 'get' | 'post' | 'patch' | 'delete', url: string, data?: any) {
    const req = request(this.app.getHttpServer())[method](url);
    
    if (data) {
      req.send(data);
    }
    
    return req.expect(401);
  }

  async makeRequestWithInvalidApiKey(method: 'get' | 'post' | 'patch' | 'delete', url: string, data?: any) {
    const req = request(this.app.getHttpServer())[method](url)
      .set('X-API-Key', 'invalid-key');
    
    if (data) {
      req.send(data);
    }
    
    return req.expect(401);
  }

  async makeMultipleRequests(count: number, requestFn: () => Promise<any>) {
    const promises = Array.from({ length: count }, () => requestFn());
    return Promise.allSettled(promises);
  }
}
