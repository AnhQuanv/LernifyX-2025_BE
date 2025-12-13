import { Expose, Transform, Type } from 'class-transformer';
import { Course } from '../entities/course.entity';
import { ChapterDto } from '../../../modules/chapter/dto/chapter.dto';

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
  revenue: number | null;

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
  ratingCount: string;

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
  @Expose() status: string;
  @Expose() revenue: string;

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
  ratingCount: number;

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
  @Expose()
  isPurchased: boolean = false;

  @Expose() learnings: string[];
  @Expose() requirements: string[];

  @Type(() => ChapterDto)
  @Expose()
  chapters: ChapterDto[];

  // @Type(() => CommentDto)
  // @Expose()
  // comments: CommentDto[];

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}

export class CreateCourseResponseDto {
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
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export interface CourseStatusCountRaw {
  status: Course['status'];
  count: string;
}
