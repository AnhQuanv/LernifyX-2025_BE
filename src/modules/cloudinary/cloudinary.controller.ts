import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Body,
  BadRequestException,
  Delete,
  InternalServerErrorException,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { LessonVideoService } from '../lesson_video/lesson_video.service';
import { ProgressGateway } from './progress.gateway';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';
interface RawBodyRequest extends Request {
  body:
    | {
        rawBody?: Buffer;
        [key: string]: any;
      }
    | null
    | undefined;
}

export interface CloudinaryWebhookPayload {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  type: string;
  version: number;
  duration: number;
  width: number;
  height: number;
  status: 'complete' | 'failed' | 'pending';
}
export interface VideoDataToSave {
  publicId: string;
  originalUrl: string;
  duration: number;
  widthOriginal: number;
  heightOriginal: number;
  lessonId: string;
}
@Controller('v1/cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
    private readonly lessonVideoService: LessonVideoService,
    private progressGateway: ProgressGateway,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher')
  @Post('imageAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const uploadResult = await this.cloudinaryService.handleUploadImage(file);
    const userId = req.user.sub;
    const updatedUser = await this.userService.handleUpdateProfile(userId, {
      avatar: uploadResult,
    });
    return ApiResponse.success(updatedUser, 'Cập nhật avatar thành công');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher')
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const uploadResult = await this.cloudinaryService.handleUploadImage1(file);
    return ApiResponse.success(uploadResult, 'Tải ảnh lên thành công');
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('teacher')
  // @Post('video')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadVideo(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() body: { lessonId: string; taskId: string },
  // ) {
  //   const { lessonId, taskId } = body;
  //   console.log('lessonId: ', lessonId);
  //   console.log('taskId: ', taskId);
  //   if (!lessonId || !taskId) {
  //     throw new BadRequestException('Thiếu lessonId hoặc taskId.');
  //   }
  //   const uploadResult = await this.cloudinaryService.handleUploadVideo(
  //     file,
  //     taskId,
  //   );

  //   const videoDataToSave = {
  //     ...uploadResult,
  //     lessonId: lessonId,
  //   };
  //   const savedVideo =
  //     await this.lessonVideoService.saveLessonVideo(videoDataToSave);
  //   this.progressGateway.sendComplete(taskId, savedVideo);
  //   return ApiResponse.success(
  //     savedVideo,
  //     'Tải video bài học và lưu DB thành công',
  //   );
  // }

  @Post('signature')
  getUploadSignature(
    @Body('taskId') taskId: string,
    @Body('lessonId') lessonId: string,
  ) {
    if (!lessonId || !taskId) {
      throw new BadRequestException('Thiếu lessonId hoặc taskId.');
    }

    const publicId = `Courses/Videos/L${lessonId}_T${taskId}_${Date.now()}`;

    const signatureParams = this.cloudinaryService.createSignedUploadParams(
      publicId,
      taskId,
    );

    return ApiResponse.success(
      signatureParams,
      'Tạo chữ ký tải lên thành công',
    );
  }

  @Post('webhook-complete')
  @UseGuards(OptionalJwtAuthGuard)
  async handleWebhookComplete(
    @Body() data: CloudinaryWebhookPayload,
    @Headers('x-cld-signature') signature: string,
    @Headers('x-cld-timestamp') timestampHeader: string,
    @Req() req: RawBodyRequest,
  ) {
    const rawBody = req.body?.rawBody;
    const bodyToVerify = rawBody ? rawBody.toString() : JSON.stringify(data);
    const secret = process.env.CLOUD_API_SECRET;
    if (!secret) {
      // Ném lỗi rõ ràng nếu biến môi trường chưa được thiết lập
      throw new InternalServerErrorException(
        'CLOUDINARY_API_SECRET chưa được thiết lập.',
      );
    }
    const isSignatureValid = this.cloudinaryService.verifyWebhookSignature(
      bodyToVerify,
      signature,
      secret,
      timestampHeader,
    );

    if (!isSignatureValid) {
      throw new InternalServerErrorException('Webhook signature is invalid.');
    }

    const publicId = data.public_id;
    const parts = publicId.split('_');
    const lessonIdPart = parts.length > 0 ? parts[0] : null;
    const taskIdPart = parts.length > 1 ? parts[1] : null;

    const lessonId = lessonIdPart?.startsWith('L')
      ? lessonIdPart.substring(1)
      : null;
    const taskId = taskIdPart?.startsWith('T') ? taskIdPart.substring(1) : null;

    if (!taskId || !lessonId) {
      console.error(
        `Không tìm thấy Task/Lesson ID trong publicId: ${publicId}`,
      );
      return { received: true };
    }

    if (data.status === 'complete') {
      const videoDataToSave: VideoDataToSave = {
        publicId: data.public_id,
        originalUrl: data.secure_url,
        duration: data.duration,
        widthOriginal: data.width,
        heightOriginal: data.height,
        lessonId: lessonId,
      };
      const savedVideo =
        await this.lessonVideoService.saveLessonVideo(videoDataToSave);

      this.progressGateway.sendProgress(taskId, 100);
      this.progressGateway.sendComplete(taskId, savedVideo);

      return { received: true };
    } else if (data.status === 'failed') {
      this.progressGateway.sendError(
        taskId,
        'Lỗi xử lý video trên Cloudinary.',
      );
      return { received: true };
    }

    return { received: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Delete('delete-video')
  async deleteVideo(
    @Body('lessonVideoId') lessonVideoId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.cloudinaryService.handleDeleteVideo(lessonVideoId, userId);
    return ApiResponse.success(null, 'Xóa Video bài học thành công!');
  }
}
