import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Payment } from '../../src/modules/payment/entities/payment.entity';
import { PaymentItem } from '../../src/modules/payment_items/entities/payment_item.entity';
import { Course } from '../../src/modules/course/entities/course.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/role/entities/role.entity';

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

const GATEWAYS = ['VNPAY', 'MOMO'];
const PLATFORM_FEE_RATE = 0.1;
const FIXED_NUMBER_OF_BUYERS = 10; // Số Buyers ban đầu được tạo
const MAX_MONTHS_TO_SEED = 12;

// Phạm vi giao dịch duy nhất (1-3 người mua khác nhau) cho mỗi khóa học
const MIN_TRANSACTIONS_PER_MONTH = 1;
const MAX_TRANSACTIONS_PER_MONTH = 3;

// --- HÀM TIỆN ÍCH ---

const getTargetDatesForLastYear = (maxMonths: number): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < maxMonths; i++) {
    const d = new Date();
    d.setDate(15);
    d.setMonth(d.getMonth() - i);
    dates.push(d);
  }
  return dates;
};

const getRandomDateInMonth = (targetDate: Date): Date => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);

  const resultDate = new Date(year, month, randomDay, randomHour, randomMinute);
  return resultDate;
};

// --- HÀM SEED CHÍNH ---

export async function paymentSeed(dataSource: DataSource) {
  const paymentRepo = dataSource.getRepository(Payment);
  const paymentItemRepo = dataSource.getRepository(PaymentItem);
  const courseRepo = dataSource.getRepository(Course);
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  console.log('--- BẮT ĐẦU SEED DOANH THU (PAYMENTS) ---');

  const courses = await courseRepo.find({
    where: { title: In(COURSE_TITLES_TO_SEED) },
  });
  if (courses.length === 0) {
    console.log(
      'Không tìm thấy khóa học để seed doanh thu. Hãy seed course trước.',
    );
    return;
  }

  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  if (!studentRole) {
    console.error('Không tìm thấy Role "student". Seed roles trước.');
    return;
  }

  // 1. Chuẩn bị Buyers (Tạo 10 Buyers ban đầu nếu chưa có)
  const initialBuyerEmails = Array.from(
    { length: FIXED_NUMBER_OF_BUYERS },
    (_, i) => `buyer_${i + 1}@seed-data.com`,
  );
  let buyers = await userRepo.find({
    where: { email: In(initialBuyerEmails) },
  });

  // --- Logic đảm bảo 10 Buyers ban đầu tồn tại ---
  let nextBuyerIndex = buyers.length + 1;
  if (buyers.length < FIXED_NUMBER_OF_BUYERS) {
    const existingEmails = new Set(buyers.map((b) => b.email));
    const newBuyers: User[] = [];

    for (let i = 1; i <= FIXED_NUMBER_OF_BUYERS; i++) {
      const email = `buyer_${i}@seed-data.com`;
      if (!existingEmails.has(email)) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        newBuyers.push(
          userRepo.create({
            fullName: `Buyer Seed User ${i}`,
            email,
            password: hashedPassword,
            isActive: true,
            role: studentRole,
            phone: `09091234${i.toString().padStart(2, '0')}`,
            dateOfBirth: '1990-01-01',
            address: 'Hà Nội',
          }),
        );
      }
    }
    if (newBuyers.length > 0) {
      await userRepo.save(newBuyers);
      // Lấy lại danh sách đầy đủ sau khi chèn mới
      buyers = await userRepo.find({
        where: { email: In(initialBuyerEmails) },
      });
      nextBuyerIndex = buyers.length + 1;
      console.log(`Đã tạo ${newBuyers.length} buyer mới (ban đầu).`);
    }
  }
  console.log(`Tổng số buyers ban đầu sẵn sàng: ${buyers.length}`);
  // ------------------------------------------------

  // Set để theo dõi các cặp (courseId, buyerId) đã được tạo giao dịch
  // Đảm bảo: User A chỉ mua Course X một lần
  const purchasedPairs = new Set<string>();

  const randomRef = () =>
    `TXN_${Date.now()}_${Math.floor(Math.random() * 90000) + 10000}`;

  let totalTransactions = 0;
  const targetDates = getTargetDatesForLastYear(MAX_MONTHS_TO_SEED);

  // --- Vòng lặp Chính: Tạo Giao dịch ---
  for (const course of courses) {
    const coursePrice = course.originalPrice as number;

    if (coursePrice === null || coursePrice === undefined) continue;

    const amountPaidByStudent = coursePrice * (1 + PLATFORM_FEE_RATE);
    const finalAmount = parseFloat(amountPaidByStudent.toFixed(2));

    // 2. Tính tổng số giao dịch duy nhất CẦN THIẾT cho khóa học này trong 12 tháng
    // Số lượng này bằng số lượng Buyers khác nhau cần thiết cho Course này.
    const numUniqueBuyersNeeded =
      Math.floor(
        Math.random() *
          (MAX_TRANSACTIONS_PER_MONTH - MIN_TRANSACTIONS_PER_MONTH + 1),
      ) + MIN_TRANSACTIONS_PER_MONTH;

    const totalTransactionsForCourse =
      numUniqueBuyersNeeded * MAX_MONTHS_TO_SEED;

    for (let i = 0; i < numUniqueBuyersNeeded; i++) {
      let buyer: User | null = null;

      while (true) {
        const potentialBuyer =
          buyers[Math.floor(Math.random() * buyers.length)];
        const pairKey = `${course.id}-${potentialBuyer.userId}`;

        if (!purchasedPairs.has(pairKey)) {
          // Buyer này chưa mua khóa học này -> Hợp lệ
          buyer = potentialBuyer;
          purchasedPairs.add(pairKey);
          break;
        } else {
          const email = `buyer_${nextBuyerIndex}@seed-data.com`;
          const hashedPassword = await bcrypt.hash('123456', 10);

          const newBuyer = userRepo.create({
            fullName: `Buyer Seed User ${nextBuyerIndex}`,
            email,
            password: hashedPassword,
            isActive: true,
            role: studentRole,
            phone: `09091234${nextBuyerIndex.toString().padStart(2, '0')}`,
            dateOfBirth: '1990-01-01',
            address: 'Hà Nội',
          });

          const savedNewBuyer = await userRepo.save(newBuyer);
          buyers.push(savedNewBuyer); // Cập nhật danh sách buyers
          nextBuyerIndex++;

          buyer = savedNewBuyer;
          purchasedPairs.add(`${course.id}-${buyer.userId}`);
          break;
        }
      }

      if (!buyer) continue;

      const targetMonthDate =
        targetDates[Math.floor(Math.random() * targetDates.length)];
      const paidDate = getRandomDateInMonth(targetMonthDate);

      const transactionRef = randomRef();
      const gateway = GATEWAYS[Math.floor(Math.random() * GATEWAYS.length)];

      const payment = paymentRepo.create({
        user: buyer,
        amount: finalAmount,
        status: 'success',
        gateway,
        currency: 'VND',
        transaction_ref: transactionRef,
        pay_url: 'https://gateway.mock/payment',
        paid_at: paidDate,
        message: 'Thanh toán thành công',
        bankCode: gateway === 'VNPAY' ? 'NCB' : 'MOMO',
        response_code: '00',
        raw_response: { code: '00', amount: String(finalAmount * 100) },
      });

      const savedPayment = await paymentRepo.save(payment);

      const item = paymentItemRepo.create({
        payment: savedPayment,
        course,
        price: coursePrice,
      });

      await paymentItemRepo.save(item);
      totalTransactions++;
    }
  }

  console.log(
    `Seed doanh thu hoàn tất! Tạo ${totalTransactions} giao dịch (${courses.length} khóa học).`,
  );
  console.log(`Tổng số Buyers được tạo ra/sử dụng cuối cùng: ${buyers.length}`);
}
