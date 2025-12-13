import { Test, TestingModule } from '@nestjs/testing';
import { LessonVideoController } from './lesson_video.controller';
import { LessonVideoService } from './lesson_video.service';

describe('LessonVideoController', () => {
  let controller: LessonVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonVideoController],
      providers: [LessonVideoService],
    }).compile();

    controller = module.get<LessonVideoController>(LessonVideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
