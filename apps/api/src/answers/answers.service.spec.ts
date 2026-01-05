import { Test, TestingModule } from '@nestjs/testing';
import { AnswersService } from './answers.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../vitality/gamification.service';
import { NotificationsService } from '../vitality/notifications.service';

describe('AnswersService', () => {
  let service: AnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        { provide: PrismaService, useValue: {} },
        { provide: GamificationService, useValue: { awardPoints: jest.fn() } },
        { provide: NotificationsService, useValue: { createNotification: jest.fn() } },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
