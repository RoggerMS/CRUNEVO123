import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        teacherVerified: true,
        points: true,
        level: true,
        createdAt: true,
      }
    });
  }

  async toggleBan(userId: string, isBanned: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned },
    });
  }

  async updateUserStats(userId: string, points: number, level: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { points, level },
    });
  }

  verifyTeacher(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { teacherVerified: true },
    });
  }

  changeRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  getReports() {
    return this.prisma.report.findMany({
      include: { reporter: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Content Moderation
  async getContent(type: string, page = 1, limit = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const orderBy = { createdAt: 'desc' as const };
    
    // Status Filter
    const whereStatus = status && status !== 'all' ? { status: status.toUpperCase() as any } : {};
    
    // Search Filter
    const createSearch = (fields: string[]) => {
        if (!search) return {};
        return {
            OR: fields.map(f => ({ [f]: { contains: search, mode: 'insensitive' } }))
        };
    };

    const commonOptions = {
        take: limit,
        skip,
        orderBy,
    };

    switch (type.toLowerCase()) {
        case 'post':
        case 'posts':
            const postWhere = { ...whereStatus, ...createSearch(['content']) };
            const [postItems, postCount] = await Promise.all([
                this.prisma.post.findMany({ 
                    where: postWhere,
                    ...commonOptions, 
                    include: { 
                        author: { select: { id: true, username: true, email: true } },
                        _count: { select: { likes: true, comments: true } }
                    } 
                }),
                this.prisma.post.count({ where: postWhere })
            ]);
            return { items: postItems, total: postCount };

        case 'document':
        case 'documents':
            const docWhere = { ...whereStatus, ...createSearch(['title', 'description']) };
            const [docItems, docCount] = await Promise.all([
                this.prisma.document.findMany({ 
                    where: docWhere,
                    ...commonOptions, 
                    include: { 
                        owner: { select: { id: true, username: true, email: true } },
                        _count: { select: { likes: true, comments: true } }
                    } 
                }),
                this.prisma.document.count({ where: docWhere })
            ]);
            return { items: docItems, total: docCount };

        case 'question':
        case 'questions':
            const qWhere = { ...whereStatus, ...createSearch(['title', 'body']) };
            const [qItems, qCount] = await Promise.all([
                this.prisma.question.findMany({ 
                    where: qWhere,
                    ...commonOptions, 
                    include: { 
                        author: { select: { id: true, username: true, email: true } },
                        _count: { select: { likes: true, comments: true, answers: true } }
                    } 
                }),
                this.prisma.question.count({ where: qWhere })
            ]);
            return { items: qItems, total: qCount };
            
        default:
            return { items: [], total: 0 };
    }
  }

  async updateContentStatus(type: string, id: string, status: string) {
    const validStatus = ['ACTIVE', 'HIDDEN', 'DELETED'].includes(status.toUpperCase()) 
        ? status.toUpperCase() 
        : 'ACTIVE';

    switch (type.toLowerCase()) {
      case 'post':
      case 'posts':
        return this.prisma.post.update({ where: { id }, data: { status: validStatus as any } });
      case 'document':
      case 'documents':
        return this.prisma.document.update({ where: { id }, data: { status: validStatus as any } });
      case 'question':
      case 'questions':
        return this.prisma.question.update({ where: { id }, data: { status: validStatus as any } });
      default:
        throw new Error('Unknown content type or status update not supported');
    }
  }

  async deleteContent(type: string, id: string) {
    // Hard delete or Soft delete? For now keep Hard Delete as requested in legacy, 
    // but prefer updateContentStatus for moderation.
    // Keeping this for backward compatibility if needed, but UI should prefer Status Update.
    switch (type.toLowerCase()) {
      case 'post':
      case 'posts':
        return this.prisma.post.delete({ where: { id } });
      case 'document':
      case 'documents':
        return this.prisma.document.delete({ where: { id } });
      case 'question':
      case 'questions':
        return this.prisma.question.delete({ where: { id } });
      case 'club':
      case 'clubs':
        return this.prisma.club.delete({ where: { id } });
      case 'event':
      case 'events':
        return this.prisma.event.delete({ where: { id } });
      case 'product':
      case 'products':
        return this.prisma.product.delete({ where: { id } });
      default:
        throw new Error('Unknown content type');
    }
  }
}
