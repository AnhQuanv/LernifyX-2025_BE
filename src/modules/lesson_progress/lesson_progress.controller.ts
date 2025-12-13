import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LessonProgressService } from './lesson_progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiResponse } from 'src/common/bases/api-response';
import { RequestWithUser } from '../user/user.controller';
import { UpdateLessonProgressDto } from './dto/update-lesson_progress.dto';

@Controller('v1/lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async createLessonProgress(
    @Body('lessonId') lessonId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const progress =
      await this.lessonProgressService.handleCreateLessonProgress(
        userId,
        lessonId,
      );

    return ApiResponse.success(progress, 'Tạo tiến độ bài học thành công');
  }

  @Patch('/update')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async updateLessonProgress(
    @Body() body: UpdateLessonProgressDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;

    const updatedProgress =
      await this.lessonProgressService.handleUpdateLessonProgress(
        body.progressId,
        userId,
        body.lastPosition,
        body.completed,
      );

    return ApiResponse.success(
      updatedProgress,
      'Cập nhật tiến độ bài học thành công',
    );
  }
}
