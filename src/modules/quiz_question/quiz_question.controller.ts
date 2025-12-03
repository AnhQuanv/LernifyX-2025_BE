import { Controller } from '@nestjs/common';
import { QuizQuestionService } from './quiz_question.service';

@Controller('v1/quiz-question')
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}
}
