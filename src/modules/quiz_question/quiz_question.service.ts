import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { QuizQuestion } from './entities/quiz_question.entity';
import { QuizOption } from '../quiz_option/entities/quiz_option.entity';
import { CreateQuizQuestionDto } from './dto/create-quiz_question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz_question.dto';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private readonly optionRepository: Repository<QuizOption>,
  ) {}

  private async checkTeacherPermission(lessonId: string, userId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['chapter', 'chapter.course', 'chapter.course.instructor'],
    });

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID "${lessonId}".`,
      );
    }

    if (lesson.chapter.course.instructor.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý câu hỏi cho bài học này.',
      );
    }
    return lesson;
  }

  async handleCreateQuizQuestion(dto: CreateQuizQuestionDto, userId: string) {
    const { id, lessonId, question, options, correctOptionId, order } = dto;

    const lesson = await this.checkTeacherPermission(lessonId, userId);

    if (options.length > 0 && correctOptionId) {
      const optionIds = options.map((opt) => opt.id);
      if (!optionIds.includes(correctOptionId)) {
        throw new BadRequestException(
          'ID đáp án đúng (correctOptionId) phải nằm trong danh sách các lựa chọn (options) đã gửi.',
        );
      }
    }

    const newQuestion = this.questionRepository.create({
      id,
      question,
      order,
      correctOptionId,
      lesson,
    });

    const quizOptions = options.map((opt) =>
      this.optionRepository.create({
        id: opt.id,
        text: opt.text,
        question: newQuestion,
      }),
    );
    newQuestion.options = quizOptions;

    const savedQuestion = await this.questionRepository.save(newQuestion);
    return {
      id: savedQuestion.id,
      lessonId: lessonId,
      question: savedQuestion.question,
      order: savedQuestion.order,
      correctOptionId: savedQuestion.correctOptionId,
      createdAt: savedQuestion.createdAt,
      updatedAt: savedQuestion.updatedAt,
      options: savedQuestion.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    };
  }

  async handleUpdateQuizQuestion(dto: UpdateQuizQuestionDto, userId: string) {
    const {
      id: questionId,
      lessonId,
      options,
      correctOptionId,
      ...updateData
    } = dto;

    await this.checkTeacherPermission(lessonId, userId);

    const questionToUpdate = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['options'],
    });

    if (!questionToUpdate) {
      throw new NotFoundException(
        `Không tìm thấy câu hỏi với ID "${questionId}".`,
      );
    }

    this.questionRepository.merge(questionToUpdate, updateData);

    if (options && options.length > 0) {
      const optionIds = options.map((opt) => opt.id);
      if (correctOptionId && !optionIds.includes(correctOptionId)) {
        throw new BadRequestException(
          'ID đáp án đúng phải nằm trong danh sách các lựa chọn mới.',
        );
      }

      await this.optionRepository.delete({ question: { id: questionId } });

      const newOptions = options.map((opt) =>
        this.optionRepository.create({
          id: opt.id,
          text: opt.text,
          question: questionToUpdate,
        }),
      );
      questionToUpdate.options = newOptions;
    }

    if (correctOptionId) {
      questionToUpdate.correctOptionId = correctOptionId;
    }

    const savedQuestion = await this.questionRepository.save(questionToUpdate);

    return {
      id: savedQuestion.id,
      lessonId: lessonId,
      question: savedQuestion.question,
      order: savedQuestion.order,
      correctOptionId: savedQuestion.correctOptionId,
      createdAt: savedQuestion.createdAt,
      updatedAt: savedQuestion.updatedAt,
      options: savedQuestion.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    };
  }

  async handleDeleteQuizQuestion(
    questionId: string,
    lessonId: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    await this.checkTeacherPermission(lessonId, userId);

    const result = await this.questionRepository.delete(questionId);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy câu hỏi với ID "${questionId}" để xóa.`,
      );
    }

    return { deleted: true };
  }
}
