import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentsModule } from './documents/documents.module';
import { FeedModule } from './feed/feed.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { AiStubModule } from './ai_stub/ai_stub.module';
import { CoursesStubModule } from './courses_stub/courses_stub.module';
import { PostsModule } from './posts/posts.module';
import { ClubsModule } from './clubs/clubs.module';
import { StoreModule } from './store/store.module';
import { MessagesModule } from './messages/messages.module';
import { VitalityModule } from './vitality/vitality.module';
import { AiModule } from './ai/ai.module';
import { CommunityController } from './community/community.controller';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    EventEmitterModule.forRoot({ global: true }),
    AuthModule,
    UsersModule,
    PrismaModule,
    DocumentsModule,
    FeedModule,
    QuestionsModule,
    AnswersModule,
    ReportsModule,
    AdminModule,
    AiStubModule,
    CoursesStubModule,
    PostsModule,
    ClubsModule,
    StoreModule,
    MessagesModule,
    VitalityModule,
    AiModule,
    BookmarksModule,
    EventsModule,
    CommentsModule,
    LikesModule,
  ],
  controllers: [AppController, CommunityController],
  providers: [AppService],
})
export class AppModule {}
