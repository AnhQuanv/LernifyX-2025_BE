import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumberString,
  IsEnum,
  IsDateString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateChapterDto } from 'src/modules/chapter/dto/create-chapter.dto';

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learnings?: string[];

  @IsOptional()
  @IsString()
  category?: string; // categoryId

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumberString()
  originalPrice?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsBoolean()
  hasDiscount?: boolean;

  @IsOptional()
  @IsDateString()
  discountExpiresAt?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(['draft', 'pending', 'published', 'rejected'])
  status?: 'draft' | 'pending' | 'published' | 'rejected';
}

export class CreateChapterAndLessonAndQuizDto {
  @IsUUID()
  courseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChapterDto)
  chapters: CreateChapterDto[];
}
