import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
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
import { Request } from 'express';

interface WebhookContextCustom {
  taskId: string;
  lessonId: string;
}

interface WebhookContext {
  custom: WebhookContextCustom;
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
  context: WebhookContext;
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
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
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
}
