import { Module } from '@nestjs/common';
import { QuizOptionService } from './quiz_option.service';
import { QuizOptionController } from './quiz_option.controller';

@Module({
  controllers: [QuizOptionController],
  providers: [QuizOptionService],
})
export class QuizOptionModule {}
