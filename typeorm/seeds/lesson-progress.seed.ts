import { Course } from '../../src/modules/course/entities/course.entity';
import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';

export const seedLessonProgress = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const courseRepo = dataSource.getRepository(Course);

  const student = await userRepo.findOne({ where: { email: 'b@example.com' } });
  if (!student) {
    console.log('⚠️ User not found');
    return;
  }

  const coursesToSeed = [
    {
      title: 'Khóa Học Phát Triển Toàn Diện React & Redux',
      lessonsToComplete: 2,
    },
    {
      title: 'Masterclass Lập Trình Backend với Node.js & Express',
      lessonsToComplete: 2,
    },
    {
      title: 'Python Toàn Diện cho Khoa Học Dữ Liệu và Phân Tích',
      lessonsToComplete: 3,
    },
  ];

  for (const { title, lessonsToComplete } of coursesToSeed) {
    const course = await courseRepo.findOne({
      where: { title },
      relations: ['chapters', 'chapters.lessons'],
    });

    if (!course) {
      console.log(`⚠️ Course not found: ${title}`);
      continue;
    }

    // 🟦 1. Sort chapters + lessons theo order
    const sortedChapters = course.chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => ({
        ...ch,
        lessons: ch.lessons.sort((a, b) => a.order - b.order),
      }));

    const sortedLessons = sortedChapters.flatMap((c) => c.lessons);

    const lessonsToSeedArr = sortedLessons.slice(0, lessonsToComplete);

    for (const lesson of lessonsToSeedArr) {
      const exists = await progressRepo.findOne({
        where: { user: { userId: student.userId }, lesson: { id: lesson.id } },
      });
      if (exists) continue;

      const progress = progressRepo.create({
        user: student,
        lesson,
        completed: true,
        lastPosition: 0,
      });

      await progressRepo.save(progress);
    }

    console.log(
      `✅ Seeded ${lessonsToComplete} lessons progress for course: ${title}`,
    );
  }
};
