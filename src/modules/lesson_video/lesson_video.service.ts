import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonVideo } from './entities/lesson_video.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
import { v2 as Cloudinary } from 'cloudinary';
import { VideoUploadResult } from '../cloudinary/cloudinary.service';
export interface VideoUrlsResult {
  id: string;
  url_720p: string;
  url_480p: string;
  url_360p: string;
  duration: number;
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
  ) {}

  async saveLessonVideo(data: VideoUploadResult & { lessonId: string }) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${data.lessonId} not found.`);
    }

    const newVideoAsset = this.lessonVideoRepository.create({
      publicId: data.publicId,
      originalUrl: data.originalUrl,
      duration: data.duration,
      widthOriginal: data.widthOriginal,
      heightOriginal: data.heightOriginal,
      lesson: lesson,
    });

    const savedVideo = await this.lessonVideoRepository.save(newVideoAsset);
    const publicIdWithExt = `${savedVideo.publicId}.mp4`;
    const url_720p = this.cloudinary.url(publicIdWithExt, {
      resource_type: 'video',
      secure: true,
      transformation: [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto:good' },
      ],
    });

    const url_480p = this.cloudinary.url(publicIdWithExt, {
      resource_type: 'video',
      secure: true,
      transformation: [
        { width: 854, height: 480, crop: 'limit', quality: 'auto:eco' },
      ],
    });

    const url_360p = this.cloudinary.url(publicIdWithExt, {
      resource_type: 'video',
      secure: true,
      transformation: [
        { width: 640, height: 360, crop: 'limit', quality: 'auto:low' },
      ],
    });

    return {
      id: savedVideo.id,
      url_720p,
      url_480p,
      url_360p,
      duration: savedVideo.duration,
      widthOriginal: savedVideo.widthOriginal,
      heightOriginal: savedVideo.heightOriginal,
    } as VideoUrlsResult;
  }
}
