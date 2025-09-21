import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
      path: '/v1/auth/refresh',
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
      throw new UnauthorizedException('Refresh token không tồn tại');
    }
    const rawPayload = await this.authService.verifyRefreshToken(oldToken);
    await this.authService.revokeToken(oldToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, iat, ...payload } = rawPayload;
    console.log('Payload: ', payload);
    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = await this.authService.generateRefreshToken(payload);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'strict',
      path: '/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success({ accessToken }, 'Làm mới token thành công');
  }

  @Post('logout')
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

    res.clearCookie('refresh_token', { path: '/v1/auth/refresh' });

    return ApiResponse.success(null, 'Đăng xuất thành công');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('me')
  getMe(@Req() req) {
    return 123;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<TApiResponse<null>> {
    await this.authService.handleRegister(registerDto);
    return ApiResponse.success(null, 'Đăng ký thành công');
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
    console.log('Body: ', body);
    await this.authService.handleVerifyMail(body.email, body.codeId);
    return ApiResponse.success(null, 'Xác thực email thành công');
  }
}
