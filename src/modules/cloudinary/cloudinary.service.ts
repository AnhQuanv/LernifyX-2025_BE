import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { Repository } from 'typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { ProgressGateway } from './progress.gateway';
export interface VideoUploadResult {
  publicId: string;
  originalUrl: string;
  duration: number;
  widthOriginal: number;
  heightOriginal: number;
}
interface CloudinaryDeleteResponse {
  result: 'ok' | 'not found';
  [key: string]: any;
}
@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: typeof Cloudinary,
    @InjectRepository(LessonVideo)
    private readonly lessonVideoRepository: Repository<LessonVideo>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private progressGateway: ProgressGateway,
  ) {}

  async handleUploadImage(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer)
      throw new BadRequestException({
        errorCode: 'INVALID_FILE',
        message: 'Tệp tải lên không hợp lệ hoặc thiếu buffer.',
      });

    const timestamp = Date.now();
    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    const publicId = `${originalNameWithoutExt}_${timestamp}`;

    const readablePhotoStream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'Avatar',
          resource_type: 'image',
          public_id: publicId,
        },
        (error, result) => {
          if (error)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_UPLOAD_FAILED',
                message: error.message || 'Lỗi khi tải ảnh lên Cloudinary.',
              }),
            );
          if (!result)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_NO_RESPONSE',
                message: 'Không nhận được phản hồi từ Cloudinary.',
              }),
            );
          resolve(result.secure_url);
        },
      );

      readablePhotoStream.pipe(uploadStream);
    });
  }

  async handleUploadImage1(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer)
      throw new BadRequestException({
        errorCode: 'INVALID_FILE',
        message: 'Tệp tải lên không hợp lệ hoặc thiếu buffer.',
      });

    const timestamp = Date.now();
    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    const publicId = `${originalNameWithoutExt}_${timestamp}`;

    const readablePhotoStream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'temp',
          resource_type: 'image',
          public_id: publicId,
        },
        (error, result) => {
          if (error)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_UPLOAD_FAILED',
                message: error.message || 'Lỗi khi tải ảnh lên Cloudinary.',
              }),
            );
          if (!result)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_NO_RESPONSE',
                message: 'Không nhận được phản hồi từ Cloudinary.',
              }),
            );
          resolve(result.secure_url);
        },
      );

      readablePhotoStream.pipe(uploadStream);
    });
  }

  // async handleUploadVideo(
  //   file: Express.Multer.File,
  //   taskId: string,
  // ): Promise<VideoUploadResult> {
  //   if (!file?.buffer)
  //     throw new BadRequestException({
  //       errorCode: 'INVALID_FILE',
  //       message: 'Tệp tải lên không hợp lệ hoặc thiếu buffer.',
  //     });

  //   const timestamp = Date.now();
  //   const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
  //   const publicId = `Courses/Videos/${originalNameWithoutExt}_${timestamp}`;

  //   const readableVideoStream = Readable.from(file.buffer);

  //   let uploadedBytes = 0;
  //   const totalBytes = file.size;
  //   let lastProgress = 0;

  //   readableVideoStream.on('data', (chunk) => {
  //     uploadedBytes += chunk.length;
  //     const progress = Math.round((uploadedBytes / totalBytes) * 100);
  //     const trackedProgress = Math.min(progress, 90);
  //     if (trackedProgress > lastProgress) {
  //       console.log(
  //         `[PROGRESS] Task ${taskId}: Đã gửi ${trackedProgress}% lên Cloudinary.`,
  //       );
  //       this.progressGateway.sendProgress(taskId, trackedProgress);
  //       lastProgress = trackedProgress;
  //     }
  //   });

  //   return new Promise((resolve, reject) => {
  //     const uploadStream = this.cloudinary.uploader.upload_stream(
  //       {
  //         resource_type: 'video',
  //         folder: 'Course',
  //         public_id: publicId,
  //         eager: [
  //           {
  //             width: 1280,
  //             height: 720,
  //             crop: 'limit',
  //             quality: 'auto:good',
  //             format: 'mp4',
  //           },
  //           {
  //             width: 854,
  //             height: 480,
  //             crop: 'limit',
  //             quality: 'auto:eco',
  //             format: 'mp4',
  //           },
  //           {
  //             width: 640,
  //             height: 360,
  //             crop: 'limit',
  //             quality: 'auto:low',
  //             format: 'mp4',
  //           },
  //         ],
  //         eager_async: false,
  //       },
  //       (error, result: UploadApiResponse | undefined) => {
  //         if (error || !result) {
  //           const errorMessage = error
  //             ? error.message || 'Lỗi khi tải video lên Cloudinary.'
  //             : 'Không nhận được phản hồi từ Cloudinary.';
  //           this.progressGateway.sendError(taskId, 'Lỗi tải lên Cloudinary.');
  //           return reject(
  //             new InternalServerErrorException({
  //               errorCode: 'CLOUDINARY_UPLOAD_FAILED',
  //               message: errorMessage,
  //             }),
  //           );
  //         }

  //         const duration = result.duration
  //           ? Math.round(Number(result.duration))
  //           : 0;

  //         resolve({
  //           publicId: result.public_id,
  //           originalUrl: result.secure_url,
  //           duration: duration,
  //           widthOriginal: result.width,
  //           heightOriginal: result.height,
  //         });
  //       },
  //     );

  //     readableVideoStream.pipe(uploadStream);
  //   });
  // }

  createSignedUploadParams(publicId: string, taskId: string) {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
    const eagerTransformations = [
      'w_1280,h_720,c_limit,q_auto:good',
      'w_854,h_480,c_limit,q_auto:eco',
      'w_640,h_360,c_limit,q_auto:low',
    ];
    const timestamp = Math.round(new Date().getTime() / 1000);
    const originalPublicId = publicId.split('_T')[0];
    const pathParts = originalPublicId.split('/');
    const lessonIdPart = pathParts[pathParts.length - 1];
    const uniquePublicId = `${originalPublicId}_T${taskId}_${timestamp}`;
    const contextString = `taskId=${taskId}|lessonId=${lessonIdPart}`;
    const eagerString = eagerTransformations.join('|');
    const paramsToSign = {
      timestamp: timestamp,
      public_id: uniquePublicId,
      folder: 'Course',
      eager_async: true,
      notification_url: `${BASE_URL}/v1/cloudinary/webhook-complete`,
      eager: eagerString,
      context: contextString,
    };
    const cloudinarySecret = process.env.CLOUD_API_SECRET;
    if (!cloudinarySecret) {
      throw new InternalServerErrorException(
        'CLOUDINARY_API_SECRET chưa được thiết lập.',
      );
    }
    const signature = Cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinarySecret,
    );

    return {
      ...paramsToSign,
      signature: signature,
      api_key: process.env.CLOUD_API_KEY,
      cloud_name: process.env.CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/video/upload`,
    };
  }

  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
    timestamp: string,
  ): boolean {
    if (!signature || !timestamp) return false;

    const timestampNumber = parseInt(timestamp, 10);

    return Cloudinary.utils.verifyNotificationSignature(
      rawBody,
      timestampNumber,
      signature,
    );
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
      const publicId = lessonVideo.publicId;
      try {
        const result: CloudinaryDeleteResponse =
          (await this.cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
          })) as CloudinaryDeleteResponse;

        if (result.result !== 'ok' && result.result !== 'not found') {
          // Tạo biến chuỗi an toàn để đưa vào template literal
          const deleteResultString = String(result.result);

          console.error('Lỗi khi xóa video trên Cloudinary:', result);
          throw new InternalServerErrorException({
            errorCode: 'CLOUDINARY_DELETE_FAILED',
            // Sử dụng deleteResultString đã được đảm bảo là chuỗi
            message: `Lỗi khi xóa tài nguyên Cloudinary: ${deleteResultString}`,
          });
        }
      } catch (error) {
        console.error('Lỗi Cloudinary khi xóa:', error);
        throw new InternalServerErrorException({
          errorCode: 'CLOUDINARY_SERVICE_ERROR',
          message: 'Lỗi dịch vụ Cloudinary khi xóa video.',
        });
      }

      await this.lessonVideoRepository.remove(lessonVideo);
    }
  }
}
