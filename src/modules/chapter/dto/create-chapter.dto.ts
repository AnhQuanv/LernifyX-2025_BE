import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateChapterDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
