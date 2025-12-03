import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  ValidateIf,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsNotEmpty()
  @IsEnum(['lesson', 'course'])
  type: 'lesson' | 'course';

  @IsOptional()
  @IsUUID()
  targetId?: string;

  @ValidateIf((o: CreateCommentDto) => o.type === 'course')
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
