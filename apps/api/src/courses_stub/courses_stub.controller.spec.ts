import { Test, TestingModule } from '@nestjs/testing';
import { CoursesStubController } from './courses_stub.controller';

describe('CoursesStubController', () => {
  let controller: CoursesStubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesStubController],
    }).compile();

    controller = module.get<CoursesStubController>(CoursesStubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
