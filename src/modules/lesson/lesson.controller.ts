import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('v1/lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async createLesson(
    @Body() dto: CreateLessonDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const lesson = await this.lessonService.handleCreateLesson(dto, userId);
    return ApiResponse.success(lesson, 'Tạo bài học mới thành công!');
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async updateLesson(
    @Body() dto: UpdateLessonDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const updatedLesson = await this.lessonService.handleUpdateLesson(
      dto,
      userId,
    );
    return ApiResponse.success(updatedLesson, 'Cập nhật bài học thành công!');
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async deleteLesson(
    @Body('lessonId') lessonId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.lessonService.handleDeleteLesson(lessonId, userId);
    return ApiResponse.success(null, 'Xóa bài học thành công!');
  }
}
