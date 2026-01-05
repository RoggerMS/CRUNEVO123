import { Module } from '@nestjs/common';
import { AiStubController } from './ai_stub.controller';

@Module({
  controllers: [AiStubController]
})
export class AiStubModule {}
