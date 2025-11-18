import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
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
import { convertUSDToVND, formatDate } from 'src/common/helpers/utils';
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

  async handleVNPay(payment: Payment) {
    const vnPay = new VNPay({
      tmnCode: process.env.TMN_CODE!,
      secureSecret: process.env.HASH_SECRET!,
      vnpayHost: process.env.VNPAY_HOST!,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });

    const now = new Date();
    const expire = new Date(now.getTime() + 15 * 60 * 1000); // 15 phút

    const vnPayResponse = vnPay.buildPaymentUrl({
      vnp_Amount: payment.amount,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: payment.transaction_ref,
      vnp_OrderType: ProductCode.Other,
      vnp_OrderInfo: payment.order_info,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(formatDate(now)),
      vnp_ExpireDate: Number(formatDate(expire)),
    });

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

    const totalUSD = courses.reduce(
      (sum, course) => sum + Number(course.price),
      0,
    );

    const totalVND = convertUSDToVND(totalUSD);
    const transaction_ref = `TXN-${nanoid(8).toUpperCase()}`;
    // 3. Tạo Payment
    const payment = this.paymentRepo.create({
      user: { userId },
      amount: totalVND,
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
        `${process.env.CLIENT_URL}/checkout/result?status=invalid_signature`,
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

    // Lưu toàn bộ callback
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
        console.log(`Updating students for course: ${item.course.id}`);

        const updateResult = await this.courseRepo
          .createQueryBuilder()
          .update(Course)
          .set({ students: () => 'students + 1' })
          .where('id = :id', { id: item.course.id })
          .execute();

        console.log('Course update result:', updateResult);

        const updatedCourse = await this.courseRepo.findOne({
          where: { id: item.course.id },
        });

        console.log('Updated course students:', updatedCourse?.students);
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

    const totalUSD = courses.reduce((s, c) => s + Number(c.price), 0);

    const totalVND = convertUSDToVND(totalUSD);

    const payment = this.paymentRepo.create({
      user: { userId },
      amount: totalVND,
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
    const amount = payment.amount.toString();
    const orderInfo = `Thanh toan MoMo cho order ${orderId}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL!;
    const ipnUrl = process.env.MOMO_IPN_URL!;
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

      console.log('===== MOMO RESPONSE =====');
      console.log(momoRes.data);

      const payUrl = momoRes.data.payUrl;

      payment.pay_url = payUrl;
      await this.paymentRepo.save(payment);

      return {
        payUrl,
        paymentId: payment.id,
      };
    } catch (error) {
      const axiosError = error as any;
      if (axiosError && axiosError.isAxiosError && axiosError.response) {
        console.error('LỖI CHI TIẾT MO_MO:', error.response.data);
        console.error('STATUS:', error.response.status);

        // Ném lỗi chi tiết ra ngoài
        throw new HttpException(error.response.data, error.response.status);
      }
      // Ném lỗi Axios ban đầu nếu không phải lỗi 400 từ MoMo
      throw error;
    }
  }

  async handleMoMoReturn(query: MoMoReturnQuery, res: Response) {
    const orderId = query.orderId;

    const payment = await this.paymentRepo.findOne({
      where: { transaction_ref: orderId },
      relations: ['items', 'items.course', 'user'],
    });

    if (!payment) {
      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/result?status=not_found`,
      );
    }

    // resultCode: 0 = Thành công
    payment.status = query.resultCode === '0' ? 'success' : 'failed';
    payment.gateway_transaction_id = query.transId || null;
    payment.bankCode = query.payType || null;
    payment.paid_at = new Date();
    payment.response_code = query.resultCode;
    payment.message =
      MoMoResponseMessages[query.resultCode] ||
      query.message ||
      'Unknown error';

    payment.raw_response = query;
    await this.paymentRepo.save(payment);

    if (payment.status === 'success') {
      const userId = payment.user.userId;

      // Xóa khỏi wishlist
      const wishlistDeleteResult = await this.wishlistRepo
        .createQueryBuilder()
        .delete()
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', {
          courseIds: payment.items.map((i) => i.course.id),
        })
        .execute();
      console.log('Wishlist delete result:', wishlistDeleteResult);
      const cartUpdateResult = await this.cartRepo
        .createQueryBuilder()
        .update(CartItem)
        .set({ isPurchased: true })
        .where('user_id = :userId', { userId })
        .andWhere('course_id IN (:...courseIds)', {
          courseIds: payment.items.map((i) => i.course.id),
        })
        .execute();
      console.log('Cart update result:', cartUpdateResult);

      for (const item of payment.items) {
        const courseId = item.course.id;
        console.log(`Updating students for course: ${courseId}`);

        const updateResult = await this.courseRepo
          .createQueryBuilder()
          .update(Course)
          .set({ students: () => 'students + 1' })
          .where('id = :id', { id: courseId })
          .execute();

        console.log('Course update result:', updateResult);

        // Debug xem giá trị mới
        const newCourse = await this.courseRepo.findOne({
          where: { id: courseId },
        });
        console.log('Updated course students:', newCourse?.students);
      }
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/checkout/result?status=${payment.status}&id=${payment.id}`,
    );
  }

  async handleMoMoIPN(body: MoMoReturnQuery) {
    const { orderId, resultCode, message, transId } = body;

    const payment = await this.paymentRepo.findOne({
      where: { transaction_ref: orderId },
    });

    if (!payment) return { message: 'order_not_found', resultCode: 1001 };

    payment.status = resultCode === '0' ? 'success' : 'failed';
    payment.gateway_transaction_id = transId || null;
    payment.message = message || null;
    payment.response_code = body.resultCode;
    payment.paid_at = new Date();
    payment.raw_response = body;

    await this.paymentRepo.save(payment);

    return { message: 'success', resultCode: 0 };
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
}
