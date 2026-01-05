import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GamificationService, ActionType } from '../vitality/gamification.service';

@Injectable()
export class AnswersService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  async create(userId: string, questionId: string, createAnswerDto: CreateAnswerDto) {
    const answer = await this.prisma.answer.create({
      data: {
        body: createAnswerDto.body,
        questionId,
        authorId: userId,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    // Award points
    await this.gamification.awardPoints(userId, ActionType.REPLY);

    return answer;
  }
}
