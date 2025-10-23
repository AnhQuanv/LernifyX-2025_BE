import { Controller, Get, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('v1/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('filter')
  async filterCourses(
    @Query('category') category: string = 'all',
    @Query('level') level: string = 'all',
    @Query('rating') rating: string = 'all',
    @Query('sortBy') sortBy: string = 'default',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
  ) {
    const result = await this.courseService.handleFilterCourses({
      category,
      level,
      rating,
      sortBy,
      page,
      limit,
    });

    return ApiResponse.success(result, 'Lọc khóa học thành công');
  }
}
