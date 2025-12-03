import { DataSource } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';
import { QuizQuestion } from '../../src/modules/quiz_question/entities/quiz_question.entity';
import { QuizOption } from '../../src/modules/quiz_option/entities/quiz_option.entity';

export const seedQuiz = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const questionRepo = dataSource.getRepository(QuizQuestion);
  const optionRepo = dataSource.getRepository(QuizOption);

  const coursesToSeed = [
    'Khóa Học Phát Triển Toàn Diện React & Redux',
    'Masterclass Lập Trình Backend với Node.js & Express',
    'Python Toàn Diện cho Khoa Học Dữ Liệu và Phân Tích',
  ];

  const sampleQuizzes = [
    {
      question: 'What is the main purpose of this lesson?',
      options: [
        'Overview',
        'Hands-on practice',
        'Theory explanation',
        'Assessment',
      ],
      correctAnswer: 0,
    },
    {
      question: 'Which statement is correct?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 1,
    },
    {
      question: 'What should you do next?',
      options: [
        'Continue learning',
        'Stop here',
        'Review previous lesson',
        'Skip',
      ],
      correctAnswer: 2,
    },
  ];

  for (const title of coursesToSeed) {
    const course = await courseRepo.findOne({
      where: { title },
      relations: ['chapters', 'chapters.lessons'],
    });

    if (!course) {
      console.log(`⚠️ Course not found: ${title}`);
      continue;
    }

    console.log(`\n📘 Seeding quiz for course: ${title}`);

    const sortedLessons = course.chapters
      .sort((a, b) => a.order - b.order)
      .flatMap((chapter) => chapter.lessons.sort((a, b) => a.order - b.order));

    for (let index = 0; index < sortedLessons.length; index++) {
      const lesson = sortedLessons[index];
      console.log(`➡️ Lesson: ${lesson.title}`);

      // RULE 1: 2 lesson đầu tiên PHẢI có quiz
      let shouldCreateQuiz = false;

      if (index < 2) {
        shouldCreateQuiz = true; // Lesson 1 & 2 bắt buộc có quiz
        console.log('🟢 This is one of the first 2 lessons → MUST HAVE QUIZ');
      } else if (index === 2) {
        // Lesson thứ 3 dùng random
        shouldCreateQuiz = Math.random() < 0.5;
        console.log('🟡 Lesson #3 → random quiz:', shouldCreateQuiz);
      } else {
        // Các bài còn lại random bình thường
        shouldCreateQuiz = Math.random() < 0.5;
        console.log('🔘 Normal lesson → random quiz:', shouldCreateQuiz);
      }

      if (!shouldCreateQuiz) {
        console.log('⏭️ Lesson has NO quiz → skipping');
        continue;
      }

      // Check nếu lesson đã có quiz
      const exists = await questionRepo.findOne({
        where: { lesson: { id: lesson.id } },
      });

      if (exists) {
        console.log(`⚠️ Lesson already has quiz → skipping`);
        continue;
      }

      // CREATE QUIZ
      console.log(`⬇️ Creating quiz for lesson: ${lesson.title}`);

      for (let i = 0; i < sampleQuizzes.length; i++) {
        const q = sampleQuizzes[i];

        const question = questionRepo.create({
          question: q.question,
          lesson,
          order: i + 1,
        });
        const savedQuestion = await questionRepo.save(question);

        const options = await Promise.all(
          q.options.map((opt) =>
            optionRepo.save(
              optionRepo.create({
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

    console.log(`✅ Finished seeding quiz for course: ${title}`);
  }

  console.log('\n🎉 All quiz seeding finished!');
};
