import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Chapter } from './entities/chapter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Repository } from 'typeorm';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { MuxService } from '../mux/mux.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    private readonly muxService: MuxService,
  ) {}

  async handleCreateChapter(dto: CreateChapterDto, userId: string) {
    const { id, courseId, title, order } = dto;

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy khóa học với ID "${courseId}".`,
      );
    }
    console.log('userId và intructor: ', userId, course.instructor.userId);
    if (course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thêm chương cho khóa học này.',
      );
    }

    const newChapter = this.chapterRepository.create({
      id,
      title,
      order,
      course,
    });

    const savedChapter = await this.chapterRepository.save(newChapter);

    return {
      id: savedChapter.id,
      title: savedChapter.title,
      order: savedChapter.order,
    };
  }

  async handleUpdateChapter(dto: UpdateChapterDto, userId: string) {
    console.log('dto và userId: ', dto, userId);
    const { id: chapterId, ...updateData } = dto;
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: ['course', 'course.instructor'],
    });
    if (!chapter) {
      throw new NotFoundException(
        `Không tìm thấy chương với ID "${chapterId}".`,
      );
    }
    console.log(
      'userId và intructor: ',
      userId,
      chapter.course.instructor.userId,
    );

    if (chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa chương của khóa học này.',
      );
    }

    this.chapterRepository.merge(chapter, updateData);
    const updatedChapter = await this.chapterRepository.save(chapter);

    return {
      id: updatedChapter.id,
      title: updatedChapter.title,
      order: updatedChapter.order,
    };
  }

  async handleDeleteChapter(chapterId: string, userId: string) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: [
        'course',
        'course.instructor',
        'lessons',
        'lessons.videoAsset',
      ],
    });

    if (!chapter) throw new NotFoundException('Không tìm thấy chương.');

    if (chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa chương này.');
    }

    const lessonsWithVideo = chapter.lessons.filter((l) => l.videoId);

    if (lessonsWithVideo.length > 0) {
      await Promise.allSettled(
        lessonsWithVideo.map((lesson) =>
          this.muxService.handleDeleteVideo(lesson.videoId!, userId),
        ),
      );
    }

    await this.chapterRepository.delete(chapterId);

    return { deleted: true };
  }
}
