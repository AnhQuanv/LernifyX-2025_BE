import { forwardRef, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { Course } from '../course/entities/course.entity';
import { MuxModule } from '../mux/mux.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, Course]),
    forwardRef(() => MuxModule),
  ],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
