import { Module } from '@nestjs/common';
import { LessonProgressService } from './lesson_progress.service';
import { LessonProgressController } from './lesson_progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgress } from './entities/lesson_progress.entity';
import { LessonNote } from '../lesson_note/entities/lesson_note.entity';
import { User } from '../user/entities/user.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonProgress, LessonNote, User, Lesson]),
  ],
  controllers: [LessonProgressController],
  providers: [LessonProgressService],
})
export class LessonProgressModule {}
