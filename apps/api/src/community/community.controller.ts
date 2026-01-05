import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('community')
export class CommunityController {
  constructor(private prisma: PrismaService) {}

  @Get('explore')
  async explore() {
    const [popularClubs, topDocs, recentQuestions] = await Promise.all([
      this.prisma.club.findMany({
        take: 3,
        include: { _count: { select: { members: true } } },
        orderBy: { members: { _count: 'desc' } }
      }),
      this.prisma.document.findMany({
        take: 3,
        orderBy: { downloadsCount: 'desc' },
        include: { owner: { select: { username: true } } }
      }),
      this.prisma.question.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true } } }
      })
    ]);

    return { popularClubs, topDocs, recentQuestions };
  }
}
