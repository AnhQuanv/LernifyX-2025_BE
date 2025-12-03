import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonNoteDto {
  @IsString()
  @IsNotEmpty()
  progressId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
