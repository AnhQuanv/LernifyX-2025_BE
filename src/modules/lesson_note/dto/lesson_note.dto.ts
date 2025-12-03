import { Expose } from 'class-transformer';

export class LessonNoteDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
