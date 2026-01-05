import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GamificationService, ActionType } from '../vitality/gamification.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto, file?: Express.Multer.File) {
    const post = await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        imageUrl: file ? file.filename : (createPostDto.imageUrl || null),
        authorId: userId,
        clubId: createPostDto.clubId || null,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    // Award points
    await this.gamification.awardPoints(userId, ActionType.POST);

    return post;
  }

  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, username: true } } },
    });
  }
}
