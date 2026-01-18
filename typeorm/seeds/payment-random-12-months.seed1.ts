import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Payment } from '../../src/modules/payment/entities/payment.entity';
import { PaymentItem } from '../../src/modules/payment_items/entities/payment_item.entity';
import { Course } from '../../src/modules/course/entities/course.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/role/entities/role.entity';
import { LessonProgress } from '../../src/modules/lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';

// --- CẤU HÌNH ---
const PLATFORM_FEE_RATE = 0.1;
const GATEWAYS = ['VNPAY', 'MOMO', 'BANK_TRANSFER'];

const COURSE_REVIEW_TEXTS = [
  'Khóa học rất tuyệt vời, kiến thức thực tế!',
  'Giảng viên dạy rất dễ hiểu, mình đã áp dụng được ngay.',
  'Nội dung chuyên sâu, đáng đồng tiền bát gạo.',
  'Chất lượng video tốt, bài tập thực hành rất hay.',
  'Rất hài lòng với lộ trình học tập của Learnify.',
];

export async function paymentSeedFromSept2025(dataSource: DataSource) {
  const paymentRepo = dataSource.getRepository(Payment);
  const paymentItemRepo = dataSource.getRepository(PaymentItem);
  const courseRepo = dataSource.getRepository(Course);
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const progressRepo = dataSource.getRepository(LessonProgress);
  const commentRepo = dataSource.getRepository(Comment);

  console.log('🚀 BẮT ĐẦU SEED DỮ LIỆU (TỪ 09/2025 ĐẾN NAY)...');

  // Lấy khóa học nhưng chỉ lấy các thông tin cần thiết để tính toán
  const allCourses = await courseRepo.find({
    where: { status: 'published' },
    relations: ['chapters', 'chapters.lessons'],
  });

  if (allCourses.length === 0) return console.log('⚠️ Hãy seed Course trước!');
  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  if (!studentRole) return console.log('⚠️ Không tìm thấy role student!');

  // BƯỚC 0: Reset bằng Raw Query (Đảm bảo tên bảng khớp với DB của bạn, ví dụ 'course')
  console.log('🔄 Resetting course statistics...');
  await dataSource.query(
    'UPDATE course SET students = 0, rating = 0, ratingCount = 0',
  );

  const hashedPassword = await bcrypt.hash('123456', 10);
  const targetDates = getDatesFromSept2025();

  const courseWeights = allCourses.map((c) => ({
    courseId: c.id,
    originalPrice: Number(c.originalPrice) || 0,
    lessons: c.chapters.flatMap((ch) => ch.lessons),
    weight: Math.random() > 0.8 ? 15 : Math.random() > 0.5 ? 7 : 3,
  }));

  let totalUserCreated = 0;

  for (const targetMonth of targetDates) {
    const batchUsers: User[] = [];
    const batchPayments: Payment[] = [];
    const batchItems: any[] = []; // Dùng any để tránh strict type check khi gán ID
    const batchComments: any[] = [];
    const batchProgress: any[] = [];

    for (const item of courseWeights) {
      const salesCount =
        Math.floor(Math.random() * item.weight) + (item.weight > 10 ? 3 : 1);

      for (let i = 0; i < salesCount; i++) {
        totalUserCreated++;
        const fullName = generateVietnameseName();
        const email = `${removeVietnameseTones(fullName)}.${Date.now()}.${totalUserCreated}@learnify.vn`;
        const regDate = getRandomDateInMonth(targetMonth);
        const payDate = new Date(regDate.getTime() + 1000 * 60 * 15);

        // 1. Tạo User
        const user = userRepo.create({
          fullName,
          email,
          password: hashedPassword,
          isActive: true,
          role: studentRole,
          createdAt: regDate,
        });
        batchUsers.push(user);

        // 2. Tạo Payment
        const payment = paymentRepo.create({
          user, // Gán trực tiếp object user vừa tạo (TypeORM sẽ tự lấy ID sau khi save)
          amount: Math.round(item.originalPrice * (1 + PLATFORM_FEE_RATE)),
          status: 'success',
          gateway: GATEWAYS[Math.floor(Math.random() * GATEWAYS.length)],
          currency: 'VND',
          transaction_ref: `TXN_${payDate.getTime()}_${totalUserCreated}`,
          paid_at: payDate,
        });
        batchPayments.push(payment);

        // 3. Tạo Item - CHỈ GÁN ID KHÓA HỌC (Quan trọng để tránh lỗi Update)
        batchItems.push(
          paymentItemRepo.create({
            payment,
            course: { id: item.courseId } as any,
            price: item.originalPrice,
          }),
        );

        // 4. Đánh giá
        if (Math.random() > 0.4) {
          batchComments.push(
            commentRepo.create({
              user,
              course: { id: item.courseId } as any,
              type: 'course',
              content:
                COURSE_REVIEW_TEXTS[
                  Math.floor(Math.random() * COURSE_REVIEW_TEXTS.length)
                ],
              rating: item.weight > 10 ? 5 : 4,
              createdAt: new Date(payDate.getTime() + 86400000),
            }),
          );
        }

        // 5. Tiến độ
        const completed = item.lessons.slice(
          0,
          Math.floor(Math.random() * 3) + 1,
        );
        completed.forEach((l) => {
          batchProgress.push(
            progressRepo.create({
              user,
              lesson: { id: l.id } as any,
              completed: true,
              updatedAt: payDate,
            }),
          );
        });
      }
    }

    // Lưu dữ liệu theo thứ tự để đảm bảo quan hệ ID
    if (batchUsers.length > 0) {
      await userRepo.save(batchUsers, { chunk: 200 });
      await paymentRepo.save(batchPayments, { chunk: 200 });
      await paymentItemRepo.save(batchItems, { chunk: 200 });
      await commentRepo.save(batchComments, { chunk: 200 });
      await progressRepo.save(batchProgress, { chunk: 500 });
    }
    console.log(
      `✅ Tháng ${targetMonth.getMonth() + 1}/${targetMonth.getFullYear()}: +${batchUsers.length} học viên.`,
    );
  }

  // BƯỚC CUỐI: Cập nhật stats
  console.log('🔄 Đang đồng bộ chỉ số khóa học...');
  for (const item of courseWeights) {
    const [ratings, count] = await Promise.all([
      commentRepo.find({
        where: { course: { id: item.courseId }, type: 'course' },
      }),
      paymentItemRepo.count({ where: { course: { id: item.courseId } } }),
    ]);

    const rCount = ratings.length;
    const rValue =
      rCount > 0
        ? parseFloat(
            (ratings.reduce((s, r) => s + (r.rating || 0), 0) / rCount).toFixed(
              1,
            ),
          )
        : 0;

    await dataSource.query(
      'UPDATE course SET students = ?, rating = ?, ratingCount = ? WHERE id = ?',
      [count, rValue, rCount, item.courseId],
    );
  }

  console.log(`\n✨ HOÀN TẤT SEED!`);
}

// --- HÀM HỖ TRỢ ---
function getDatesFromSept2025(): Date[] {
  const dates: Date[] = [];
  const start = new Date(2025, 8, 1);
  const now = new Date();
  let current = new Date(start);
  while (current <= now) {
    dates.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return dates;
}

function getRandomDateInMonth(targetDate: Date): Date {
  const d = new Date(targetDate);
  const now = new Date();
  const isCurrentMonth =
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const maxDay = isCurrentMonth ? now.getDate() : 28;
  d.setDate(Math.floor(Math.random() * maxDay) + 1);
  d.setHours(Math.floor(Math.random() * 23), Math.floor(Math.random() * 59));
  return d;
}

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
  const f = [
    'Nguyễn',
    'Trần',
    'Lê',
    'Phạm',
    'Hoàng',
    'Vũ',
    'Phan',
    'Huỳnh',
    'Đặng',
    'Bùi',
  ];
  const m = [
    'Văn',
    'Thị',
    'Minh',
    'Anh',
    'Quốc',
    'Thanh',
    'Ngọc',
    'Đức',
    'Gia',
    'Bảo',
  ];
  const l = [
    'An',
    'Bình',
    'Chi',
    'Dũng',
    'Hương',
    'Linh',
    'Nam',
    'Phúc',
    'Tâm',
    'Trang',
  ];
  return `${f[Math.floor(Math.random() * f.length)]} ${m[Math.floor(Math.random() * m.length)]} ${l[Math.floor(Math.random() * l.length)]}`;
}
