import { Expose, Transform, Type } from 'class-transformer';
import { Course } from '../entities/course.entity';
import { ChapterDto } from '../../../modules/chapter/dto/chapter.dto';
import { CommentDto } from '../../../modules/comment/dto/comment.dto';

export class CourseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  level: string;

  @Expose()
  duration: number;
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @Expose()
  price: number;
  @Transform(({ value }: { value?: string | null }) =>
    value ? parseFloat(value) : null,
  )
  @Expose()
  originalPrice: number | null;
  @Transform(({ value }: { value?: string | number | null }) =>
    value ? parseFloat(String(value)) : 0,
  )
  @Expose()
  rating: number;
  @Expose()
  students: number;

  @Transform(({ value }: { value?: string | null }) =>
    value ? parseFloat(value) : null,
  )
  @Expose()
  discount: number | null;

  @Expose()
  discountExpiresAt: Date | null;

  @Transform(({ obj }: { obj: Course }) => obj.category?.categoryName ?? null)
  @Expose()
  category: string;

  @Transform(({ obj }: { obj: Course }) => obj.instructor?.fullName ?? null)
  @Expose()
  instructor: string;

  @Expose()
  image: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class CourseDetailDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() description: string;
  @Expose() level: string;
  @Expose() duration: number;

  @Transform(({ value }: { value: string }) => parseFloat(value))
  @Expose()
  price: number;

  @Transform(({ value }: { value?: string | null }) =>
    value ? parseFloat(value) : null,
  )
  @Expose()
  originalPrice: number | null;

  @Transform(({ value }: { value?: string | number | null }) =>
    value ? parseFloat(String(value)) : 0,
  )
  @Expose()
  rating: number;

  @Expose() students: number;
  @Transform(({ value }: { value?: string | null }) =>
    value ? parseFloat(value) : null,
  )
  @Expose()
  discount: number | null;
  @Expose() discountExpiresAt: Date | null;

  @Transform(({ obj }: { obj: Course }) => obj.category?.categoryName ?? null)
  @Expose()
  category: string;

  @Transform(({ obj }: { obj: Course }) => obj.instructor?.fullName ?? null)
  @Expose()
  instructor: string;

  @Expose() image: string;

  @Expose() learnings: string[];
  @Expose() requirements: string[];

  @Type(() => ChapterDto)
  @Expose()
  chapters: ChapterDto[];

  @Type(() => CommentDto)
  @Expose()
  comments: CommentDto[];

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
