import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../vitality/notifications.service';

type CommentTarget = 'post' | 'document' | 'question';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async add(userId: string, type: CommentTarget, targetId: string, body: string) {
    let data: any = { authorId: userId, body };
    if (type === 'post') data.postId = targetId;
    if (type === 'document') data.documentId = targetId;
    if (type === 'question') data.questionId = targetId;

    const comment = await this.prisma.comment.create({ data });

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
      await this.notifications.createNotification(ownerId, 'Nuevo comentario', 'COMMENT');
    }

    return comment;
  }

  async list(type: CommentTarget, targetId: string) {
    const where: any = {};
    if (type === 'post') where.postId = targetId;
    if (type === 'document') where.documentId = targetId;
    if (type === 'question') where.questionId = targetId;
    return this.prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, username: true } } },
    });
  }
}

