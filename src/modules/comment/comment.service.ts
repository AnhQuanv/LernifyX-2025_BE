import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async findByCourse(courseId: string, page = 1, limit = 5) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException({
        errorCode: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy khóa học',
      });
    }

    try {
      const [data, total] = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.course = :courseId', { courseId })
        .orderBy('comment.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new InternalServerErrorException({
        errorCode: 'DATABASE_ERROR',
        message: 'Lỗi khi truy vấn comment theo khóa học',
      });
    }
  }

  async findByLesson(lessonId: string, page = 1, limit = 5) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException({
        errorCode: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy bài học',
      });
    }

    try {
      const [data, total] = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.lesson = :lessonId', { lessonId })
        .orderBy('comment.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new InternalServerErrorException({
        errorCode: 'DATABASE_ERROR',
        message: 'Lỗi khi truy vấn comment theo bài học',
      });
    }
  }
}
