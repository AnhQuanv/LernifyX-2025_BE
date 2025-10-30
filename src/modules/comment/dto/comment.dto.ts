import { Expose, Transform } from 'class-transformer';
import { Comment } from '../entities/comment.entity';

export class CommentDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  rating: number;

  @Transform(({ obj }: { obj: Comment }) => obj.user?.fullName ?? null)
  @Expose()
  user: string;

  @Expose()
  createdAt: Date;
}
