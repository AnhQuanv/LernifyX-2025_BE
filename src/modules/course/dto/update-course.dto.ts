import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  archiveReason?: string;

  @IsOptional()
  @IsString()
  submissionNote?: string;

  @IsOptional()
  @IsBoolean()
  isLive?: boolean;
}
