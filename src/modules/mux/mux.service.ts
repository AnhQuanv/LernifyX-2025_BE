import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import Mux from '@mux/mux-node';
import { ConfigService } from '@nestjs/config';
import { HeadersLike } from '@mux/mux-node/core';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
interface MuxAsset {
  duration?: number | null;
  max_width?: number | null;
  max_height?: number | null;
  [key: string]: any;
}
@Injectable()
export class MuxService {
  private mux: Mux;
  private webhookSecret: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(LessonVideo)
    private readonly lessonVideoRepository: Repository<LessonVideo>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {
    const tokenId = this.configService.get<string>('MUX_TOKEN_ID');
    const tokenSecret = this.configService.get<string>('MUX_TOKEN_SECRET');
    if (!tokenId || !tokenSecret) {
      throw new Error(
        'CRITICAL: MUX_TOKEN_ID hoặc MUX_TOKEN_SECRET chưa được cấu hình trong Environment Variables!',
      );
    }
    this.mux = new Mux({
      tokenId: tokenId,
      tokenSecret: tokenSecret,
    });
  }

  async createSignedUploadUrl(lessonId: string, taskId: string) {
    try {
      const tokenSecret = this.configService.get<string>('MUX_TOKEN_SECRET');
      console.log(
        `[MUX SERVICE] Token ID Read: ${this.configService.get<string>('MUX_TOKEN_ID')}`,
      );

      console.log(
        `[MUX SERVICE] Secret Length: ${tokenSecret ? tokenSecret.length : '0'}`,
      );
      console.log(`[MUX SERVICE] Secret Key: ${tokenSecret}`);

      if (
        !this.configService.get<string>('MUX_TOKEN_ID') ||
        !this.configService.get<string>('MUX_TOKEN_SECRET')
      ) {
        console.error(' Mux Token ID or Secret is missing in config!');
      }
      const upload = await this.mux.video.uploads.create({
        new_asset_settings: {
          passthrough: JSON.stringify({ lessonId, taskId }),
          playback_policy: ['public'],
        },
        timeout: 3600,
        cors_origin: '*',
      });

      return {
        uploadId: upload.id,
        uploadUrl: upload.url,
        assetId: upload.asset_id,
      };
    } catch (error) {
      console.error('Lỗi khi tạo Mux Upload URL:', error);
      throw new InternalServerErrorException('Không thể tạo Mux Upload URL.');
    }
  }

  verifyWebhookSignature(
    rawBody: string,
    muxSignature: string,
    secret: string,
  ): void {
    this.webhookSecret = this.configService.get(
      'MUX_WEBHOOK_SECRET_NEW',
    ) as string;
    console.log(
      '[MUX SERVICE] MUX_WEBHOOK_SECRET_NEW ĐANG ĐỌC TỪ CONFIG:',
      this.webhookSecret,
    );
    const headers: HeadersLike = { 'mux-signature': muxSignature };
    this.mux.webhooks.verifySignature(rawBody, headers, secret);
  }

  async getAssetDetails(assetId: string) {
    try {
      const assetResponse = await this.mux.video.assets.retrieve(assetId);
      const asset = assetResponse as MuxAsset;
      const duration = Math.round(asset.duration ?? 0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const videoTrack = asset.tracks?.find((track) => track.type === 'video');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const width = videoTrack?.max_width ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const height = videoTrack?.max_height ?? 0;
      if (duration === 0 || width === 0 || height === 0) {
        console.warn(
          `Mux Asset ${assetId} found but missing duration/dimensions. (W: ${width}, H: ${height})`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { duration, width, height };
    } catch (error) {
      console.error(
        `Error retrieving Mux asset details for ${assetId}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve details for Mux asset ${assetId}.`,
      );
    }
  }

  async handleDeleteVideo(lessonVideoId: string, userId: string) {
    const lessonVideo = await this.lessonVideoRepository.findOne({
      where: { id: lessonVideoId },
      relations: [
        'lesson',
        'lesson.chapter',
        'lesson.chapter.course',
        'lesson.chapter.course.instructor',
      ],
    });

    if (!lessonVideo) {
      throw new NotFoundException({
        errorCode: 'VIDEO_NOT_FOUND',
        message: 'Không tìm thấy video bài học.',
      });
    }
    const instructorId =
      lessonVideo.lesson?.chapter?.course?.instructor?.userId;

    if (!instructorId || instructorId !== userId) {
      throw new UnauthorizedException({
        errorCode: 'UNAUTHORIZED_ACCESS',
        message: 'Bạn không có quyền xóa video này.',
      });
    }
    if (lessonVideo.lesson) {
      await this.lessonRepository.update(
        { id: lessonVideo.lesson.id },
        { videoId: null },
      );
      if (lessonVideo.publicId) {
        try {
          await this.mux.video.assets.delete(lessonVideo.publicId);
        } catch (error) {
          console.error(
            `[MUX ERROR] Không thể xóa Asset ${lessonVideo.publicId} trên Mux:`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.message,
          );
        }
      }
      await this.lessonVideoRepository.remove(lessonVideo);
    }
  }
}
