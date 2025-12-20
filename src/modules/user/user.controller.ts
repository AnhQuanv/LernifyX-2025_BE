import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiResponse } from 'src/common/bases/api-response';
import { Request, Response } from 'express';
import { PayloadJwt } from '../auth/auth.interface';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/update-user.dto';

export interface RequestWithUser extends Request {
  user: PayloadJwt;
}

@Controller('v1/profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getProfile(@Req() req: RequestWithUser) {
    const user_id = req.user.sub;
    const user = await this.userService.handleGetProfile(user_id);
    return ApiResponse.success(user, 'Lấy thông tin user thành công');
  }

  @Put('edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user.sub;
    console.log('role: ', req.user.roleName);
    const updatedUser = await this.userService.handleUpdateProfile(userId, dto);
    return ApiResponse.success(
      updatedUser,
      'Cập nhật thông tin user thành công',
    );
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: UpdatePasswordDto,
  ) {
    const userId = req.user.sub;
    await this.userService.handleChangePassword(userId, dto);
    return ApiResponse.success(null, 'Cập nhật mật khẩu thành công');
  }
}
