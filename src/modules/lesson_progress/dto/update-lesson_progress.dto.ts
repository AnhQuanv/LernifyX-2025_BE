import { IsBoolean, IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsUUID()
  progressId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsInt()
  lastPosition?: number;
}
