import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from 'src/common/bases/api-response';
import { QuizQuestionService } from './quiz_question.service';
import { CreateQuizQuestionDto } from './dto/create-quiz_question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz_question.dto';

@Controller('v1/quiz-question')
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async createQuestion(
    @Body() dto: CreateQuizQuestionDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const question = await this.quizQuestionService.handleCreateQuizQuestion(
      dto,
      userId,
    );
    return ApiResponse.success(question, 'Tạo câu hỏi trắc nghiệm thành công!');
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async updateQuestion(
    @Body() dto: UpdateQuizQuestionDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    const updatedQuestion =
      await this.quizQuestionService.handleUpdateQuizQuestion(dto, userId);
    return ApiResponse.success(
      updatedQuestion,
      'Cập nhật câu hỏi trắc nghiệm thành công!',
    );
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @Roles('teacher')
  async deleteQuestion(
    @Body('questionId') questionId: string,
    @Body('lessonId') lessonId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    await this.quizQuestionService.handleDeleteQuizQuestion(
      questionId,
      lessonId,
      userId,
    );
    return ApiResponse.success(null, 'Xóa câu hỏi trắc nghiệm thành công!');
  }
}
