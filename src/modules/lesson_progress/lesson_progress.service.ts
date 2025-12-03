import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonProgress } from './entities/lesson_progress.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

  async handleCreateLessonProgress(userId: string, lessonId: string) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const existed = await this.progressRepo.findOne({
      where: { user: { userId: userId }, lesson: { id: lessonId } },
    });

    if (existed) return existed;

    const progress = this.progressRepo.create({
      user,
      lesson,
      completed: false,
      lastPosition: 0,
    });

    const savedProgress = await this.progressRepo.save(progress);
    return {
      id: savedProgress.id,
      completed: savedProgress.completed,
      lastPosition: savedProgress.lastPosition,
      notes: [],
      updatedAt: savedProgress.updatedAt,
      createdAt: savedProgress.createdAt,
    };
  }

  async handleUpdateLessonProgress(
    progressId: string,
    userId: string,
    lastPosition?: number,
    completed?: boolean,
  ) {
    const progress = await this.progressRepo.findOne({
      where: { id: progressId },
      relations: ['user', 'notes'],
    });

    if (!progress) {
      throw new NotFoundException('LessonProgress không tồn tại');
    }

    if (progress.user.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật tiến độ này');
    }

    if (lastPosition !== undefined) {
      progress.lastPosition = lastPosition;
    }

    if (completed !== undefined) {
      progress.completed = completed;
    }

    const savedProgress = await this.progressRepo.save(progress);
    return {
      id: savedProgress.id,
      completed: savedProgress.completed,
      lastPosition: savedProgress.lastPosition,
      notes: savedProgress.notes || [],
      updatedAt: savedProgress.updatedAt,
      createdAt: savedProgress.createdAt,
    };
  }
}
