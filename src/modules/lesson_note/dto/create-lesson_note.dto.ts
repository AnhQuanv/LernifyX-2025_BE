import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLessonNoteDto {
  @IsString()
  @IsNotEmpty()
  progressId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  @IsNumber()
  videoTimestamp: number;
}
