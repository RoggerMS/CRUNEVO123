import { Module, Global } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { NotificationsService } from './notifications.service';
import { DailyContentService } from './daily-content.service';
import { VitalityController } from './vitality.controller';
import { VitalityListener } from './vitality.listener';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  controllers: [VitalityController],
  providers: [GamificationService, NotificationsService, DailyContentService, PrismaService, VitalityListener],
  exports: [GamificationService, NotificationsService], // Export so other modules can use them
})
export class VitalityModule {}
