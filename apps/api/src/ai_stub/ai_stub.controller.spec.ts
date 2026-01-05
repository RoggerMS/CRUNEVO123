import { Test, TestingModule } from '@nestjs/testing';
import { AiStubController } from './ai_stub.controller';

describe('AiStubController', () => {
  let controller: AiStubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiStubController],
    }).compile();

    controller = module.get<AiStubController>(AiStubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
