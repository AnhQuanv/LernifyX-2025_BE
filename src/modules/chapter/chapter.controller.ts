import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from 'src/common/bases/api-response';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Controller('v1/chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async createChapter(
    @Body() dto: CreateChapterDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const chapter = await this.chapterService.handleCreateChapter(dto, userId);
    return ApiResponse.success(chapter, 'Tạo chương mới thành công!');
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async updateChapter(
    @Body() dto: UpdateChapterDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const updatedChapter = await this.chapterService.handleUpdateChapter(
      dto,
      userId,
    );
    return ApiResponse.success(updatedChapter, 'Cập nhật chương thành công!');
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async deleteChapter(
    @Body('chapterId') chapterId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.chapterService.handleDeleteChapter(chapterId, userId);
    return ApiResponse.success(null, 'Xóa chương thành công!');
  }
}
