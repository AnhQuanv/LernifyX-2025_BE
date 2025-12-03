import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { DataSource, IsNull } from 'typeorm';

export const seedLessonCommentsWithRandomUsers = async (
  dataSource: DataSource,
) => {
  const userRepo = dataSource.getRepository(User);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const commentRepo = dataSource.getRepository(Comment);

  // Lấy tất cả user để chọn ngẫu nhiên
  const users = await userRepo.find();
  if (!users.length) {
    console.log('⚠️ Không tìm thấy người dùng nào (users not found)');
    return;
  }

  // Lấy tất cả progress bài học đã được seed trước đó
  const progresses = await progressRepo.find({
    relations: ['lesson', 'user', 'lesson.chapter', 'lesson.chapter.course'],
  });

  console.log(
    `Bắt đầu seed bình luận cho ${progresses.length} bài học có tiến độ...`,
  );

  for (const progress of progresses) {
    const lesson = progress.lesson;
    const courseTitle = lesson.chapter.course?.title || 'Khóa học không tên';

    // Chọn ngẫu nhiên 1 user làm main comment
    const mainUser = users[Math.floor(Math.random() * users.length)];

    // 1. Kiểm tra nếu comment chính đã tồn tại
    let mainComment = await commentRepo.findOne({
      where: {
        user: { userId: mainUser.userId },
        lesson: { id: lesson.id },
        parent: IsNull(),
      },
    });

    if (!mainComment) {
      // 📝 Tạo nội dung bình luận chính bằng tiếng Việt
      const mainContentOptions = [
        `Bài giảng "${lesson.title}" này rất rõ ràng và dễ hiểu. Cảm ơn Giảng viên!`,
        `Có ai gặp lỗi ở phần code này không? Mình đã thử và thấy đoạn này hơi khó.`,
        `Thật tuyệt vời khi được học ${lesson.title} trong khóa ${courseTitle}.`,
        `Mình rất thích cách ${mainUser.fullName} giải thích vấn đề này. Rất chi tiết!`,
      ];
      const mainContent =
        mainContentOptions[
          Math.floor(Math.random() * mainContentOptions.length)
        ];

      mainComment = commentRepo.create({
        user: mainUser,
        lesson,
        course: lesson.chapter.course, // Đảm bảo gán course
        content: mainContent,
        type: 'lesson',
        rating: null,
        parent: null,
      });
      await commentRepo.save(mainComment);
      console.log(
        `✅ Tạo bình luận chính cho bài: ${lesson.title} (Khóa: ${courseTitle}) bởi ${mainUser.fullName}`,
      );
    }

    // 2. Tạo 1-2 comment reply ngẫu nhiên từ các user khác
    const numberOfReplies = Math.floor(Math.random() * 2) + 1; // 1 hoặc 2
    for (let i = 0; i < numberOfReplies; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Bỏ qua nếu user reply trùng với user comment chính
      if (randomUser.userId === mainUser.userId) continue;

      // 📝 Tạo nội dung trả lời bằng tiếng Việt
      const replyContentOptions = [
        `Đúng vậy, bài này hay nhất chương!`,
        `@${mainUser.fullName} bạn thử kiểm tra lại version thư viện xem sao.`,
        `Cảm ơn thông tin hữu ích của bạn! Mình cũng đang thắc mắc chỗ đó.`,
        `Mình đã áp dụng và thành công! Rất đáng học.`,
      ];
      const replyContent =
        replyContentOptions[
          Math.floor(Math.random() * replyContentOptions.length)
        ];

      const replyComment = commentRepo.create({
        user: randomUser,
        lesson,
        course: lesson.chapter.course, // Đảm bảo gán course
        content: replyContent,
        type: 'lesson',
        rating: null,
        parent: mainComment, // Quan trọng: thiết lập reply
      });

      await commentRepo.save(replyComment);
      console.log(
        `Tạo trả lời bởi ${randomUser.fullName} cho bình luận: ${mainComment.id}`,
      );
    }
  }

  console.log(`Hoàn tất seeding bình luận và trả lời cho các bài học.`);
};
