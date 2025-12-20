import { forwardRef, Module } from '@nestjs/common';
import { LessonVideoService } from './lesson_video.service';
import { LessonVideoController } from './lesson_video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonVideo } from './entities/lesson_video.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MuxModule } from '../mux/mux.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonVideo, Lesson]),
    forwardRef(() => CloudinaryModule),
    forwardRef(() => MuxModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [LessonVideoController],
  providers: [LessonVideoService],
  exports: [LessonVideoService, forwardRef(() => LessonModule)],
})
export class LessonVideoModule {}
