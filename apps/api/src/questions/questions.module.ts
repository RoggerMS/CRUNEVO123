import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController, AulaController } from './questions.controller';
import { AnswersModule } from '../answers/answers.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AnswersModule],
  controllers: [QuestionsController, AulaController],
  providers: [QuestionsService, PrismaService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
