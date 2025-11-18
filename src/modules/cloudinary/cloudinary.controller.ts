import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('v1/cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @Post('imageAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const uploadResult = await this.cloudinaryService.handleUploadAvatar(file);
    const userId = req.user.sub;
    const updatedUser = await this.userService.handleUpdateProfile(userId, {
      avatar: uploadResult,
    });
    return ApiResponse.success(updatedUser, 'Cập nhật avatar thành công');
  }
}
