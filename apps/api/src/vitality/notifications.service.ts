import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    // Ensure ownership
    const notif = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif || notif.userId !== userId) return;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(userId: string, content: string, type: 'SYSTEM' | 'DAILY' | 'LIKE' | 'COMMENT' | 'FOLLOW', link?: string) {
    return this.prisma.notification.create({
        data: { userId, content, type, link }
    });
  }

  async createSystemNotification(userId: string, content: string, link?: string) {
      return this.createNotification(userId, content, 'SYSTEM', link);
  }
}
