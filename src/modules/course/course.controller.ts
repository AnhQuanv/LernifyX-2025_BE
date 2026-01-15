import {
  BadRequestException,
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

  @Get('teacher')
  @UseGuards(OptionalJwtAuthGuard)
  async getTeacher(
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
  ) {
    const result = await this.courseService.handleGetTeacher({
      search,
      limit,
      page,
    });
    return ApiResponse.success(result, 'Lấy danh sách giảng viên thành công');
  }

  @Get('teacher-course-detail')
  @UseGuards(OptionalJwtAuthGuard)
  async getTeacherDetail(
    @Req() req: RequestWithUser,
    @Query('teacherId') teacherId: string,
  ) {
    if (!teacherId) {
      throw new BadRequestException('Giảng viên không hợp lệ');
    }
    const userId = req.user?.sub;
    const result = await this.courseService.handleGetTeacherDetail(
      teacherId,
      userId,
    );
    return ApiResponse.success(result, 'Lấy giảng viên chi tiết thành công');
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

  @Get(':courseId/lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async getLessonDetailForTeacher(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const reuslt = await this.courseService.handleGetLessonDetailForTeacher(
      courseId,
      lessonId,
    );
    return ApiResponse.success(reuslt, 'Lấy chi tiết bài học thành công');
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async createCourse(
    @Body() dto: CreateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const course = await this.courseService.handleCreateCourse(dto, userId);
    return ApiResponse.success(course, 'Tạo khóa học thành công!');
  }

  @Post('edit-logic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async createCourseDraft(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const course = await this.courseService.handleCreateCourseDraft(
      courseId,
      userId,
    );
    return ApiResponse.success(course, 'Tạo khóa học thành công!');
  }

  @Put('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async updateCourse(
    @Body() dto: UpdateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.roleName;
    const updatedCourse = await this.courseService.handleUpdateCourse(
      dto,
      userId,
      userRole,
    );
    return ApiResponse.success(updatedCourse, 'Cập nhật khóa học thành công');
  }

  @Put('update-child-course')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateChildCourse(
    @Body('childCourseId') childCourseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const updatedCourse = await this.courseService.handleApproveChildCourse(
      childCourseId,
      userId,
    );
    return ApiResponse.success(updatedCourse, 'Cập nhật khóa học thành công');
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async deleteCourse(
    @Body('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.courseService.handleDeleteCourse(courseId, userId);
    return ApiResponse.success(null, 'Xóa khóa học thành công!');
  }

  @Delete('delete-published-course')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async deletePublishedCourse(
    @Body('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.courseService.handleDeletePublishedCourse(courseId, userId);
    return ApiResponse.success(null, 'Xóa khóa học bản nháp thành công!');
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
  @Roles('teacher', 'admin')
  async getTeacherCourseDetail(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.roleName;

    const courseDetail = await this.courseService.handleGetTeacherCourseDetail(
      userId,
      courseId,
      userRole === 'admin',
    );

    return ApiResponse.success(
      courseDetail,
      'Lấy chi tiết khóa học thành công!',
    );
  }

  @Get('teacher-student-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async getTeacherCourseStudentProgress(
    @Query('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const isAdmin = req.user.roleName === 'admin';
    const counts =
      await this.courseService.handleGetTeacherCourseStudentProgress(
        courseId,
        userId,
        page,
        limit,
        isAdmin,
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

  @Get('teacher-revenue-page')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherCoursesRevenuePage(
    @Query('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = req.user.sub;
    const courses =
      await this.courseService.handleGetTeacherCoursesRevenuePage(teacherId);
    return ApiResponse.success(
      courses,
      'Lấy doanh thu chi tiêt khóa học thành công!',
    );
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
    return ApiResponse.success(courses, 'Lấy danh sách khóa học thành công!');
  }

  @Get('admin-counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminCourseCounts() {
    const counts = await this.courseService.handleGetAdminCourseCounts();
    return ApiResponse.success(counts, 'Lấy thống kê khóa học thành công!');
  }

  @Get('admin-filter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async filterAdminCourses(
    @Query('status') status: string = 'all',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: string = 'newest',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
  ) {
    const result = await this.courseService.handleFilterAdminCourses({
      status,
      search,
      sortBy,
      page,
      limit,
    });

    return ApiResponse.success(result, 'Lọc khóa học của giáo viên thành công');
  }

  @Get('admin-teacher-course-tree')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTeacherCourseTree() {
    const result = await this.courseService.handleGetTeacherCourseTree();
    return ApiResponse.success(
      result,
      'Lấy danh sách phân cấp giảng viên - khóa học thành công',
    );
  }
}
