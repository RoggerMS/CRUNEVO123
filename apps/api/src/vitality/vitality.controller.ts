import { Controller, Post, Get, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DailyContentService } from './daily-content.service';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service'; // To check admin role

@ApiTags('vitality')
@Controller('vitality')
export class VitalityController {
  constructor(
    private readonly dailyContentService: DailyContentService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Daily Content ---
  @Post('daily/trigger')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async triggerDaily(@Request() req: any) {
    // Check Admin
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Admin only');

    return this.dailyContentService.triggerDailyQuestion(req.user.userId);
  }

  // --- Notifications ---
  @Get('notifications')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getNotifications(@Request() req: any) {
    return this.notificationsService.getNotifications(req.user.userId);
  }

  @Patch('notifications/read-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Patch('notifications/:id/read')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }
}
