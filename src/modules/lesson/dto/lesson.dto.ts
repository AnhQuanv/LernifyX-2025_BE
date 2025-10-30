import { Expose, Type } from 'class-transformer';
import { CommentDto } from '../../../modules/comment/dto/comment.dto';

export class LessonDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  duration: number;

  @Expose()
  videoUrl: string;

  @Type(() => CommentDto)
  @Expose()
  comments: CommentDto[];
}
