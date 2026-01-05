import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async toggleBookmark(userId: string, type: 'DOCUMENT' | 'QUESTION', itemId: string) {
    const whereClause: any = { userId };
    if (type === 'DOCUMENT') whereClause.documentId = itemId;
    else if (type === 'QUESTION') whereClause.questionId = itemId;
    else throw new BadRequestException('Invalid bookmark type');

    const existing = await this.prisma.bookmark.findFirst({ where: whereClause });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    } else {
      await this.prisma.bookmark.create({
        data: {
            userId,
            documentId: type === 'DOCUMENT' ? itemId : undefined,
            questionId: type === 'QUESTION' ? itemId : undefined,
        }
      });
      return { bookmarked: true };
    }
  }

  async getMyBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        document: { include: { owner: { select: { username: true } } } },
        question: { include: { author: { select: { username: true } } } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
