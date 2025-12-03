import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RequestWithUser } from '../user/user.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('v1/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('filter')
  @UseGuards(OptionalJwtAuthGuard)
  async filterCourses(
    @Query('search') search: string = '',
    @Query('category') category: string = 'all',
    @Query('level') level: string = 'all',
    @Query('rating') rating: string = 'all',
    @Query('sortBy') sortBy: string = 'default',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    const result = await this.courseService.handleFilterCourses(
      {
        category,
        level,
        rating,
        sortBy,
        page,
        limit,
        search,
      },
      userId,
    );
    return ApiResponse.success(result, 'Lọc khóa học thành công');
  }

  @Get('home')
  @UseGuards(OptionalJwtAuthGuard)
  async getHomeCourses(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    const result = await this.courseService.handleGetHomeCourses(userId);
    return ApiResponse.success(result, 'Lấy danh sách khóa học thành công');
  }

  @Get('detail')
  @UseGuards(OptionalJwtAuthGuard)
  async getCourseDetail(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    const result = await this.courseService.handleGetCourseDetail(
      courseId,
      userId,
    );
    return ApiResponse.success(result, 'Lấy chi tiết khóa học thành công');
  }

  @Get('my-learning')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getMyLearningCourses(
    @Query('progressStatus') progressStatus: string = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    console.log('progressStatus', progressStatus);
    const userId = req.user.sub;
    const result = await this.courseService.handleGetMyLearningCourses(
      { progressStatus, limit, page },
      userId,
    );
    return ApiResponse.success(
      result,
      'Lấy danh sách khóa học của tôi thành công',
    );
  }

  @Get(':courseId/lesson/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getLesssonDetail(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const reuslt = await this.courseService.handleGetLessonDetail(
      courseId,
      lessonId,
      userId,
    );
    return ApiResponse.success(reuslt, 'Lấy chi tiết bài học thành công');
  }
}
