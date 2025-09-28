import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { SessionsRepository } from '../../../sessions/domain/sessions.repository';

@Injectable()
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, title?: string) {
    return this.prisma.session.create({ data: { userId, title }, select: { id: true } });
  }

  async rename(id: string, userId: string, title: string) {
    await this.prisma.session.update({ where: { id, userId, deletedAt: null }, data: { title } });
  }

  async favorite(id: string, userId: string, favorite: boolean) {
    await this.prisma.session.update({ where: { id, userId, deletedAt: null }, data: { favorite } });
  }

  async delete(id: string, userId: string) {
    await this.prisma.session.update({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } });
  }

  async list(userId: string, page: number, pageSize: number) {
    const where = { userId, deletedAt: null as any };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.session.findMany({
        where,
        orderBy: [{ favorite: 'desc' as const }, { createdAt: 'desc' as const }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, title: true, favorite: true, createdAt: true }
      }),
      this.prisma.session.count({ where })
    ]);
    return { items, total };
  }

  get(id: string, userId: string) {
    return this.prisma.session.findFirst({ where: { id, userId, deletedAt: null } });
  }
}
