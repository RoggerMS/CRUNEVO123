import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyContentService {
  constructor(private prisma: PrismaService) {}

  async triggerDailyQuestion(adminUserId: string) {
    // In real app, this would pick from a predefined list or AI generation.
    // For MVP, we use a random hardcoded question.
    const questions = [
        "¿Cuál es tu método de estudio favorito?",
        "¿Qué tecnología crees que cambiará el mundo en 5 años?",
        "¿Libro físico o digital? Debate.",
        "¿Cuál fue el mayor desafío académico que superaste?",
        "¿Qué consejo le darías a tu 'yo' de primer año?"
    ];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];

    // Create Question in Aula
    const question = await this.prisma.question.create({
      data: {
        title: "📢 Pregunta del Día",
        body: randomQ,
        tags: "daily,community",
        authorId: adminUserId,
      },
    });

    // Notify ALL users (This is heavy for large scale, but fine for MVP)
    // Optimization: Use a job queue or notify active users only.
    const allUsers = await this.prisma.user.findMany({ select: { id: true } });
    
    // Batch create notifications? Prisma supports createMany
    await this.prisma.notification.createMany({
        data: allUsers.map(u => ({
            userId: u.id,
            type: 'DAILY',
            content: `📢 Pregunta del Día: ${randomQ}`,
            link: `/aula/${question.id}`
        }))
    });

    return { message: "Daily question triggered", questionId: question.id };
  }
}
