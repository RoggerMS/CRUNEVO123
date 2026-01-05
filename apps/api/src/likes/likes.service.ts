import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../vitality/notifications.service';

type LikeTarget = 'post' | 'document' | 'question';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async toggle(userId: string, type: LikeTarget, targetId: string) {
    let where: any = { authorId: userId };
    if (type === 'post') where.postId = targetId;
    if (type === 'document') where.documentId = targetId;
    if (type === 'question') where.questionId = targetId;

    const existing = await this.prisma.like.findFirst({ where });
    let liked = false;

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await this.prisma.like.create({ data: where });
      liked = true;
      let ownerId: string | null = null;
      if (type === 'post') {
        const post = await this.prisma.post.findUnique({ where: { id: targetId } });
        ownerId = post?.authorId || null;
      } else if (type === 'document') {
        const doc = await this.prisma.document.findUnique({ where: { id: targetId } });
        ownerId = doc?.ownerId || null;
      } else {
        const q = await this.prisma.question.findUnique({ where: { id: targetId } });
        ownerId = q?.authorId || null;
      }
      if (ownerId && ownerId !== userId) {
        await this.notifications.createNotification(ownerId, 'Nuevo like', 'LIKE');
      }
    }

    let count = 0;
    if (type === 'post') {
      count = await this.prisma.like.count({ where: { postId: targetId } });
    } else if (type === 'document') {
      count = await this.prisma.like.count({ where: { documentId: targetId } });
    } else {
      count = await this.prisma.like.count({ where: { questionId: targetId } });
    }

    return { liked, count };
  }
}

