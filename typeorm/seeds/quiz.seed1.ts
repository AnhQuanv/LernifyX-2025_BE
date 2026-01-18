import { DataSource } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';
import { QuizQuestion } from '../../src/modules/quiz_question/entities/quiz_question.entity';
import { QuizOption } from '../../src/modules/quiz_option/entities/quiz_option.entity';
import { v4 as uuidv4 } from 'uuid';

interface QuizSample {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const seedQuiz1 = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const questionRepo = dataSource.getRepository(QuizQuestion);
  const optionRepo = dataSource.getRepository(QuizOption);

  const allCourses = await courseRepo.find({
    relations: ['chapters', 'chapters.lessons'],
  });

  if (!allCourses.length) {
    console.log('⚠️ Không tìm thấy khóa học nào');
    return;
  }

  const sampleQuizzes: QuizSample[] = [
    {
      question: 'Mục tiêu chính của bài học này là gì?',
      options: ['Tổng quan', 'Thực hành', 'Giải thích lý thuyết', 'Kiểm tra'],
      correctAnswer: 0,
    },
    {
      question: 'Khẳng định nào sau đây là đúng về nội dung vừa học?',
      options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correctAnswer: 1,
    },
  ];

  // Chỉ lấy 70% khóa học ngẫu nhiên để seed
  const randomCourses = allCourses.filter(() => Math.random() < 0.7);

  for (const course of randomCourses) {
    const sortedLessons = course.chapters
      .sort((a, b) => a.order - b.order)
      .flatMap((chapter) => chapter.lessons.sort((a, b) => a.order - b.order));

    for (let index = 0; index < sortedLessons.length; index++) {
      const lesson = sortedLessons[index];

      // Logic: Bài 1 luôn có quiz, các bài sau 40% có quiz
      const shouldCreateQuiz = index === 0 ? true : Math.random() < 0.4;
      if (!shouldCreateQuiz) continue;

      const exists = await questionRepo.findOne({
        where: { lesson: { id: lesson.id } },
      });
      if (exists) continue;

      for (let i = 0; i < sampleQuizzes.length; i++) {
        const q = sampleQuizzes[i];
        const question = questionRepo.create({
          id: uuidv4(),
          question: q.question,
          lesson,
          order: i + 1,
        });
        const savedQuestion = await questionRepo.save(question);

        const options = await Promise.all(
          q.options.map((opt) =>
            optionRepo.save(
              optionRepo.create({
                id: uuidv4(),
                text: opt,
                question: savedQuestion,
              }),
            ),
          ),
        );

        savedQuestion.correctOptionId = options[q.correctAnswer].id;
        await questionRepo.save(savedQuestion);
      }
    }
  }
  console.log('🎉 Seed Quiz hoàn tất!');
};
