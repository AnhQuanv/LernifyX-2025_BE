import { Expose, Transform, Type } from 'class-transformer';
import { CommentDto } from '../../../modules/comment/dto/comment.dto';
import { LessonProgressDto } from 'src/modules/lesson_progress/dto/lesson_progress.dto';

export class LessonDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  duration: number;

  @Expose()
  content: string;

  @Expose()
  order: number;

  @Type(() => LessonProgressDto)
  @Expose()
  progress: LessonProgressDto | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { quizQuestions?: any[] } }) =>
      !!obj.quizQuestions?.length,
  )
  hasQuiz: boolean;

  @Expose()
  @Transform(({ obj }: { obj: { videoAsset?: any } }) => !!obj.videoAsset)
  canViewVideo: boolean;
}

export class LessonDetailDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  duration: number;

  @Expose()
  order: number;

  @Expose()
  videoUrl: string;

  @Type(() => CommentDto)
  @Expose()
  comments: CommentDto[];

  @Type(() => LessonProgressDto)
  @Expose()
  progress: LessonProgressDto | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { quizQuestions?: any[] } }) =>
      !!obj.quizQuestions?.length,
  )
  hasQuiz: boolean;
}
