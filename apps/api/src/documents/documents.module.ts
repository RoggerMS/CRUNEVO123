import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController, ApuntesController } from './documents.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DocumentsController, ApuntesController],
  providers: [DocumentsService, PrismaService],
})
export class DocumentsModule {}
