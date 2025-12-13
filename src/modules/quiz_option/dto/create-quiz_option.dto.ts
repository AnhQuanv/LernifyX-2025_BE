import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuizOptionDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  text: string;
}
