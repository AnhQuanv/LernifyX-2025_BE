import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { DataSource, In, IsNull } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';

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

export const seedLessonCommentsForBuyers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const commentRepo = dataSource.getRepository(Comment);
  const courseRepo = dataSource.getRepository(Course);

  const buyerEmails = Array.from(
    { length: 10 },
    (_, i) => `buyer_${i + 1}@seed-data.com`,
  );
  const buyers = await userRepo.find({ where: { email: In(buyerEmails) } });

  if (buyers.length === 0) {
    console.log('⚠️ Không tìm thấy buyers. Hãy seed users trước.');
    return;
  }

  const courses = await courseRepo.find({
    where: { title: In(COURSE_TITLES_TO_SEED) },
    relations: ['chapters', 'chapters.lessons'],
  });

  if (courses.length === 0) {
    console.log('⚠️ Không tìm thấy khóa học. Hãy seed courses trước.');
    return;
  }

  console.log(`--- BẮT ĐẦU SEED COMMENTS CHO LESSON ---`);

  for (const course of courses) {
    const sortedChapters = course.chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => ({
        ...ch,
        lessons: ch.lessons.sort((a, b) => a.order - b.order),
      }));

    const lessons = sortedChapters.flatMap((ch) => ch.lessons);

    const numberOfCourseComments = 5; // mỗi course 5 comment

    const usersWhoHaveNotCommented = buyers.slice(); // copy array

    for (let i = 0; i < numberOfCourseComments; i++) {
      if (usersWhoHaveNotCommented.length === 0) break; // hết user để comment

      const idx = Math.floor(Math.random() * usersWhoHaveNotCommented.length);
      const courseUser = usersWhoHaveNotCommented[idx];

      usersWhoHaveNotCommented.splice(idx, 1);

      const courseContentOptions = [
        `Khóa học "${course.title}" rất hữu ích và chất lượng!`,
        `Mình đánh giá cao nội dung khóa ${course.title}.`,
        `Khóa ${course.title} thật tuyệt, giảng viên trình bày rõ ràng.`,
        `Rất hài lòng với khóa học ${course.title}!`,
        `Khóa học ${course.title} cung cấp nhiều kiến thức giá trị.`,
      ];
      const courseContent =
        courseContentOptions[
          Math.floor(Math.random() * courseContentOptions.length)
        ];

      const courseComment = commentRepo.create({
        user: courseUser,
        course,
        lesson: null,
        content: courseContent,
        type: 'course',
        rating: Math.floor(Math.random() * 5) + 1, // rating từ 1-5
        parent: null,
      });

      await commentRepo.save(courseComment);
      console.log(
        `✅ Tạo comment COURSE: ${course.title} bởi ${courseUser.fullName}`,
      );
    }

    // ---- Comment cho LESSON ----
    for (const lesson of lessons) {
      const mainUser = buyers[Math.floor(Math.random() * buyers.length)];

      let mainComment = await commentRepo.findOne({
        where: {
          user: { userId: mainUser.userId },
          lesson: { id: lesson.id },
          parent: IsNull(),
        },
      });

      if (!mainComment) {
        const mainContentOptions = [
          `Bài giảng "${lesson.title}" rất dễ hiểu, cảm ơn giảng viên!`,
          `Mình thấy ${lesson.title} khá chi tiết và hữu ích.`,
          `Bài học ${lesson.title} trong khóa ${course.title} thật tuyệt.`,
        ];
        const mainContent =
          mainContentOptions[
            Math.floor(Math.random() * mainContentOptions.length)
          ];

        mainComment = commentRepo.create({
          user: mainUser,
          lesson,
          course: null, // Không liên quan course
          content: mainContent,
          type: 'lesson',
          rating: null, // lesson không có rating
          parent: null,
        });
        await commentRepo.save(mainComment);
        console.log(
          `✅ Tạo bình luận chính cho LESSON: ${lesson.title} bởi ${mainUser.fullName}`,
        );
      }

      // ---- Reply CHỈ CHO LESSON ----
      const numberOfReplies = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numberOfReplies; i++) {
        const replyUser = buyers[Math.floor(Math.random() * buyers.length)];
        if (replyUser.userId === mainUser.userId) continue;

        const replyContentOptions = [
          `Đúng vậy, bài này rất hay!`,
          `@${mainUser.fullName} mình cũng gặp vấn đề tương tự, bạn thử lại nhé.`,
          `Cảm ơn chia sẻ, bài này hữu ích cho mình!`,
        ];
        const replyContent =
          replyContentOptions[
            Math.floor(Math.random() * replyContentOptions.length)
          ];

        const replyComment = commentRepo.create({
          user: replyUser,
          lesson, // reply chỉ cho lesson
          course: null,
          content: replyContent,
          type: 'lesson',
          rating: null,
          parent: mainComment,
        });
        await commentRepo.save(replyComment);
        console.log(
          `Tạo reply cho bình luận LESSON: ${mainComment.id} bởi ${replyUser.fullName}`,
        );
      }
    }
  }
};
