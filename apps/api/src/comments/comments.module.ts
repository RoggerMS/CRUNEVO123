import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VitalityModule } from '../vitality/vitality.module';

@Module({
  imports: [PrismaModule, VitalityModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

