import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('v1/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('course/:courseId')
  async getByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    const result = await this.commentService.findByCourse(
      courseId,
      +page,
      +limit,
    );
    return ApiResponse.success(
      result,
      'Lấy danh sách bình luận khóa học thành công',
    );
  }

  @Get('lesson/:lessonId')
  async getByLesson(
    @Param('lessonId') lessonId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    const comments = await this.commentService.findByLesson(
      lessonId,
      +page,
      +limit,
    );
    return ApiResponse.success(
      comments,
      'Lấy danh sách bình luận bài học thành công',
    );
  }
}
