import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GamificationService, ActionType } from '../vitality/gamification.service';
import { ContentStatus } from '@prisma/client';
import { NotificationsService } from '../vitality/notifications.service';

@Injectable()
export class AnswersService {
  private readonly answerRateLimit = new Map<string, number[]>();

  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
    private notifications: NotificationsService,
  ) {}

  private enforceRateLimit(userId: string, limit = 8, windowMs = 60_000) {
    const now = Date.now();
    const entries = (this.answerRateLimit.get(userId) || []).filter((ts) => now - ts < windowMs);
    if (entries.length >= limit) {
      throw new BadRequestException('Estás respondiendo demasiado rápido, intenta en un minuto.');
    }
    entries.push(now);
    this.answerRateLimit.set(userId, entries);
  }

  private sanitizeAttachments(attachments?: string[]) {
    if (!attachments) return [];
    return attachments
      .map((att) => att.trim())
      .filter((att) => /^https?:\/\//i.test(att))
      .slice(0, 3);
  }

  private detectSpam(text: string) {
    const normalized = text.toLowerCase();
    const banned = ['idiota', 'tonto', 'estúpido', 'estupido', 'imbecil', 'imbécil'];
    if (banned.some((w) => normalized.includes(w))) {
      throw new BadRequestException('Detectamos lenguaje inapropiado, por favor ajusta tu respuesta.');
    }

    if (/(https?:\/\/|www\.)\S+/gi.test(text) && text.length < 40) {
      throw new BadRequestException('La respuesta parece spam (solo enlaces). Agrega más contexto.');
    }
  }

  async create(userId: string, questionId: string, createAnswerDto: CreateAnswerDto) {
    this.enforceRateLimit(userId);
    this.detectSpam(createAnswerDto.body);

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, status: ContentStatus.ACTIVE },
    });
    if (!question) throw new NotFoundException('Question not found');

    const attachments = this.sanitizeAttachments(createAnswerDto.attachments);

    const answer = await this.prisma.answer.create({
      data: {
        body: createAnswerDto.body.trim(),
        questionId,
        authorId: userId,
        attachments,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    await this.gamification.awardPoints(userId, ActionType.REPLY);
    await this.prisma.question.update({
      where: { id: questionId },
      data: { lastActivityAt: new Date() },
    });

    if (question.authorId !== userId) {
      await this.notifications.createNotification(
        question.authorId,
        'Tienes una nueva respuesta',
        'COMMENT',
        `/aula/${questionId}`,
      );
    }

    return answer;
  }

  async listByUser(userId: string) {
    return this.prisma.answer.findMany({
      where: { authorId: userId, status: ContentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: {
        question: { select: { id: true, title: true } },
        votes: true,
      },
    });
  }

  async updateStatus(id: string, status: ContentStatus) {
    return this.prisma.answer.update({
      where: { id },
      data: { status },
    });
  }
}
