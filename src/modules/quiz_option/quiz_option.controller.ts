import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuizOptionService } from './quiz_option.service';
import { CreateQuizOptionDto } from './dto/create-quiz_option.dto';
import { UpdateQuizOptionDto } from './dto/update-quiz_option.dto';

@Controller('quiz-option')
export class QuizOptionController {
  constructor(private readonly quizOptionService: QuizOptionService) {}

  @Post()
  create(@Body() createQuizOptionDto: CreateQuizOptionDto) {
    return this.quizOptionService.create(createQuizOptionDto);
  }

  @Get()
  findAll() {
    return this.quizOptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizOptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizOptionDto: UpdateQuizOptionDto) {
    return this.quizOptionService.update(+id, updateQuizOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizOptionService.remove(+id);
  }
}
