import { Module } from '@nestjs/common';
import { QuizQuestionService } from './quiz_question.service';
import { QuizQuestionController } from './quiz_question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizOption } from '../quiz_option/entities/quiz_option.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { QuizQuestion } from './entities/quiz_question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, QuizOption, Lesson])],
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
})
export class QuizQuestionModule {}
