import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { VoteDto } from './dto/vote.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionCreatedEvent } from '../common/events/domain.events';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createQuestionDto: CreateQuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        ...createQuestionDto,
        authorId: userId,
        tags: createQuestionDto.tags || '',
        clubId: createQuestionDto.clubId || null,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    // Emit event (Decoupled)
    this.eventEmitter.emit('question.created', new QuestionCreatedEvent(question.id, userId));

    return question;
  }

  async findAll(query?: string, clubId?: string, sort?: 'newest' | 'top') {
    const where: any = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (clubId) {
      where.clubId = clubId;
    }

    const orderBy: any = { createdAt: 'desc' };
    if (sort === 'top') {
      // Basic sorting by votes isn't direct in Prisma findMany without raw query or aggregation
      // For MVP, we'll fetch and sort in memory or stick to createdAt.
      // Let's stick to createdAt for MVP simplicity or implement basic in-memory sort if needed.
    }

    const questions = await this.prisma.question.findMany({
      where,
      orderBy,
      include: {
        author: { select: { id: true, username: true } },
        votes: true,
        _count: { select: { answers: true } }
      },
    });

    // Calculate score
    return questions.map(q => ({
      ...q,
      score: q.votes.reduce((acc, v) => acc + v.value, 0)
    }));
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
        votes: true,
        answers: {
          include: { 
            author: { select: { id: true, username: true } },
            votes: true
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!question) throw new NotFoundException('Question not found');

    const questionScore = question.votes.reduce((acc, v) => acc + v.value, 0);
    const answersWithScore = question.answers.map(a => ({
      ...a,
      score: a.votes.reduce((acc, v) => acc + v.value, 0)
    }));

    return {
      ...question,
      score: questionScore,
      answers: answersWithScore
    };
  }

  async acceptAnswer(questionId: string, answerId: string, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    if (question.authorId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException('Only author or admin can accept answer');
      }
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: { acceptedAnswerId: answerId },
    });
  }

  async vote(userId: string, voteDto: VoteDto) {
    const { targetType, targetId, value } = voteDto;
    
    // Check if target exists
    if (targetType === 'QUESTION') {
      const q = await this.prisma.question.findUnique({ where: { id: targetId } });
      if (!q) throw new NotFoundException('Question not found');
      
      return this.prisma.vote.upsert({
        where: { authorId_questionId: { authorId: userId, questionId: targetId } },
        update: { value },
        create: { authorId: userId, questionId: targetId, value },
      });
    } else {
      const a = await this.prisma.answer.findUnique({ where: { id: targetId } });
      if (!a) throw new NotFoundException('Answer not found');

      return this.prisma.vote.upsert({
        where: { authorId_answerId: { authorId: userId, answerId: targetId } },
        update: { value },
        create: { authorId: userId, answerId: targetId, value },
      });
    }
  }
}
