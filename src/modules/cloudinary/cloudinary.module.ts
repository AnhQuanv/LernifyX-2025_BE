import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryController } from './cloudinary.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { LessonVideoModule } from '../lesson_video/lesson_video.module';
import { Lesson } from '../lesson/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LessonVideo, Lesson]),
    LessonVideoModule,
  ],
  providers: [CloudinaryProvider, CloudinaryService, UserService],
  controllers: [CloudinaryController],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
