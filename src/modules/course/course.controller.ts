import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RequestWithUser } from '../user/user.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

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
  async getLessonDetail(
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

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async createCourse(
    @Body() dto: CreateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const course = await this.courseService.handleCreateCourse(dto, userId);
    return ApiResponse.success(course, 'Tạo khóa học thành công!');
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async updateCourse(
    @Body() dto: UpdateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    console.log('dto: ', dto);
    const userId = req.user.sub;
    const updatedCourse = await this.courseService.handleUpdateCourse(
      dto,
      userId,
    );
    return ApiResponse.success(updatedCourse, 'Cập nhật khóa học thành công');
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async deleteChapter(
    @Body('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.courseService.handleDeleteCourse(courseId, userId);
    return ApiResponse.success(null, 'Xóa khóa học thành công!');
  }

  @Get('teacher-filter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async filterTeacherCourses(
    @Query('status') status: string = 'all',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: string = 'newest',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = req.user.sub;

    const result = await this.courseService.handleFilterTeacherCourses(
      {
        status,
        search,
        sortBy,
        page,
        limit,
      },
      teacherId,
    );

    return ApiResponse.success(result, 'Lọc khóa học của giáo viên thành công');
  }

  @Get('teacher-counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCourseCounts(@Req() req: RequestWithUser) {
    const teacherId = req.user.sub;
    const counts =
      await this.courseService.handleGetTeacherCourseCounts(teacherId);
    return ApiResponse.success(counts, 'Lấy thống kê khóa học thành công!');
  }

  @Get('teacher-detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCourseDetail(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = req.user.sub;
    const counts = await this.courseService.handleGetTeacherCourseDetail(
      teacherId,
      courseId,
    );
    return ApiResponse.success(counts, 'Lấy chi tiết khóa học thành công!');
  }

  @Get('teacher-student-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCourseStudentProgress(
    @Query('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const counts =
      await this.courseService.handleGetTeacherCourseStudentProgress(
        courseId,
        userId,
        page,
        limit,
      );
    return ApiResponse.success(
      counts,
      'Lấy tiến độ khóa học của học sinh thành công!',
    );
  }

  @Get('teacher-edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCourseEdit(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = req.user.sub;
    const counts = await this.courseService.handleGetTeacherCourseEdit(
      teacherId,
      courseId,
    );
    return ApiResponse.success(counts, 'Lấy chỉnh sửa khóa học thành công!');
  }

  @Get('teacher-course-revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCoursesRevenue(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = req.user.sub;
    const courses =
      await this.courseService.handleGetTeacherCoursesRevenue(teacherId);
    return ApiResponse.success(courses, 'Lấy chỉnh sửa khóa học thành công!');
  }
}
