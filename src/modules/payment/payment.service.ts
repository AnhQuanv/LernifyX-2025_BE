import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { In, IsNull, Repository } from 'typeorm';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';
import { Course } from '../course/entities/course.entity';
import {
  HashAlgorithm,
  ignoreLogger,
  ProductCode,
  ReturnQueryFromVNPay,
  VNPay,
  VnpLocale,
} from 'vnpay';
import { applyTimeFilter, formatDate } from 'src/common/helpers/utils';
import { Response } from 'express';
import {
  MoMoCreateResponse,
  MoMoResponseMessages,
  MoMoReturnQuery,
  VNPayQuery,
} from './dto/vnpay-response';
import * as crypto from 'crypto';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';

interface MonthlyRevenueResult {
  monthYear: string;
  totalNetRevenue: string;
  gmv: string;
}

export interface DailyRevenueResult {
  paidDate: string;
  totalNetRevenue: string | number;
  totalGmv: string | number;
  newStudents: string | number;
}

export interface MonthlyRevenueData {
  name: string;
  revenue: number;
  gmv: number;
}

interface RawTopCourse {
  name: string;
  revenue: string | number;
}

interface RawTopCategory {
  name: string;
  revenue: string | number;
}

export interface WeeklyRevenueItem {
  dayOfWeek: string;
  date: string;
  totalNetRevenue: number;
  totalGmv: number;
  newStudents: number;
}

interface RawStatsResult {
  gmv: string | number | null;
  newStudents: string | number | null;
}

const PLATFORM_FEE_RATE = 0.1;
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentItem)
    private paymentItemRepo: Repository<PaymentItem>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Wishlist) private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
  ) {}

  async handleVNPay(payment: Payment, ipAddress?: string) {
    const vnPay = new VNPay({
      tmnCode: process.env.TMN_CODE!,
      secureSecret: process.env.HASH_SECRET!,
      vnpayHost: process.env.VNPAY_HOST!,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });

    const now = new Date();
    const expire = new Date(now.getTime() + 15 * 60 * 1000);

    const vnPayResponse = vnPay.buildPaymentUrl({
      vnp_Amount: payment.amount,
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_TxnRef: payment.transaction_ref,
      vnp_OrderType: ProductCode.Other,
      vnp_OrderInfo: payment.order_info,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(formatDate(now)),
      vnp_ExpireDate: Number(formatDate(expire)),
    });
    console.log('vnp_TxnRef:', payment.transaction_ref);
    payment.pay_url = vnPayResponse;
    await this.paymentRepo.save(payment);

    return vnPayResponse;
  }

  async handleCreatePaymentVNPay(
    userId: string,
    courseId: string[],
    gateway: string,
  ): Promise<Payment> {
    const courses = await this.courseRepo.findByIds(courseId);

    if (!courses || courses.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy  course',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const total = courses.reduce(
      (sum, course) => sum + Number(course.price),
      0,
    );

    const tax = Math.round(total * 0.1);
    const totalWithTax = total + tax;

    const transaction_ref = `TXN-${nanoid(8).toUpperCase()}`;
    // 3. Tạo Payment
    const payment = this.paymentRepo.create({
      user: { userId },
      amount: totalWithTax,
      status: 'pending',
      gateway,
      transaction_ref: transaction_ref,
      order_info: `Thanh toan VNPay cho don hang ${transaction_ref}`,
    });
    await this.paymentRepo.save(payment);

    // 4. Tạo PaymentItem cho từng course
    const items = courses.map((course) => {
      return this.paymentItemRepo.create({
        payment,
        course,
        price: course.price,
      });
    });
    await this.paymentItemRepo.save(items);

    return payment;
  }

  async handleVNPayReturn(query: VNPayQuery, res: Response) {
    const vnPay = new VNPay({
      tmnCode: process.env.TMN_CODE!,
      secureSecret: process.env.HASH_SECRET!,
      vnpayHost: process.env.VNPAY_HOST!,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });

    const isValid = vnPay.verifyReturnUrl(query as ReturnQueryFromVNPay);
    if (!isValid) {
      await this.paymentRepo.update(
        { transaction_ref: query.vnp_TxnRef },
        {
          status: 'failed',
          raw_response: query,
          message: 'Invalid signature',
          response_code: 'invalid_signature',
        },
      );

      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/result?status=failed`,
      );
    }

    const transaction_ref = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode'];

    const responseMessages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Sai mật khẩu xác thực giao dịch (OTP). Vui lòng thực hiện lại',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác',
    };

    const message = responseMessages[responseCode] || 'Lỗi không xác định';

    const payment = await this.updatePaymentStatus(
      transaction_ref,
      responseCode,
      query,
      message,
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/checkout/result?status=${payment.status}&id=${payment.id}`,
    );
  }

  async updatePaymentStatus(
    transaction_ref: string,
    responseCode: string,
    query: Record<string, string | undefined>,
    message: string,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { transaction_ref },
      relations: ['items', 'items.course', 'user'],
    });

    if (!payment)
      throw new NotFoundException({
        message: 'Không tìm thấy payment',
        errorCode: 'RESOURCE_NOT_FOUND',
      });

    payment.status = responseCode === '00' ? 'success' : 'failed';

    payment.gateway_transaction_id = query['vnp_TransactionNo'] || null;
    payment.bankCode = query['vnp_BankCode'] || null;
    payment.response_code = responseCode;
    payment.message = message || null;

    if (query['vnp_PayDate']) {
      const str = query['vnp_PayDate'];
      const year = Number(str.slice(0, 4));
      const month = Number(str.slice(4, 6)) - 1;
      const day = Number(str.slice(6, 8));
      const hour = Number(str.slice(8, 10));
      const minute = Number(str.slice(10, 12));
      const second = Number(str.slice(12, 14));
      payment.paid_at = new Date(year, month, day, hour, minute, second);
    }

    payment.raw_response = query;

    await this.paymentRepo.save(payment);
    if (payment.status === 'success') {
      const userId = payment.user.userId;

      await this.wishlistRepo
        .createQueryBuilder()
        .delete()
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', {
          courseIds: payment.items.map((i) => i.course.id),
        })
        .execute();

      await this.cartRepo
        .createQueryBuilder()
        .update(CartItem)
        .set({ isPurchased: true })
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', {
          courseIds: payment.items.map((i) => i.course.id),
        })
        .execute();

      for (const item of payment.items) {
        await this.courseRepo
          .createQueryBuilder()
          .update(Course)
          .set({ students: () => 'students + 1' })
          .where('id = :id', { id: item.course.id })
          .execute();
      }
    }
    return payment;
  }

  async findPaymentById(id: string, userId: string) {
    const payment = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.items', 'item')
      .leftJoinAndSelect('item.course', 'course')
      .leftJoin('payment.user', 'user')
      .where('payment.id = :id', { id })
      .andWhere('user.userId = :userId', { userId })
      .getOne();

    if (!payment) {
      throw new NotFoundException({
        message: 'Payment không tồn tại hoặc không thuộc user này',
        errorCode: 'ITEM_ALREADY_EXISTS',
      });
    }

    return payment;
  }

  async createPaymentForMoMo(userId: string, courseIds: string[]) {
    const courses = await this.courseRepo.findByIds(courseIds);

    if (!courses || courses.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy user hoặc course',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const subTotal = courses.reduce((s, c) => s + Number(c.price), 0);

    const vatRate = 0.1;
    const vatAmount = Math.round(subTotal * vatRate);

    const totalWithVAT = subTotal + vatAmount;

    const payment = this.paymentRepo.create({
      user: { userId },
      amount: totalWithVAT,
      status: 'pending',
      gateway: 'MOMO',
      transaction_ref: `TXN-${nanoid(8).toUpperCase()}`,
      currency: 'VND',
      order_info: `Thanh toán MoMo cho khóa học`,
    });

    await this.paymentRepo.save(payment);

    const items = courses.map((c) =>
      this.paymentItemRepo.create({
        payment,
        course: c,
        price: c.price,
      }),
    );

    await this.paymentItemRepo.save(items);

    return payment;
  }

  async handleCreatePaymentMoMo(userId: string, courseIds: string[]) {
    const payment = await this.createPaymentForMoMo(userId, courseIds);

    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;

    const requestId = `${partnerCode}-${Date.now()}`;
    const orderId = payment.transaction_ref;

    const requestType = 'payWithMethod';
    const amountWithTax = Math.round(payment.amount);
    const amount = amountWithTax.toString();
    const orderInfo = `Thanh toan MoMo cho order ${orderId}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;
    // 'https://shadowlike-impartially-shantae.ngrok-free.dev/v1/payment/momo-ipn';
    const extraData = '';
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      orderId,
      amount,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    try {
      const momoRes = await axios.post<MoMoCreateResponse>(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
      );
      console.log('momoRes.data: ', momoRes.data);

      const payUrl = momoRes.data.payUrl;

      payment.pay_url = payUrl;
      await this.paymentRepo.save(payment);

      return {
        payUrl,
        paymentId: payment.id,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion
      const axiosError = error as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (axiosError && axiosError.isAxiosError && axiosError.response) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error('LỖI CHI TIẾT MO_MO:', error.response.data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error('STATUS:', error.response.status);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  private async activateOrder(payment: Payment) {
    if (payment.is_activated) return;

    const userId = payment.user.userId;
    const courseIds = payment.items.map((i) => i.course.id);

    if (courseIds.length > 0) {
      await this.wishlistRepo
        .createQueryBuilder()
        .delete()
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', { courseIds })
        .execute();

      await this.cartRepo
        .createQueryBuilder()
        .update(CartItem)
        .set({ isPurchased: true })
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', { courseIds })
        .execute();

      for (const id of courseIds) {
        await this.courseRepo
          .createQueryBuilder()
          .update(Course)
          .set({ students: () => 'students + 1' })
          .where('id = :id', { id })
          .execute();
      }
    }

    payment.is_activated = true;
    payment.paid_at = new Date();
    await this.paymentRepo.save(payment);
  }

  // async handleMoMoReturn(query: MoMoReturnQuery, res: Response) {
  //   const orderId = query.orderId;

  //   const payment = await this.paymentRepo.findOne({
  //     where: { transaction_ref: orderId },
  //     relations: ['items', 'items.course', 'user'],
  //   });

  //   if (!payment) {
  //     return res.redirect(
  //       `${process.env.CLIENT_URL}/checkout/result?status=not_found`,
  //     );
  //   }

  //   payment.status = query.resultCode === '0' ? 'success' : 'failed';
  //   payment.gateway_transaction_id = query.transId || null;
  //   payment.bankCode = query.payType || null;
  //   payment.paid_at = new Date();
  //   payment.response_code = query.resultCode;
  //   payment.message =
  //     MoMoResponseMessages[query.resultCode] ||
  //     query.message ||
  //     'Unknown error';

  //   payment.raw_response = query;
  //   await this.paymentRepo.save(payment);

  //   if (payment.status === 'success') {
  //     const userId = payment.user.userId;

  //     await this.wishlistRepo
  //       .createQueryBuilder()
  //       .delete()
  //       .where('user_id = :userId', { userId })
  //       .andWhere('course_id IN (:...courseIds)', {
  //         courseIds: payment.items.map((i) => i.course.id),
  //       })
  //       .execute();
  //     await this.cartRepo
  //       .createQueryBuilder()
  //       .update(CartItem)
  //       .set({ isPurchased: true })
  //       .where('user_id = :userId', { userId })
  //       .andWhere('course_id IN (:...courseIds)', {
  //         courseIds: payment.items.map((i) => i.course.id),
  //       })
  //       .execute();

  //     for (const item of payment.items) {
  //       const courseId = item.course.id;
  //       await this.courseRepo
  //         .createQueryBuilder()
  //         .update(Course)
  //         .set({ students: () => 'students + 1' })
  //         .where('id = :id', { id: courseId })
  //         .execute();
  //     }
  //   }

  //   return res.redirect(
  //     `${process.env.CLIENT_URL}/checkout/result?status=${payment.status}&id=${payment.id}`,
  //   );
  // }

  private verifyMoMoSignature(data: any): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { signature, ...rest } = data;
      const secretKey = process.env.MOMO_SECRET_KEY;

      if (!secretKey) {
        console.error('MOMO_SECRET_KEY is not defined in .env');
        return false;
      }

      // Lưu ý: Các giá trị này lấy trực tiếp từ tham số MoMo gửi về trong 'data'
      const rawSignature = [
        `accessKey=${process.env.MOMO_ACCESS_KEY}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `amount=${rest.amount}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `extraData=${rest.extraData || ''}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `message=${rest.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `orderId=${rest.orderId}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `orderInfo=${rest.orderInfo}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `orderType=${rest.orderType}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `partnerCode=${rest.partnerCode}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `requestId=${rest.requestId}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `responseTime=${rest.responseTime}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `resultCode=${rest.resultCode}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `transId=${rest.transId}`,
      ].join('&');

      //  Tạo mã băm HMAC-SHA256 với Secret Key
      const generatedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      //  So sánh chữ ký của bạn tạo ra với chữ ký MoMo gửi sang
      return generatedSignature === signature;
    } catch (error) {
      console.error('Lỗi khi xác thực chữ ký MoMo:', error);
      return false;
    }
  }

  async handleMoMoReturn(query: MoMoReturnQuery, res: Response) {
    // const isValid = this.verifyMoMoSignature(query);
    // if (!isValid) {
    //   console.error('CẢNH BÁO: Signature không hợp lệ tại MoMo Return!');
    //   return res.redirect(
    //     `${process.env.CLIENT_URL}/checkout/result?status=failed&message=invalid_signature`,
    //   );
    // }
    const { orderId, resultCode, transId, payType, message, amount } = query;

    const payment = await this.paymentRepo.findOne({
      where: { transaction_ref: orderId },
      relations: ['items', 'items.course', 'user'],
    });

    if (!payment) {
      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/result?status=failed`,
      );
    }
    const incomingAmount = Number(amount);
    const dbAmount = Number(payment.amount);
    if (incomingAmount !== dbAmount) {
      console.log('amout: ', amount, payment.amount);
      console.error('CẢNH BÁO: Số tiền thanh toán không khớp!');
      payment.status = 'failed';
      payment.message = 'Số tiền không khớp với đơn hàng';
      await this.paymentRepo.save(payment);

      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/result?status=failed&message=invalid_amount`,
      );
    }

    payment.status = resultCode === '0' ? 'success' : 'failed';
    payment.gateway_transaction_id = transId || null;
    payment.bankCode = payType || null;
    payment.response_code = resultCode;
    payment.message = MoMoResponseMessages[resultCode] || message || 'Error';
    payment.raw_response = query;

    await this.paymentRepo.save(payment);

    if (payment.status === 'success' && payment.is_activated === false) {
      await this.activateOrder(payment);
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/checkout/result?status=${payment.status}&id=${payment.id}`,
    );
  }

  // async handleMoMoIPN(body: MoMoReturnQuery) {
  //   const { orderId, resultCode, message, transId } = body;

  //   const payment = await this.paymentRepo.findOne({
  //     where: { transaction_ref: orderId },
  //   });

  //   if (!payment) return { message: 'order_not_found', resultCode: 1001 };

  //   payment.status = resultCode === '0' ? 'success' : 'failed';
  //   payment.gateway_transaction_id = transId || null;
  //   payment.message = message || null;
  //   payment.response_code = body.resultCode;
  //   payment.paid_at = new Date();
  //   payment.raw_response = body;

  //   await this.paymentRepo.save(payment);

  //   return { message: 'success', resultCode: 0 };
  // }

  async handleMoMoIPN(body: MoMoReturnQuery) {
    // const isValid = this.verifyMoMoSignature(body);
    // if (!isValid) {
    //   console.error('CẢNH BÁO: IPN giả mạo!');
    //   return { message: 'Invalid signature', resultCode: 99 };
    // }
    const { orderId, resultCode, message, transId } = body;

    const payment = await this.paymentRepo.findOne({
      where: { transaction_ref: orderId },
      relations: ['items', 'items.course', 'user'],
    });

    if (!payment) return { message: 'Order not found', resultCode: 1001 };

    if (payment.status === 'success' && payment.is_activated) {
      return { message: 'Success', resultCode: 0 };
    }

    payment.status = resultCode === '0' ? 'success' : 'failed';
    payment.gateway_transaction_id = transId || null;
    payment.response_code = resultCode;
    payment.message = message || null;
    payment.paid_at = new Date();
    payment.raw_response = body;

    await this.paymentRepo.save(payment);

    if (payment.status === 'success') {
      await this.activateOrder(payment);
    }

    return { message: 'Success', resultCode: 0 };
  }

  async handelGetPayments(
    { status = 'all', page = 1, limit = 6 },
    userId: string,
  ) {
    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.items', 'item')
      .leftJoinAndSelect('item.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('payment.user_id = :userId', { userId })
      .orderBy('payment.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status !== 'all') {
      query.andWhere('payment.status = :status', { status });
    }
    const total = await query.getCount();
    const payments = await query.getMany();

    const filteredPayments = payments.map((payment) => ({
      id: payment.id,
      transactionRef: payment.transaction_ref,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      gateway: payment.gateway,
      paidAt: payment.paid_at ?? undefined,
      createdAt: payment.created_at,
      items: payment.items.map((item) => ({
        id: item.id,
        courseId: item.course.id,
        title: item.course.title,
        instructor: item.course.instructor.fullName,
        price: Number(item.price),
        image: item.course.image,
      })),
    }));

    return {
      data: filteredPayments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handelGetPaymentsForAdmin({
    status = 'all',
    page = 1,
    limit = 10,
    startDate,
    endDate,
    search,
  }: {
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.items', 'item')
      .leftJoinAndSelect('item.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .orderBy('payment.created_at', 'DESC');
    if (status !== 'all') {
      query.andWhere('payment.status = :status', { status });
    }

    if (startDate) {
      query.andWhere('payment.created_at >= :startDate', {
        startDate: new Date(`${startDate} 00:00:00`),
      });
    }
    if (endDate) {
      query.andWhere('payment.created_at <= :endDate', {
        endDate: new Date(`${endDate} 23:59:59`),
      });
    }

    if (search) {
      query.andWhere(
        '(payment.transaction_ref LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Phân trang
    query.skip((page - 1) * limit).take(limit);

    const [payments, total] = await query.getManyAndCount();

    const filteredPayments = payments.map((payment) => ({
      id: payment.id,
      customer: {
        id: payment.user?.userId,
        name: payment.user?.fullName,
        email: payment.user?.email,
      },
      transactionRef: payment.transaction_ref,
      amount: Number(payment.amount),
      status: payment.status,
      gateway: payment.gateway,
      paidAt: payment.paid_at,
      createdAt: payment.created_at,
      items: payment.items.map((item) => ({
        id: item.id,
        courseId: item.course.id,
        title: item.course.title,
        instructor: item.course.instructor.fullName,
        price: Number(item.price),
        image: item.course.image,
      })),
    }));

    return {
      data: filteredPayments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private initializeRevenueArray(year: number): MonthlyRevenueData[] {
    const data: MonthlyRevenueData[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthName = `${month}/${year}`;
      data.push({
        name: monthName,
        revenue: 0,
        gmv: 0,
      });
    }
    return data;
  }

  private formatRevenueData(
    rawResults: MonthlyRevenueResult[],
    year: number,
  ): MonthlyRevenueData[] {
    const initializedArray = this.initializeRevenueArray(year);

    const monthlyDataMap = initializedArray.reduce(
      (map, item) => {
        map[item.name] = item;
        return map;
      },
      {} as Record<string, MonthlyRevenueData>,
    );

    for (const raw of rawResults) {
      const [yearStr, monthStr] = raw.monthYear.split('-');
      const month = parseInt(monthStr);
      const monthKey = `${month}/${parseInt(yearStr)}`;

      if (monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey].revenue = parseFloat(raw.totalNetRevenue) || 0;
        monthlyDataMap[monthKey].gmv = parseFloat(raw.gmv) || 0;
      }
    }

    return Object.values(monthlyDataMap);
  }

  async handelGetTeacherPayments(teacherId: string, year: number) {
    const teacherCourses = await this.courseRepo.find({
      select: ['id'],
      where: { instructor: { userId: teacherId } },
    });

    if (!teacherCourses || teacherCourses.length === 0) {
      return this.initializeRevenueArray(year);
    }

    const teacherCourseIds = teacherCourses.map((c) => c.id);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const revenueResults: MonthlyRevenueResult[] = await this.paymentItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment', 'payment.status = :status', {
        status: 'success',
      })
      .where('item.course_id IN (:...courseIds)', {
        courseIds: teacherCourseIds,
      })
      .andWhere('payment.paid_at BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      .select("DATE_FORMAT(payment.paid_at, '%Y-%m')", 'monthYear')
      .addSelect(`SUM(item.price * (1 - :feeRate))`, 'totalNetRevenue')
      .addSelect(`SUM(item.price)`, 'gmv')
      .setParameter('feeRate', PLATFORM_FEE_RATE)
      .groupBy('monthYear')
      .orderBy('monthYear', 'ASC')
      .getRawMany();

    return this.formatRevenueData(revenueResults, year);
  }

  private formatRevenueByDayOfWeek(
    revenueResults: DailyRevenueResult[],
    startDate: Date,
    endDate: Date,
  ) {
    const statsMap = new Map<
      string,
      { net: number; gmv: number; students: number }
    >();

    revenueResults.forEach((result) => {
      const netRevenue = parseFloat(String(result.totalNetRevenue)) || 0;
      const gmv = parseFloat(String(result.totalGmv)) || 0;
      const newStudents = parseInt(String(result.newStudents)) || 0;

      statsMap.set(result.paidDate, {
        net: netRevenue,
        gmv: gmv,
        students: newStudents,
      });
    });

    const rawData: WeeklyRevenueItem[] = [];
    const currentDate = new Date(startDate);

    const dayNames = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];

    while (currentDate <= endDate) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const dayIndex = currentDate.getDay();
      const dayOfWeekName = dayNames[dayIndex];

      const dayStats = statsMap.get(dateKey) || { net: 0, gmv: 0, students: 0 };

      rawData.push({
        dayOfWeek: dayOfWeekName,
        date: dateKey,
        totalNetRevenue: dayStats.net,
        totalGmv: dayStats.gmv,
        newStudents: dayStats.students,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const finalData = rawData.sort((a, b) => {
      const getDayIndex = (dateString: string): number => {
        return new Date(dateString).getDay();
      };

      const indexA = getDayIndex(a.date);
      const indexB = getDayIndex(b.date);

      const sortedIndexA = (indexA + 6) % 7;
      const sortedIndexB = (indexB + 6) % 7;

      return sortedIndexA - sortedIndexB;
    });

    return finalData;
  }

  async handleGetSpecificPayments(
    courseId: string,
    startDateString: string,
    endDateString: string,
    teacherId: string,
  ) {
    const course = await this.courseRepo.findOne({
      where: {
        id: courseId,
        instructor: { userId: teacherId },
        status: In(['published', 'archived']),
      },
      select: ['id'],
    });

    if (!course) {
      throw new UnauthorizedException(
        'Không tìm thấy khóa học này, hoặc bạn không có quyền truy cập.',
      );
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const formattedEndDate = new Date(endDate.setHours(23, 59, 59, 999));

    const revenueResults = await this.paymentItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment', 'payment.status = :status', {
        status: 'success',
      })
      .innerJoin('item.course', 'course')
      .innerJoin('course.instructor', 'instructor')
      .where('course.id = :courseId', { courseId })
      .andWhere('instructor.userId = :teacherId', { teacherId })
      .andWhere('course.status = :publishedStatus', {
        publishedStatus: 'published',
      })
      .andWhere('payment.paid_at >= :startDate', {
        startDate: startDate.toISOString(),
      })
      .andWhere('payment.paid_at <= :endDate', {
        endDate: formattedEndDate.toISOString(),
      })
      .select("DATE_FORMAT(payment.paid_at, '%Y-%m-%d')", 'paidDate')
      .addSelect(`SUM(item.price * (1 - :feeRate))`, 'totalNetRevenue')
      .addSelect(`SUM(item.price)`, 'totalGmv')
      .addSelect(`COUNT(DISTINCT payment.user_id)`, 'newStudents')
      .setParameter('feeRate', PLATFORM_FEE_RATE)
      .groupBy('paidDate')
      .orderBy('paidDate', 'ASC')
      .getRawMany<DailyRevenueResult>();

    return this.formatRevenueByDayOfWeek(revenueResults, startDate, endDate);
  }

  async handleGetMainStatsDashboardTeacher(userId: string) {
    const totalCourses = await this.courseRepo.count({
      where: {
        instructor: { userId },
        status: 'published',
        parentId: IsNull(),
        isLive: true,
      },
    });

    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.items', 'item')
      .innerJoin('item.course', 'course')
      .select([
        'SUM(item.price) AS gmv',
        'COUNT(DISTINCT payment.user_id) AS newStudents',
      ])
      .where('payment.status = :status', { status: 'success' })
      .andWhere('course.instructor_id = :userId', { userId });

    const statsQuery = await query.getRawOne<RawStatsResult>();

    const gmv = Number(statsQuery?.gmv ?? 0);
    const TEACHER_COMMISSION_RATE = 0.9;

    return {
      courses: totalCourses,
      students: Number(statsQuery?.newStudents ?? 0),
      gmv: gmv,
      net: Math.round(gmv * TEACHER_COMMISSION_RATE),
    };
  }

  async handleGetMainStatsDashboard(
    range: string,
    customStart?: string,
    customEnd?: string,
  ) {
    const totalCourses = await this.courseRepo.count({
      where: { status: 'published' },
    });

    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.items', 'item')
      .select([
        'SUM(item.price) AS gmv',
        'COUNT(DISTINCT payment.user_id) AS newStudents',
      ])
      .where('payment.status = :status', { status: 'success' });

    applyTimeFilter(query, range, customStart, customEnd);

    const statsQuery = await query.getRawOne<RawStatsResult>();

    return {
      courses: totalCourses,
      newStudents: Number(statsQuery?.newStudents ?? 0),
      gmv: Number(statsQuery?.gmv ?? 0),
      net: Math.round(Number(statsQuery?.gmv ?? 0) * (20 / 110)),
      label: range?.toLowerCase() || 'all',
    };
  }

  async handleGetTop10CoursesRevenue(
    range: string,
    customStart?: string,
    customEnd?: string,
  ) {
    const query = this.paymentItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment')
      .innerJoin('item.course', 'course')
      .select(['course.title AS name', 'SUM(item.price * 1.1) AS revenue'])
      .where('payment.status = :status', { status: 'success' })
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('revenue', 'DESC')
      .limit(10);

    applyTimeFilter(query, range, customStart, customEnd);

    const result = await query.getRawMany<RawTopCourse>();
    return result.map((item) => ({
      name: item.name,
      revenue: Math.round(Number(item.revenue || 0)),
    }));
  }

  async handleGetTop10CategoriesRevenue(
    range: string,
    customStart?: string,
    customEnd?: string,
  ) {
    const query = this.paymentItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment')
      .innerJoin('item.course', 'course')
      .innerJoin('course.category', 'category')
      .select([
        'category.categoryName AS name',
        'SUM(item.price * 1.1) AS revenue',
      ])
      .where('payment.status = :status', { status: 'success' })
      .groupBy('category.id')
      .addGroupBy('category.categoryName')
      .orderBy('revenue', 'DESC')
      .limit(10);

    applyTimeFilter(query, range, customStart, customEnd);

    const result = await query.getRawMany<RawTopCategory>();
    return result.map((item) => ({
      name: item.name,
      revenue: Math.round(Number(item.revenue || 0)),
    }));
  }
}
