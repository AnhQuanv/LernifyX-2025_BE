import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../chapter/entities/chapter.entity';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async handleCreateLesson(dto: CreateLessonDto, userId: string) {
    const { chapterId, id, title, content, duration, videoUrl, order } = dto;

    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: ['course', 'course.instructor'],
    });

    if (!chapter) {
      throw new NotFoundException(
        `Không tìm thấy chương với ID "${chapterId}".`,
      );
    }

    if (chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thêm bài học cho chương này.',
      );
    }

    const newLesson = this.lessonRepository.create({
      id,
      title,
      content,
      duration,
      order,
      chapter,
    });

    const savedLesson = await this.lessonRepository.save(newLesson);
    return {
      chapterId: savedLesson.chapter.id,
      id: savedLesson.id,
      title: savedLesson.title,
      content: savedLesson.content,
      order: savedLesson.order,
      duration: savedLesson.duration,
    };
  }

  async handleUpdateLesson(dto: UpdateLessonDto, userId: string) {
    const { id: lessonId, ...updateData } = dto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['chapter', 'chapter.course', 'chapter.course.instructor'],
    });

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID "${lessonId}".`,
      );
    }

    if (lesson.chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bài học của khóa học này.',
      );
    }

    this.lessonRepository.merge(lesson, updateData);
    const updatedLesson = await this.lessonRepository.save(lesson);

    return {
      chapterId: updatedLesson.chapter.id,
      id: updatedLesson.id,
      title: updatedLesson.title,
      content: updatedLesson.content,
      order: updatedLesson.order,
      duration: updatedLesson.duration,
    };
  }

  async handleUpdateLesson1(dto: UpdateLessonDto) {
    const { id: lessonId, ...updateData } = dto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['chapter', 'chapter.course', 'chapter.course.instructor'],
    });

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID "${lessonId}".`,
      );
    }

    this.lessonRepository.merge(lesson, updateData);
    const updatedLesson = await this.lessonRepository.save(lesson);

    return {
      chapterId: updatedLesson.chapter.id,
      id: updatedLesson.id,
      title: updatedLesson.title,
      content: updatedLesson.content,
      order: updatedLesson.order,
      duration: updatedLesson.duration,
    };
  }

  async handleDeleteLesson(
    lessonId: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['chapter', 'chapter.course', 'chapter.course.instructor'],
    });

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID "${lessonId}".`,
      );
    }

    if (lesson.chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa bài học của khóa học này.',
      );
    }

    await this.lessonRepository.delete(lessonId);

    return { deleted: true };
  }
}
