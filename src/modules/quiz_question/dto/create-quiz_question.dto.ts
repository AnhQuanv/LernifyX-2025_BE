import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizOptionDto } from 'src/modules/quiz_option/dto/create-quiz_option.dto';

export class CreateQuizQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsOptional()
  @IsString()
  question: string;

  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  @ArrayMinSize(2)
  options: CreateQuizOptionDto[];

  @IsOptional()
  @IsString()
  correctOptionId: string;

  @IsOptional()
  @IsInt()
  order: number;
}
