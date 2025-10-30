import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Course, Lesson])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
