import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from 'src/common/bases/api-response';
import { RequestWithUser } from '../user/user.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('v1/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getUserWishlist(
    @Req() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
  ) {
    const userId = req.user.sub;
    const result = await this.wishlistService.handleGetUserWishlist(
      userId,
      page,
      limit,
    );
    return ApiResponse.success(result, 'Lấy danh sách yêu thích thành công');
  }

  @Post(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @HttpCode(200)
  async addToWishlist(
    @Req() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    const userId = req.user.sub;
    const result = await this.wishlistService.handleAddToWishlist(
      userId,
      courseId,
    );
    return ApiResponse.success(
      result,
      'Thêm vào danh sách yêu thích thành công',
    );
  }

  @Delete(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @HttpCode(200)
  async removeFromWishlist(
    @Req() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    const userId = req.user.sub;
    const result = await this.wishlistService.handleRemoveFromWishlist(
      userId,
      courseId,
    );
    return ApiResponse.success(result, 'Đã xóa khỏi danh sách yêu thích');
  }
}
