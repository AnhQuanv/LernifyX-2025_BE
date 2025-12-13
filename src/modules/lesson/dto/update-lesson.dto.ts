import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
