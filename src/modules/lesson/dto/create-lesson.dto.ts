import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  @IsNotEmpty()
  chapterId: string;

  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
