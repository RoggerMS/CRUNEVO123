import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { VoteDto } from './dto/vote.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionCreatedEvent } from '../common/events/domain.events';
import { NotificationsService } from '../vitality/notifications.service';

@Injectable()
export class QuestionsService {
  private readonly bannedWords = ['idiota', 'tonto', 'estúpido', 'estupido', 'imbecil', 'imbécil'];
  private readonly questionRateLimit = new Map<string, number[]>();

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private notifications: NotificationsService,
  ) {}

  private normalizeTags(tags?: string[]) {
    if (!tags || !Array.isArray(tags)) return [];
    const unique = new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 1),
    );
    return Array.from(unique).slice(0, 8);
  }

  private sanitizeAttachments(attachments?: string[]) {
    if (!attachments) return [];
    return attachments
      .map((att) => att.trim())
      .filter((att) => /^https?:\/\//i.test(att))
      .slice(0, 5);
  }

  private enforceRateLimit(userId: string, bucket: Map<string, number[]>, limit = 4, windowMs = 60_000) {
    const now = Date.now();
    const entries = (bucket.get(userId) || []).filter((ts) => now - ts < windowMs);
    if (entries.length >= limit) {
      throw new BadRequestException('Has alcanzado el límite de publicaciones por minuto');
    }
    entries.push(now);
    bucket.set(userId, entries);
  }

  private detectSpamOrAbuse(...texts: string[]) {
    const combined = texts.join(' ').trim();
    const normalized = combined.toLowerCase();

    if (this.bannedWords.some((word) => normalized.includes(word))) {
      throw new BadRequestException('Detectamos lenguaje inapropiado, por favor ajusta tu contenido.');
    }

    const uppercaseChars = combined.replace(/[^A-Z]/g, '');
    const letters = combined.replace(/[^A-Za-z]/g, '');
    if (letters.length > 0 && uppercaseChars.length / letters.length > 0.6) {
      throw new BadRequestException('Por favor evita escribir todo en mayúsculas.');
    }

    const suspiciousLinks = /(https?:\/\/|www\.)\S+/gi;
    if ((combined.match(suspiciousLinks) || []).length > 2) {
      throw new BadRequestException('Detectamos muchos enlaces sospechosos. Ajusta la pregunta.');
    }
  }

  async create(userId: string, createQuestionDto: CreateQuestionDto) {
    this.enforceRateLimit(userId, this.questionRateLimit);
    this.detectSpamOrAbuse(createQuestionDto.title, createQuestionDto.body);

    const tags = this.normalizeTags(createQuestionDto.tags);
    const attachments = this.sanitizeAttachments(createQuestionDto.attachments);
    const subject = createQuestionDto.subject?.trim() || null;

    const question = await this.prisma.question.create({
      data: {
        title: createQuestionDto.title.trim(),
        body: createQuestionDto.body.trim(),
        subject,
        tags,
        attachments,
        authorId: userId,
        clubId: createQuestionDto.clubId || null,
        lastActivityAt: new Date(),
      },
      include: { author: { select: { id: true, username: true } } },
    });

    this.eventEmitter.emit('question.created', new QuestionCreatedEvent(question.id, userId));

    return { ...question, score: 0, answersCount: 0, views: question.viewCount };
  }

  async findAll(params: {
    query?: string;
    clubId?: string;
    tab?: 'recent' | 'unanswered' | 'popular';
    subject?: string;
    tags?: string[];
    dateFrom?: string;
    authorId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      query,
      clubId,
      tab = 'recent',
      subject,
      tags = [],
      dateFrom,
      authorId,
      page = 1,
      pageSize = 20,
    } = params;

    const where: Prisma.QuestionWhereInput = {
      status: ContentStatus.ACTIVE,
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ];
    }
    if (clubId) where.clubId = clubId;
    if (subject) where.subject = { equals: subject, mode: 'insensitive' };

    const normalizedTags = this.normalizeTags(tags);
    if (normalizedTags.length) where.tags = { hasSome: normalizedTags };

    if (authorId) where.authorId = authorId;
    if (dateFrom) {
      const parsed = new Date(dateFrom);
      if (!isNaN(parsed.getTime())) {
        where.createdAt = { gte: parsed };
      }
    }

    if (tab === 'unanswered') {
      where.answers = {
        none: { status: ContentStatus.ACTIVE },
      };
    }

    let orderBy: Prisma.QuestionOrderByWithRelationInput = { createdAt: 'desc' };
    if (tab === 'popular') {
      orderBy = { lastActivityAt: 'desc' };
    }

    const take = Math.min(pageSize, 50);
    const skip = Math.max(page - 1, 0) * take;

    const questions = await this.prisma.question.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: { select: { id: true, username: true, role: true } },
        votes: true,
        answers: {
          where: { status: ContentStatus.ACTIVE },
          select: { id: true },
        },
        _count: { select: { answers: true } },
      },
    });

    const enhanced = questions.map((q) => {
      const score = q.votes.reduce((acc, v) => acc + v.value, 0);
      const answerCount = q.answers.length;
      const popularityScore = answerCount * 3 + q.viewCount * 0.3 + score * 2;
      return {
        ...q,
        score,
        answerCount,
        popularityScore,
      };
    });

    if (tab === 'popular') {
      enhanced.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return enhanced;
  }

  async findOne(id: string, answerSort: 'recent' | 'helpful' = 'helpful') {
    const question = await this.prisma.question.findFirst({
      where: { id, status: ContentStatus.ACTIVE },
      include: {
        author: { select: { id: true, username: true } },
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, username: true } } },
        },
        answers: {
          where: { status: ContentStatus.ACTIVE },
          include: {
            author: { select: { id: true, username: true } },
            votes: true,
            comments: {
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { id: true, username: true } } },
            },
          },
        },
      },
    });

    if (!question) throw new NotFoundException('Question not found');

    await this.prisma.question.update({
      where: { id },
      data: { viewCount: { increment: 1 }, lastActivityAt: new Date() },
    });

    const questionScore = question.votes.reduce((acc, v) => acc + v.value, 0);
    const answersWithScore = question.answers
      .map((a) => ({
        ...a,
        score: a.votes.reduce((acc, v) => acc + v.value, 0),
      }))
      .sort((a, b) => {
        if (answerSort === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.score - a.score;
      });

    if (question.acceptedAnswerId) {
      const acceptedIndex = answersWithScore.findIndex((a) => a.id === question.acceptedAnswerId);
      if (acceptedIndex > 0) {
        const [accepted] = answersWithScore.splice(acceptedIndex, 1);
        answersWithScore.unshift(accepted);
      }
    }

    return {
      ...question,
      viewCount: question.viewCount + 1,
      score: questionScore,
      answers: answersWithScore,
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

    const answer = await this.prisma.answer.findFirst({ where: { id: answerId, status: ContentStatus.ACTIVE } });
    if (!answer) throw new NotFoundException('Answer not found or hidden');

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { acceptedAnswerId: answerId, lastActivityAt: new Date() },
    });

    if (answer.authorId !== question.authorId) {
      await this.notifications.createNotification(
        answer.authorId,
        'Tu respuesta fue aceptada',
        'SYSTEM',
        `/aula/${questionId}`,
      );
    }

    return updated;
  }

  async vote(userId: string, voteDto: VoteDto) {
    const { targetType, targetId, value } = voteDto;

    if (targetType === 'QUESTION') {
      const q = await this.prisma.question.findFirst({
        where: { id: targetId, status: ContentStatus.ACTIVE },
      });
      if (!q) throw new NotFoundException('Question not found');

      const vote = await this.prisma.vote.upsert({
        where: { authorId_questionId: { authorId: userId, questionId: targetId } },
        update: { value },
        create: { authorId: userId, questionId: targetId, value },
      });

      await this.prisma.question.update({
        where: { id: targetId },
        data: { lastActivityAt: new Date() },
      });
      return vote;
    } else {
      const a = await this.prisma.answer.findFirst({
        where: { id: targetId, status: ContentStatus.ACTIVE },
      });
      if (!a) throw new NotFoundException('Answer not found');

      const vote = await this.prisma.vote.upsert({
        where: { authorId_answerId: { authorId: userId, answerId: targetId } },
        update: { value },
        create: { authorId: userId, answerId: targetId, value },
      });

      await this.prisma.question.update({
        where: { id: a.questionId },
        data: { lastActivityAt: new Date() },
      });
      return vote;
    }
  }

  async getPopularTags(search?: string) {
    const questions = await this.prisma.question.findMany({
      where: { status: ContentStatus.ACTIVE },
      select: { tags: true },
    });

    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      q.tags.forEach((tag) => {
        if (search && !tag.includes(search.toLowerCase())) return;
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));
  }

  async suggestSimilar(term: string) {
    if (!term || term.trim().length < 3) return [];
    const q = term.trim();

    const suggestions = await this.prisma.question.findMany({
      where: {
        status: ContentStatus.ACTIVE,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, subject: true, tags: true, createdAt: true },
    });

    return suggestions;
  }

  async listByUser(userId: string) {
    return this.prisma.question.findMany({
      where: { authorId: userId, status: ContentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { answers: true } },
        author: { select: { id: true, username: true } },
      },
    });
  }

  async updateStatus(id: string, status: ContentStatus) {
    return this.prisma.question.update({
      where: { id },
      data: { status, lastActivityAt: new Date() },
    });
  }

  async getSubjects() {
    const subjects = await this.prisma.question.findMany({
      where: { subject: { not: null }, status: ContentStatus.ACTIVE },
      select: { subject: true },
      distinct: ['subject'],
    });
    return subjects.map((s) => s.subject).filter(Boolean);
  }
}
