import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from '../chapter/entities/chapter.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Lesson, LessonVideo])],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
