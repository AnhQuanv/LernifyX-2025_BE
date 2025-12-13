import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonVideoDto } from './create-lesson_video.dto';

export class UpdateLessonVideoDto extends PartialType(CreateLessonVideoDto) {}
