import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

export enum ActionType {
  POST = 10,
  REPLY = 20,
  UPLOAD = 50,
  QUESTION = 30, // New action
  DAILY_VISIT = 5,
}

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  async awardPoints(userId: string, actionType: ActionType) {
    const pointsToAdd = actionType.valueOf();
    
    // Get current user stats
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newPoints = user.points + pointsToAdd;
    // Simple Level Formula: 1 + (points / 100)
    // Sqrt curve is better for RPG feel but linear is predictable. Let's keep linear for MVP or stick to Sqrt as per prompt thought?
    // Prompt said: "Lvl = floor(sqrt(points/100)) + 1" in thoughts. Let's implement that for better scaling.
    // user logic was: "Simple Level Formula: 1 + (points / 100)" in previous code.
    // Let's Upgrade to Sqrt for "Business Logic" task requirements.
    // Formula: Level = floor( sqrt(points) / 10 ) + 1. 
    // Ex: 100pts -> sqrt(100)=10 -> 10/10=1 -> Lvl 2. 
    // Ex: 400pts -> sqrt(400)=20 -> 20/10=2 -> Lvl 3.
    // Ex: 2500pts -> 50/10=5 -> Lvl 6.
    
    const newLevel = Math.floor(Math.sqrt(newPoints) / 10) + 1;
    const didLevelUp = newLevel > user.level;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        level: newLevel,
      },
    });

    if (didLevelUp) {
      // Use NotificationsService instead of direct prisma call to be cleaner
      await this.notifications.createSystemNotification(
        userId,
        `🎉 Level Up! You reached Level ${newLevel}!`,
        `/users/${userId}/profile`
      );
    }
  }
}
