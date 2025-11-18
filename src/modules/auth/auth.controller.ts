import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto, RegisterDto } from './dto/auth-request.dto';
import { ApiResponse, TApiResponse } from '../../common/bases/api-response';
import { LoginResponse } from './auth.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request, Response } from 'express';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';

interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string | undefined;
    refresh_token?: string;
  };
}

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() authRequestDto: AuthRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TApiResponse<LoginResponse>> {
    const { accessToken, refreshToken, user } =
      await this.authService.handleLogin(authRequestDto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return ApiResponse.success({ accessToken, user }, 'Đăng nhập thành công');
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TApiResponse<LoginResponse>> {
    const oldToken = req.cookies['refresh_token'];
    if (!oldToken) {
      throw new UnauthorizedException({
        errorCode: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token không tồn tại',
      });
    }
    const rawPayload = await this.authService.verifyRefreshToken(oldToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, iat, ...payload } = rawPayload;
    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = await this.authService.generateRefreshToken(payload);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await this.authService.revokeToken(oldToken);
    return ApiResponse.success({ accessToken }, 'Làm mới token thành công');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
  @HttpCode(200)
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }
    await this.authService.revokeToken(token);

    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return ApiResponse.success(null, 'Đăng xuất thành công');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<TApiResponse<null>> {
    await this.authService.handleRegister(registerDto);
    return ApiResponse.success(null, 'Đăng ký thành công');
  }

  @Put('forget-password')
  async forgetPassword(@Body('email') email: string) {
    await this.authService.handlePasswordForget(email);
    return ApiResponse.success(null, 'Verification code sent to email');
  }

  @Put('reset-password')
  async resetPassword(
    @Body()
    body: {
      email: string;
      codeId: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    await this.authService.handleResetPassword(
      body.email,
      Number(body.codeId),
      body.newPassword,
      body.confirmPassword,
    );
    return ApiResponse.success(null, 'Password has been reset successfully');
  }

  @Get('mail')
  testMail() {
    const expiresAtFormatted = dayjs()
      .add(1, 'hour')
      .format('HH:mm:ss [ngày] DD/MM/YYYY');
    this.mailerService
      .sendMail({
        to: 'banhkute200@gmail.com',
        subject: 'Activate your LearnifyX account',
        template: 'verify',
        context: {
          name: 'Nguyen Van A',
          activationCode: 123456,
          expiresAtFormatted,
        },
      })
      .then(() => {})
      .catch((err) => {
        console.error('Mail error:', err);
      });

    return 'ok';
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyMail(@Body() body: { email: string; codeId: number }) {
    await this.authService.handleVerifyMail(body.email, body.codeId);
    return ApiResponse.success(null, 'Xác thực email thành công');
  }

  @Post('send-verify-email')
  @HttpCode(200)
  async sendVerifyEmail(@Body('email') email: string) {
    await this.authService.handleSendVerifyMail(email);
    return ApiResponse.success(null, 'Gửi xác thực email thành công');
  }
}
