import { Controller } from '@nestjs/common';
import { LessonVideoService } from './lesson_video.service';

@Controller('lesson-video')
export class LessonVideoController {
  constructor(private readonly lessonVideoService: LessonVideoService) {}
}
