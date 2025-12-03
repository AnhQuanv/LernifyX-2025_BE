import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserPreferencesService } from './user_preferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from 'src/common/bases/api-response';
import { CreateUserPreferenceDto } from './dto/create-user_preference.dto';

@Controller('v1/user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async getRecommendations(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const courses = await this.userPreferencesService.recommendCourses(userId);
    return ApiResponse.success(courses, 'Gợi ý khóa học thành công');
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async create(
    @Body() dto: CreateUserPreferenceDto,
    @Req() req: RequestWithUser,
  ) {
    console.log('dto', dto);
    const userId = req.user.sub;
    await this.userPreferencesService.handleCreate(userId, dto);
    return ApiResponse.success(null, 'Tạo preference thành công');
  }
}
