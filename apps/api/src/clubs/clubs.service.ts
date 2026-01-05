import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ClubRole } from '@prisma/client';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createClubDto: CreateClubDto) {
    // Transaction: Create club AND add owner as member
    return this.prisma.$transaction(async (prisma) => {
      const club = await prisma.club.create({
        data: {
          ...createClubDto,
          ownerId: userId,
        },
      });

      await prisma.clubMember.create({
        data: {
          clubId: club.id,
          userId: userId,
          role: ClubRole.OWNER,
        },
      });

      return club;
    });
  }

  async findUserClubs(userId: string) {
    // Get clubs where user is member or owner
    const memberships = await this.prisma.clubMember.findMany({
        where: { userId },
        include: { club: { include: { _count: { select: { members: true } }, owner: { select: { id: true } } } } }
    });
    return memberships.map(m => m.club);
  }

  async findAll() {
    return this.prisma.club.findMany({
      where: { isPublic: true },
      include: {
        _count: { select: { members: true } },
      },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        owner: { select: { id: true, username: true } },
      },
    });
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async join(clubId: string, userId: string) {
    // Check if exists
    await this.findOne(clubId);
    
    // Check if already member
    const existing = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (existing) return existing;

    return this.prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role: ClubRole.MEMBER,
      },
    });
  }

  async leave(clubId: string, userId: string) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) throw new NotFoundException('Not a member');
    if (membership.role === ClubRole.OWNER) throw new ForbiddenException('Owner cannot leave club yet');

    return this.prisma.clubMember.delete({
      where: { clubId_userId: { clubId, userId } },
    });
  }

  async update(clubId: string, userId: string, data: UpdateClubDto) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Only owners can edit clubs');

    return this.prisma.club.update({
      where: { id: clubId },
      data,
      include: {
        _count: { select: { members: true } },
        owner: { select: { id: true, username: true } },
      },
    });
  }

  async getClubFeed(clubId: string) {
    const limit = 20;
    const [posts, docs, questions] = await Promise.all([
      this.prisma.post.findMany({
        where: { clubId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } } },
      }),
      this.prisma.document.findMany({
        where: { clubId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, username: true } } },
      }),
      this.prisma.question.findMany({
        where: { clubId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } } },
      }),
    ]);

    const feed = [
      ...posts.map(p => ({ type: 'POST', ...p })),
      ...docs.map(d => ({ type: 'DOCUMENT', ...d })),
      ...questions.map(q => ({ type: 'QUESTION', ...q })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);

    return feed;
  }
}
