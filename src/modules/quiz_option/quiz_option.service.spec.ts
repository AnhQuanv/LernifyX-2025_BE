import { Test, TestingModule } from '@nestjs/testing';
import { QuizOptionService } from './quiz_option.service';

describe('QuizOptionService', () => {
  let service: QuizOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizOptionService],
    }).compile();

    service = module.get<QuizOptionService>(QuizOptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
