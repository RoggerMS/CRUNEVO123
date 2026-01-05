import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';
// VitalityModule is Global, so we don't strictly need to import it if it's Global, 
// but we need to inject GamificationService.
// If VitalityModule is @Global(), we can just use the provider.

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule {}
