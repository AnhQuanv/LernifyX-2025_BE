import { Module } from '@nestjs/common';
import { LessonNoteService } from './lesson_note.service';
import { LessonNoteController } from './lesson_note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonNote } from './entities/lesson_note.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonNote, LessonProgress])],
  controllers: [LessonNoteController],
  providers: [LessonNoteService],
})
export class LessonNoteModule {}
