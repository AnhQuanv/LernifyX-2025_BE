import { Module } from '@nestjs/common';
import { QuizQuestionService } from './quiz_question.service';
import { QuizQuestionController } from './quiz_question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Payment, User])],
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
})
export class QuizQuestionModule {}
