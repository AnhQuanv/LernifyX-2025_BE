import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterDto } from './create-chapter.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateChapterDto extends PartialType(CreateChapterDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
