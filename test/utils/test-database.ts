import { PrismaService } from '../../src/shared/prisma/prisma.service';

export class TestDatabase {
  constructor(private readonly prisma: PrismaService) {}

  async cleanup() {
    await this.prisma.message.deleteMany();
    await this.prisma.session.deleteMany();
  }

  async seedTestData() {
    // Create test sessions
    const session1 = await this.prisma.session.create({
      data: {
        id: 'test-session-1',
        userId: 'test-user-1',
        title: 'Test Session 1',
        favorite: true,
      },
    });

    const session2 = await this.prisma.session.create({
      data: {
        id: 'test-session-2',
        userId: 'test-user-1',
        title: 'Test Session 2',
        favorite: false,
      },
    });

    const session3 = await this.prisma.session.create({
      data: {
        id: 'test-session-3',
        userId: 'test-user-2',
        title: 'Test Session 3',
        favorite: false,
      },
    });

    // Create test messages
    const message1 = await this.prisma.message.create({
      data: {
        id: 'test-message-1',
        sessionId: session1.id,
        role: 'user',
        content: 'Hello, this is a test message',
      },
    });

    const message2 = await this.prisma.message.create({
      data: {
        id: 'test-message-2',
        sessionId: session1.id,
        role: 'assistant',
        content: 'This is an assistant response',
      },
    });

    const message3 = await this.prisma.message.create({
      data: {
        id: 'test-message-3',
        sessionId: session2.id,
        role: 'user',
        content: 'Another test message',
      },
    });

    return {
      sessions: [session1, session2, session3],
      messages: [message1, message2, message3],
    };
  }

  async createTestSession(userId: string, title?: string) {
    return this.prisma.session.create({
      data: {
        userId,
        title,
      },
    });
  }

  async createTestMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string) {
    return this.prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }

  async getSession(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  async getMessage(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }
}
