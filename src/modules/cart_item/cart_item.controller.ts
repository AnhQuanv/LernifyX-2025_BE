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
import { CartItemService } from './cart_item.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from '../../common/bases/api-response';

@Controller('v1/cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getUserCart(
    @Req() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
  ) {
    const userId = req.user.sub;
    const result = await this.cartItemService.handleGetUserCart(
      userId,
      page,
      limit,
    );
    return ApiResponse.success(result, 'Lấy danh sách giỏ hàng thành công');
  }

  @Post(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @HttpCode(200)
  async addToCart(
    @Req() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    const userId = req.user.sub;
    const result = await this.cartItemService.handleAddToCart(userId, courseId);
    return ApiResponse.success(
      result,
      'Thêm vào danh sách giỏ hàng thành công',
    );
  }

  @Delete(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @HttpCode(200)
  async removeFromCart(
    @Req() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    const userId = req.user.sub;
    const result = await this.cartItemService.handleRemoveFromCart(
      userId,
      courseId,
    );
    return ApiResponse.success(result, 'Đã xóa khỏi danh sách giỏ hàng');
  }
}
