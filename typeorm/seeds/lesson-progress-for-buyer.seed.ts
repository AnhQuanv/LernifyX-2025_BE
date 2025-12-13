import { Course } from '../../src/modules/course/entities/course.entity';
import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { DataSource, In } from 'typeorm';

const COURSE_TITLES_TO_SEED: string[] = [
  'Lập Trình Front-end Chuyên Sâu với Webpack và Bundling',
  'Xây Dựng Framework/Thư Viện Frontend từ Đầu bằng Vanilla JavaScript',
  'Performance Optimization: Tối Ưu Hóa Tốc Độ Website Frontend',
  'Lập Trình Web Socket Thời Gian Thực với Socket.IO và React',
  'Lập Trình Frontend Nâng Cao với Svelte và SvelteKit',
  'Thành Thạo TypeScript: Từ Zero đến Chuyên Sâu',
  'Fullstack Next.js 14 & Prisma: Xây Dựng Ứng Dụng E-commerce',
  'Lập Trình Web Cơ Bản: HTML5, CSS3 và JavaScript ES6',
  'Xây Dựng Ứng Dụng Tương Tác Cao với Vue.js 3',
  'Khóa Học Phát Triển Toàn Diện React & Redux',
];

export const seedLessonProgressForBuyers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const courseRepo = dataSource.getRepository(Course);

  // 1️⃣ Lấy 10 buyers
  const buyerEmails = Array.from(
    { length: 10 },
    (_, i) => `buyer_${i + 1}@seed-data.com`,
  );
  const buyers = await userRepo.find({
    where: { email: In(buyerEmails) },
  });

  if (buyers.length === 0) {
    console.log('⚠️ Không tìm thấy buyers nào. Hãy seed users trước.');
    return;
  }

  // 2️⃣ Lấy khóa học + relation chapters.lessons
  const courses = await courseRepo.find({
    where: { title: In(COURSE_TITLES_TO_SEED) },
    relations: ['chapters', 'chapters.lessons'],
  });

  if (courses.length === 0) {
    console.log('⚠️ Không tìm thấy khóa học nào. Hãy seed courses trước.');
    return;
  }

  // 3️⃣ Seed lesson progress
  for (const buyer of buyers) {
    for (const course of courses) {
      // Sắp xếp chapter + lesson theo order
      const sortedChapters = course.chapters
        .sort((a, b) => a.order - b.order)
        .map((ch) => ({
          ...ch,
          lessons: ch.lessons.sort((a, b) => a.order - b.order),
        }));

      const sortedLessons = sortedChapters.flatMap((ch) => ch.lessons);

      // Ví dụ: mỗi buyer hoàn thành 2 lessons đầu tiên
      const lessonsToComplete = sortedLessons.slice(0, 2);

      for (const lesson of lessonsToComplete) {
        const exists = await progressRepo.findOne({
          where: { user: { userId: buyer.userId }, lesson: { id: lesson.id } },
        });
        if (exists) continue;

        const progress = progressRepo.create({
          user: buyer,
          lesson,
          completed: true,
          lastPosition: 0,
        });
        await progressRepo.save(progress);
      }
    }
    console.log(`✅ Seeded lesson progress cho user: ${buyer.email}`);
  }

  console.log('✅ Hoàn tất seed lesson progress cho tất cả buyers.');
};
