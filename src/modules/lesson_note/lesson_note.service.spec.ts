import { Test, TestingModule } from '@nestjs/testing';
import { LessonNoteService } from './lesson_note.service';

describe('LessonNoteService', () => {
  let service: LessonNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonNoteService],
    }).compile();

    service = module.get<LessonNoteService>(LessonNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
