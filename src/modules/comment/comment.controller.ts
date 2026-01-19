import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RolesGuard } from '../auth/roles.guard';

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
      'Lấy danh sách đánh giá khóa học thành công',
    );
  }

  @Get('lesson/:lessonId')
  async getCommentsByLesson(
    @Param('lessonId') lessonId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    const comments = await this.commentService.findCommentsByLesson(
      lessonId,
      +page,
      +limit,
    );
    return ApiResponse.success(
      comments,
      'Lấy danh sách bình luận bài giảng thành công',
    );
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher')
  async createComment(
    @Body() body: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const { content, parentId, type, targetId, rating } = body;

    if (!targetId) {
      return ApiResponse.error('targetId (lessonId hoặc courseId) là bắt buộc');
    }

    await this.commentService.createComment(
      userId,
      type,
      targetId,
      content,
      parentId,
      rating,
    );

    return ApiResponse.success(null, 'Tạo bình luận thành công');
  }
}
