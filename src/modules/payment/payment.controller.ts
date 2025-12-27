import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RequestWithUser } from '../user/user.controller';
import { ApiResponse } from 'src/common/bases/api-response';
import { MoMoReturnQuery, VNPayQuery } from './dto/vnpay-response';
import { Response } from 'express';

@Controller('v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async createPayment(
    @Req() req: RequestWithUser,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const userId = req.user?.sub;
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    const gateway = String(createPaymentDto.gateway).trim();
    const { courseId } = createPaymentDto;

    if (!['VNPay', 'MoMo'].includes(gateway)) {
      throw new HttpException(
        {
          errorCode: 'INVALID_GATEWAY',
          message: 'Gateway không hợp lệ',
        },
        400,
      );
    }

    if (gateway === 'VNPay') {
      const payment = await this.paymentService.handleCreatePaymentVNPay(
        userId,
        courseId,
        gateway,
      );

      const paymentUrl = await this.paymentService.handleVNPay(
        payment,
        clientIp,
      );

      return ApiResponse.success(
        paymentUrl,
        'Tạo link thanh toán VNPay thành công',
      );
    }

    if (gateway === 'MoMo') {
      const result = await this.paymentService.handleCreatePaymentMoMo(
        userId,
        courseId,
      );

      const paymentUrl = result.payUrl;

      return ApiResponse.success(
        paymentUrl,
        'Tạo link thanh toán MoMo thành công',
      );
    }
  }

  @Get('check-payment-vnpay')
  async VNPayReturn(@Query() query: VNPayQuery, @Res() res: Response) {
    await this.paymentService.handleVNPayReturn(query, res);
  }

  @Post('momo-ipn')
  async momoIPN(@Body() body: MoMoReturnQuery) {
    return await this.paymentService.handleMoMoIPN(body);
  }

  @Get('momo-return')
  async momoReturn(@Query() query: MoMoReturnQuery, @Res() res: Response) {
    return await this.paymentService.handleMoMoReturn(query, res);
  }

  @Get('teacher-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getTeacherPayments(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    const result = await this.paymentService.handelGetTeacherPayments(userId);
    return ApiResponse.success(result, 'Lấy doanh thu hàng tháng thành công');
  }

  @Get('teacher-payment-course')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  async getSpecificPayments(
    @Req() req: RequestWithUser,
    @Query('courseId') courseId: string,

    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = req.user?.sub;
    const result = await this.paymentService.handleGetSpecificPayments(
      courseId,
      startDate,
      endDate,
      userId,
    );
    return ApiResponse.success(result, 'Lấy doanh thu hàng tháng thành công');
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getPayments(
    @Query('status') status = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    const result = await this.paymentService.handelGetPayments(
      { status, page, limit },
      userId,
    );
    return ApiResponse.success(result, 'Lấy danh sách hóa đơn thành công');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getPayment(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user?.sub;
    const payment = await this.paymentService.findPaymentById(id, userId);
    return ApiResponse.success(payment, 'Lấy hóa đơn thành công');
  }
}
