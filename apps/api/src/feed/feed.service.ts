import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeed() {
    const limit = 20;

    // Fetch parallel
    const [posts, docs, questions] = await Promise.all([
      this.prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.document.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, username: true } },
          _count: { select: { comments: true, likes: true, bookmarks: true } },
        },
      }),
      this.prisma.question.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true } },
          _count: { select: { comments: true, likes: true, answers: true, votes: true } },
        },
      }),
    ]);

    // Map to Feed Items
    const feedItems = [
      ...posts.map(p => ({ type: 'POST', ...p })),
      ...docs.map(d => ({ type: 'DOCUMENT', ...d })),
      ...questions.map(q => ({ type: 'QUESTION', ...q })),
    ];

    // Sort and limit
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return feedItems.slice(0, limit);
  }
}
