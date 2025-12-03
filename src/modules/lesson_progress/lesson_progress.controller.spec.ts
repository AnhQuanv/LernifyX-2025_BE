import { Test, TestingModule } from '@nestjs/testing';
import { LessonProgressController } from './lesson_progress.controller';
import { LessonProgressService } from './lesson_progress.service';

describe('LessonProgressController', () => {
  let controller: LessonProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonProgressController],
      providers: [LessonProgressService],
    }).compile();

    controller = module.get<LessonProgressController>(LessonProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
