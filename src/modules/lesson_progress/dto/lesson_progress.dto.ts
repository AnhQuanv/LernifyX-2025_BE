import { Expose, Type } from 'class-transformer';
import { LessonNoteDto } from '../../../modules/lesson_note/dto/lesson_note.dto';

export class LessonProgressDto {
  @Expose()
  id: string;

  @Expose()
  completed: boolean;

  @Expose()
  lastPosition: number;

  @Expose()
  @Type(() => LessonNoteDto)
  notes: LessonNoteDto[];

  @Expose()
  updatedAt: Date;
}
