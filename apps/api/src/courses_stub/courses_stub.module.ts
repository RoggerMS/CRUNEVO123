import { Module } from '@nestjs/common';
import { CoursesStubController } from './courses_stub.controller';

@Module({
  controllers: [CoursesStubController]
})
export class CoursesStubModule {}
