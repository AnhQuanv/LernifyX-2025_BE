import { Expose, Type } from 'class-transformer';
import { LessonDto } from '../../../modules/lesson/dto/lesson.dto';

export class ChapterDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  order: number;

  @Type(() => LessonDto)
  @Expose()
  lessons: LessonDto[];
}
