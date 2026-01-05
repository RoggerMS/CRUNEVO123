import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VitalityModule } from '../vitality/vitality.module';

@Module({
  imports: [PrismaModule, VitalityModule],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}

