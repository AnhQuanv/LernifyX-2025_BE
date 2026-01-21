import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Payment } from '../../src/modules/payment/entities/payment.entity';
import { PaymentItem } from '../../src/modules/payment_items/entities/payment_item.entity';
import { Course } from '../../src/modules/course/entities/course.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/role/entities/role.entity';
import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';

// --- CẤU HÌNH & DỮ LIỆU MẪU ---
const PLATFORM_FEE_RATE = 0.1;
const GATEWAYS = ['VNPAY', 'MOMO'];
const MAX_MONTHS_TO_SEED = 12;

const FIRST_NAMES = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
];
const MIDDLE_NAMES = [
  'Văn',
  'Thị',
  'Minh',
  'Anh',
  'Đức',
  'Hồng',
  'Quốc',
  'Ngọc',
  'Gia',
  'Bảo',
  'Thanh',
  'Quang',
  'Trọng',
  'Tuấn',
];
const LAST_NAMES = [
  'An',
  'Bình',
  'Chi',
  'Dũng',
  'Em',
  'Giang',
  'Hương',
  'Khánh',
  'Linh',
  'Nam',
  'Phúc',
  'Quân',
  'Sơn',
  'Trang',
  'Vinh',
  'Tâm',
  'Thảo',
  'Huy',
  'Tùng',
  'Phong',
];

const COURSE_REVIEW_TEXTS = [
  'Khóa học rất tuyệt vời, kiến thức thực tế!',
  'Giảng viên dạy rất dễ hiểu, mình đã áp dụng được ngay.',
  'Nội dung chuyên sâu, đáng đồng tiền bát gạo.',
  'Chất lượng video tốt, bài tập thực hành rất hay.',
  'Rất hài lòng với lộ trình học tập của Learnify.',
];

const LESSON_COMMENT_TEXTS = [
  'Đoạn này mình thấy rất hay, cảm ơn giảng viên!',
  'Bài học này giải quyết được vấn đề mình đang gặp phải.',
  'Kiến thức bài này hơi khó nhưng rất đáng để học.',
  'Giảng viên giải thích phần này rất chi tiết.',
];

// --- HÀM HỖ TRỢ ---
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');
}

function generateVietnameseName(): string {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const m = MIDDLE_NAMES[Math.floor(Math.random() * MIDDLE_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${m} ${l}`;
}

function getTargetDatesForLastYear(maxMonths: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  for (let i = maxMonths; i >= 0; i--) {
    dates.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return dates;
}

// function getRandomDateInMonth(targetDate: Date): Date {
//   const now = new Date();
//   const isCurrentMonth =
//     targetDate.getFullYear() === now.getFullYear() &&
//     targetDate.getMonth() === now.getMonth();
//   const maxDay = isCurrentMonth ? now.getDate() : 28;
//   const randomDay = Math.floor(Math.random() * maxDay) + 1;
//   const date = new Date(
//     targetDate.getFullYear(),
//     targetDate.getMonth(),
//     randomDay,
//     Math.floor(Math.random() * 23),
//     Math.floor(Math.random() * 59),
//   );
//   return date > now ? now : date;
// }

function getRandomDateInMonth(targetDate: Date): Date {
  const now = new Date();
  const isCurrentMonth =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth();
  const lastDayOfTargetMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0,
  ).getDate();
  const maxDay = isCurrentMonth ? now.getDate() : lastDayOfTargetMonth;

  const randomDay = Math.floor(Math.random() * maxDay) + 1;

  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    randomDay,
    Math.floor(Math.random() * 23),
    Math.floor(Math.random() * 59),
  );

  return date > now ? now : date;
}

// --- HÀM SEED CHÍNH ---
export async function paymentSeedFor12Month(dataSource: DataSource) {
  const paymentRepo = dataSource.getRepository(Payment);
  const paymentItemRepo = dataSource.getRepository(PaymentItem);
  const courseRepo = dataSource.getRepository(Course);
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const commentRepo = dataSource.getRepository(Comment);

  console.log(
    '--- BẮT ĐẦU SEED TỔNG HỢP: USER, PAYMENT, PROGRESS, COMMENT ---',
  );

  const allCourses = await courseRepo.find({
    where: { status: 'published' },
    relations: ['chapters', 'chapters.lessons'],
  });

  if (allCourses.length === 0) return console.log('⚠️ Hãy seed Course trước!');
  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  if (!studentRole) return console.log('⚠️ Không tìm thấy role student!');

  const hashedPassword = await bcrypt.hash('123456', 10);
  const targetDates = getTargetDatesForLastYear(MAX_MONTHS_TO_SEED);
  let totalTransactions = 0;

  for (const targetMonth of targetDates) {
    const activeCourses = allCourses.filter(() => Math.random() > 0.3);

    for (const course of activeCourses) {
      const salesCount = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < salesCount; i++) {
        const fullName = generateVietnameseName();
        const email = `${removeVietnameseTones(fullName)}.${Math.floor(Math.random() * 10000)}@learnify.vn`;
        const paidDate = getRandomDateInMonth(targetMonth);

        // 1. Tạo User
        const savedUser = await userRepo.save(
          userRepo.create({
            fullName,
            email,
            password: hashedPassword,
            isActive: true,
            role: studentRole,
            createdAt: paidDate,
          }),
        );

        // 2. Tạo Payment
        const coursePrice = Number(course.originalPrice) || 0;
        const savedPayment = await paymentRepo.save(
          paymentRepo.create({
            user: savedUser,
            amount: parseFloat(
              (coursePrice * (1 + PLATFORM_FEE_RATE)).toFixed(2),
            ),
            status: 'success',
            gateway: GATEWAYS[Math.floor(Math.random() * GATEWAYS.length)],
            currency: 'VND',
            transaction_ref: `TXN_${paidDate.getTime()}_${Math.floor(Math.random() * 1000)}`,
            paid_at: paidDate,
            message: `Học viên ${fullName} tham gia khóa học`,
            created_at: paidDate,
          }),
        );

        // 3. Tạo PaymentItem
        await paymentItemRepo.save(
          paymentItemRepo.create({
            payment: savedPayment,
            course,
            price: coursePrice,
          }),
        );

        // 4. Đánh giá khóa học (Course Rating/Review)
        await commentRepo.save(
          commentRepo.create({
            user: savedUser,
            course: course,
            content:
              COURSE_REVIEW_TEXTS[
                Math.floor(Math.random() * COURSE_REVIEW_TEXTS.length)
              ],
            type: 'course',
            rating: Math.floor(Math.random() * 2) + 4,
            createdAt: paidDate,
          }),
        );

        // 5. Seed Tiến độ & Bình luận bài học
        const sortedLessons = course.chapters
          .sort((a, b) => a.order - b.order)
          .flatMap((ch) => ch.lessons.sort((a, b) => a.order - b.order));

        const lessonsToComplete = sortedLessons.slice(0, 2);
        for (const lesson of lessonsToComplete) {
          // Lưu tiến độ
          await progressRepo.save(
            progressRepo.create({
              user: savedUser,
              lesson,
              completed: true,
              lastPosition: 0,
              updatedAt: paidDate,
            }),
          );

          // Lưu bình luận bài học (Lesson Comment)
          await commentRepo.save(
            commentRepo.create({
              user: savedUser,
              lesson: lesson,
              course: course,
              content:
                LESSON_COMMENT_TEXTS[
                  Math.floor(Math.random() * LESSON_COMMENT_TEXTS.length)
                ],
              type: 'lesson',
              rating: null,
              createdAt: paidDate,
            }),
          );
        }

        totalTransactions++;
      }
    }
    console.log(
      `✅ Hoàn thành tháng ${targetMonth.getMonth() + 1}/${targetMonth.getFullYear()}`,
    );
  }

  console.log(`\n--- TỔNG KẾT ---`);
  console.log(`- Học viên & Giao dịch: ${totalTransactions}`);
  console.log(`- Đánh giá khóa học: ${totalTransactions}`);
  console.log(`- Bình luận bài học: ${totalTransactions * 2}`);
}
