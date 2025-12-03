import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizQuestionDto } from './create-quiz_question.dto';

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {}
