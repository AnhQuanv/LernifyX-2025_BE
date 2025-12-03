import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLessonNoteDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
