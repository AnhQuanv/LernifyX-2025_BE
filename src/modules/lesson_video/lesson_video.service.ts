import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonVideo } from './entities/lesson_video.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
import { v2 as Cloudinary } from 'cloudinary';
import { MuxService } from '../mux/mux.service';
import { LessonService } from '../lesson/lesson.service';
import { CourseService } from '../course/course.service';

export interface VideoUrlsResult {
  id: string;
  originalUrl: string;
  duration: number;
  widthOriginal: number;
  heightOriginal: number;
}
export interface MuxAssetResult {
  assetId: string;
  playbackId: string;
}
export interface LessonVideoData {
  playbackId: string;
  assetId: string;
  lessonId: string;
  courseId: string;
}
@Injectable()
export class LessonVideoService {
  constructor(
    @InjectRepository(LessonVideo)
    private lessonVideoRepository: Repository<LessonVideo>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
    private readonly muxService: MuxService,
    private readonly lessonService: LessonService,
    private readonly courseService: CourseService,
  ) {}

  async saveLessonVideo(data: LessonVideoData) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${data.lessonId} not found.`);
    }
    const muxDetails = await this.muxService.getAssetDetails(data.assetId);
    const newVideoAsset = this.lessonVideoRepository.create({
      publicId: data.assetId,
      originalUrl: `https://stream.mux.com/${data.playbackId}.m3u8`,
      duration: Math.round(muxDetails.duration),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      widthOriginal: muxDetails.width,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      heightOriginal: muxDetails.height,
      lesson: lesson,
    });

    const savedVideo = await this.lessonVideoRepository.save(newVideoAsset);
    await this.lessonService.handleUpdateLesson1({
      id: data.lessonId,
      duration: newVideoAsset.duration,
    });
    await this.courseService.updateCourseDuration(data.courseId);
    return {
      id: savedVideo.id,
      originalUrl: savedVideo.originalUrl,
      duration: savedVideo.duration,
      widthOriginal: savedVideo.widthOriginal,
      heightOriginal: savedVideo.heightOriginal,
    } as VideoUrlsResult;
  }
}
