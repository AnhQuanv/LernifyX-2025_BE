import { Controller, Param, Post, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // @Post(':courseId')
  // async addToWishList(@Req() req, @Param('courseId') courseId: string) {
  //   const userId = req.user.id;
  //   const result = await this.wishlistService.handleAddToWishlist(
  //     userId,
  //     courseId,
  //   );
  //   return ApiResponse.success(
  //     result,
  //     'Thêm vào danh sách yêu thích thành công',
  //   );
  // }
}
