import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('question.created', { async: true })
  async handleQuestionCreated(payload: { questionId: string }) {
    console.log(`[AiService] Brain active for Question: ${payload.questionId}`);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Find a bot/admin user to author the answer
    // For MVP, we'll pick the first ADMIN or create a specific AI user if we had seeding.
    // Let's grab any user with role ADMIN for now, or just the first user if no admin found (fallback).
    let aiUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!aiUser) {
        // Fallback to any user just to make it work in dev if no admin
        aiUser = await this.prisma.user.findFirst();
    }
    if (!aiUser) return; // No users at all?

    const question = await this.prisma.question.findUnique({ where: { id: payload.questionId } });
    if (!question) return;

    // AI Logic (Mock)
    const tags = Array.isArray(question.tags) && question.tags.length ? question.tags.join(', ') : 'general';
    const suggestion = `🤖 [AI Suggestion]: He analizado tu pregunta "${question.title}". Basado en los apuntes disponibles, te sugiero revisar los conceptos fundamentales de la materia. También podrías buscar documentos relacionados con los tags: ${tags}.`;

    await this.prisma.answer.create({
      data: {
        questionId: payload.questionId,
        authorId: aiUser.id,
        body: suggestion,
      },
    });
    console.log(`[AiService] AI Answer created for Question: ${payload.questionId}`);
  }

  @OnEvent('document.uploaded', { async: true })
  async handleDocumentUploaded(payload: { documentId: string }) {
    console.log(`[AiService] Brain active for Document: ${payload.documentId}`);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const doc = await this.prisma.document.findUnique({ where: { id: payload.documentId } });
    if (!doc) return;

    // AI Summary (Mock)
    const currentDesc = doc.description || '';
    const summary = `\n\n[Auto-Summary]: Documento académico sobre "${doc.title}". Contiene material relevante para el estudio de los temas mencionados en el título.`;

    await this.prisma.document.update({
      where: { id: payload.documentId },
      data: {
        description: currentDesc + summary,
      },
    });
    console.log(`[AiService] AI Summary added to Document: ${payload.documentId}`);
  }
}
