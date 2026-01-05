import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GamificationService, ActionType } from './gamification.service';
import { DocumentCreatedEvent, QuestionCreatedEvent } from '../common/events/domain.events';
import { NotificationsService } from './notifications.service';

@Injectable()
export class VitalityListener {
  constructor(
    private readonly gamification: GamificationService,
    private readonly notifications: NotificationsService,
  ) {}

  @OnEvent('document.created')
  async handleDocumentCreated(event: DocumentCreatedEvent) {
    console.log(`[Event] Document created by ${event.userId}. Awarding points.`);
    await this.gamification.awardPoints(event.userId, ActionType.UPLOAD);
    // Could also create a "Feed" entry if we had a separate Feed table for activities
  }

  @OnEvent('question.created')
  async handleQuestionCreated(event: QuestionCreatedEvent) {
    console.log(`[Event] Question created by ${event.userId}. Awarding points.`);
    await this.gamification.awardPoints(event.userId, ActionType.QUESTION);
    // Notify followers? For now just points.
  }
}
