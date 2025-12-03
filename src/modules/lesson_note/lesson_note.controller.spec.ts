import { Test, TestingModule } from '@nestjs/testing';
import { LessonNoteController } from './lesson_note.controller';
import { LessonNoteService } from './lesson_note.service';

describe('LessonNoteController', () => {
  let controller: LessonNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonNoteController],
      providers: [LessonNoteService],
    }).compile();

    controller = module.get<LessonNoteController>(LessonNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
