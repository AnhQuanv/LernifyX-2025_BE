import { Controller } from '@nestjs/common';
import { QuizOptionService } from './quiz_option.service';

@Controller('quiz-option')
export class QuizOptionController {
  constructor(private readonly quizOptionService: QuizOptionService) {}
}
