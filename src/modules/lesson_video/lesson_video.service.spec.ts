import { Test, TestingModule } from '@nestjs/testing';
import { LessonVideoService } from './lesson_video.service';

describe('LessonVideoService', () => {
  let service: LessonVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonVideoService],
    }).compile();

    service = module.get<LessonVideoService>(LessonVideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
