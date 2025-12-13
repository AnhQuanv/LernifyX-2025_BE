import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateQuizQuestionDto } from './create-quiz_question.dto';

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  lessonId: string;
}
