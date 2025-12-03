import { IsArray, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserPreferenceDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  mainCategoryIds: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  desiredLevels?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  learningGoals?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  interestedSkills?: string[];
}
