import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizOptionDto } from './create-quiz_option.dto';

export class UpdateQuizOptionDto extends PartialType(CreateQuizOptionDto) {}
