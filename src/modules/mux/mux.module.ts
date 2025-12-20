import { forwardRef, Module } from '@nestjs/common';
import { MuxService } from './mux.service';
import { MuxController } from './mux.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonVideoModule } from '../lesson_video/lesson_video.module';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { User } from '../user/entities/user.entity';
import { ProgressGateway } from './progress.gateway';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LessonVideo, Lesson]),
    forwardRef(() => LessonVideoModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [MuxController],
  providers: [MuxService, ProgressGateway],
  exports: [MuxService, ProgressGateway],
})
export class MuxModule {}
