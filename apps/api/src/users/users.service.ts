import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async search(query: string) {
    if (!query) return [];
    return this.prisma.user.findMany({
      where: {
        username: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        username: true,
        email: true, // Maybe useful for confirmation
      },
      take: 10,
    });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        role: true,
        teacherVerified: true,
        points: true,
        level: true,
        createdAt: true,
        _count: {
          select: { followedBy: true, following: true }
        }
      }
    });

    if (!user) return null;

    const limit = 20;

    // Fetch user activity
    const [posts, docs, questions] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: id },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } } },
      }),
      this.prisma.document.findMany({
        where: { ownerId: id },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, username: true } } },
      }),
      this.prisma.question.findMany({
        where: { authorId: id },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } } },
      }),
    ]);

    // Map & Sort
    const feed = [
      ...posts.map(p => ({ type: 'POST', ...p })),
      ...docs.map(d => ({ type: 'DOCUMENT', ...d })),
      ...questions.map(q => ({ type: 'QUESTION', ...q })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);

    return { user, feed };
  }
}
