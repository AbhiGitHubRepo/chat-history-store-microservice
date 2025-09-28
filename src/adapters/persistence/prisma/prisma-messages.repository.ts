import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { MessagesRepository } from '../../../messages/domain/messages.repository';

@Injectable()
export class PrismaMessagesRepository implements MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  add(sessionId: string, role: 'user'|'assistant'|'system', content: string) {
    return this.prisma.message.create({ data: { sessionId, role, content }, select: { id: true } });
  }

  async list(sessionId: string, page: number, pageSize: number) {
    const where = { sessionId, deletedAt: null as any };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, role: true, content: true, createdAt: true }
      }),
      this.prisma.message.count({ where })
    ]);
    return { items, total };
  }

  async delete(id: string) {
    await this.prisma.message.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
