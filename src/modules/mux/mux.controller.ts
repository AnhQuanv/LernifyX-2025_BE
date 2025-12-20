import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UnauthorizedException,
  UseGuards,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { MuxService } from './mux.service';
import { ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ProgressGateway } from './progress.gateway';
import { LessonVideoService } from '../lesson_video/lesson_video.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { Request } from 'express';
import { RequestWithUser } from '../user/user.controller';
import { RolesGuard } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';

interface MuxWebhookPayload {
  type: string;
  data: {
    id: string;
    passthrough: string;
    playback_ids: { id: string }[];
  };
}

interface MuxPassthrough {
  lessonId: string;
  taskId: string;
}

@Controller('v1/mux')
export class MuxController {
  constructor(
    private readonly muxService: MuxService,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly configService: ConfigService,
    private progressGateway: ProgressGateway,
    private readonly lessonVideoService: LessonVideoService,
  ) {}

  @Post('upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getUploadUrl(
    @Body('lessonId') lessonId: string,
    @Body('taskId') taskId: string,
  ) {
    console.log('body: ', lessonId);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${lessonId}`);
    }
    const uploadData = await this.muxService.createSignedUploadUrl(
      lessonId,
      taskId,
    );
    return ApiResponse.success(uploadData, 'Tạo Mux Upload URL thành công');
  }

  @Post('webhook')
  async handleMuxWebhook(
    @Headers('mux-signature') muxSignature: string,
    @Req() req: Request,
  ) {
    const secret = this.configService.get<string>('MUX_WEBHOOK_SECRET_NEW'); // 1. LẤY RAW BODY ĐƯỢC LƯU TỪ main.ts
    // Sử dụng `as any` để truy cập thuộc tính `rawBody` đã được thêm vào

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawBodyBuffer: Buffer = (req as any).rawBody;

    if (!rawBodyBuffer) {
      console.error('Raw Body không tồn tại. Lỗi cấu hình Express.');
      throw new UnauthorizedException('Yêu cầu Webhook không hợp lệ.');
    }
    const rawBodyString = rawBodyBuffer.toString('utf8'); // console.log('muxSignature: ', muxSignature); // Log không cần thiết
    // console.log('req: ', req); // Log req quá lớn, nên bỏ
    // 2. THỰC HIỆN XÁC THỰC

    if (secret && muxSignature) {
      try {
        // Xác thực chữ ký bằng Raw Body (dạng chuỗi)
        this.muxService.verifyWebhookSignature(
          rawBodyString,
          muxSignature,
          secret,
        );
        console.log('[WEBHOOK] Xác thực Mux thành công!');
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error('❌ Xác thực Webhook Mux thất bại:', err.message);
        throw new UnauthorizedException('Chữ ký Webhook không hợp lệ.');
      }
    } // 3. PARSE JSON sau khi xác thực thành công

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: MuxWebhookPayload = JSON.parse(rawBodyString); // 4. XỬ LÝ SỰ KIỆN
    console.log(`[MUX WEBHOOK] Event Received: ${data.type}`);
    console.log(`[MUX WEBHOOK] Asset ID: ${data.data.id}`);
    if (data.type === 'video.asset.ready') {
      const passthrough = JSON.parse(data.data.passthrough) as MuxPassthrough;
      const { lessonId, taskId } = passthrough;

      const videoDataToSave = {
        playbackId: data.data.playback_ids[0].id,
        assetId: data.data.id,
        lessonId: lessonId,
      };

      const savedVideo =
        await this.lessonVideoService.saveLessonVideo(videoDataToSave);
      console.log(
        `[CONTROLLER] Đã lưu DB thành công. Gửi tín hiệu WS cho Task: ${taskId}`,
      );
      this.progressGateway.sendComplete(taskId, savedVideo);
      return { received: true };
    } else if (data.type === 'video.asset.errored') {
      const passthrough = JSON.parse(data.data.passthrough) as MuxPassthrough;
      const { taskId } = passthrough;

      this.progressGateway.sendError(taskId, 'Video processing failed at Mux.');

      console.error(`[CONTROLLER] Asset ${data.data.id} failed to process.`);
      return { received: true };
    }
    return { received: true };
  }

  @Delete('delete-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async deleteLessonVideo(
    @Body('lessonVideoId') lessonVideoId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.muxService.handleDeleteVideo(lessonVideoId, userId);
    return ApiResponse.success(null, 'Xóa Video bài học thành công!');
  }
}
