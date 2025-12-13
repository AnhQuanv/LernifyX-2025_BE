import { IsString } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsString()
  id: string;
}
