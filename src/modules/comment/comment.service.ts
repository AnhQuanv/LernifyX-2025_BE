import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../user/entities/user.entity';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async findCommentsByLesson(lessonId: string, page = 1, limit = 5) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException({
        errorCode: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy bài học',
      });
    }

    const [comments, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('reply.user', 'replyUser')
      .where('comment.lesson_id = :lessonId', { lessonId })
      .andWhere('comment.parent_id IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = comments.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      type: c.type,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: {
        fullName: c.user.fullName,
        avatar: c.user.avatar,
      },
      replies: c.replies.map((r) => ({
        id: r.id,
        content: r.content,
        rating: r.rating,
        type: r.type,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          fullName: r.user.fullName,
          avatar: r.user.avatar,
        },
      })),
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createComment(
    userId: string,
    type: 'lesson' | 'course',
    targetId: string,
    content: string,
    parentId?: string,
    rating?: number,
  ) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy người dùng',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    if (type === 'course') {
      if (rating === undefined || rating === null) {
        throw new BadRequestException('Khoá học cần có rating');
      }
      if (rating < 1 || rating > 5) {
        throw new BadRequestException('Rating phải nằm trong khoảng 1 đến 5');
      }
    } else if (type === 'lesson') {
      if (rating !== undefined && rating !== null) {
        throw new BadRequestException('Bài học không được phép có rating');
      }
    }

    let lesson: Lesson | null = null;
    let course: Course | null = null;

    if (type === 'lesson') {
      lesson = await this.lessonRepository.findOne({ where: { id: targetId } });
      if (!lesson) {
        throw new NotFoundException('Bài học không tồn tại');
      }
    } else if (type === 'course') {
      course = await this.courseRepository.findOne({ where: { id: targetId } });
      if (!course) {
        throw new NotFoundException('Khoá học không tồn tại');
      }
    }

    let parentComment: Comment | null = null;
    if (parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment không tồn tại');
      }
    }

    const comment = this.commentRepository.create({
      content,
      type,
      rating: type === 'course' ? rating : null,
      user,
      lesson,
      course,
      parent: parentComment,
    });

    const savedComment = await this.commentRepository.save(comment);

    if (type === 'course') {
      await this.courseRepository
        .createQueryBuilder()
        .update(Course)
        .set({
          rating: () =>
            `((rating * ratingCount) + ${rating}) / (ratingCount + 1)`,
          ratingCount: () => `ratingCount + 1`,
        })
        .where('id = :id', { id: targetId })
        .execute();
    }

    return savedComment;
  }
}
