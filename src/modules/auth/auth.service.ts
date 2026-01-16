import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequestDto, RegisterDtoAdmin } from './dto/auth-request.dto';
import { Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { PayloadJwt } from './auth.interface';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { Role } from '../role/entities/role.entity';
import dayjs from 'dayjs';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
  ) {}

  async handleLogin(authRequestDto: AuthRequestDto) {
    const userRes = await this.validateUser(
      authRequestDto.email,
      authRequestDto.password,
    );
    if (!userRes) {
      throw new UnauthorizedException({
        message: 'Email hoặc mật khẩu không đúng',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const payload: PayloadJwt = {
      sub: userRes.userId,
      email: userRes.email,
      fullName: userRes.fullName,
      roleName: userRes.role.roleName,
    };

    const refreshToken = await this.generateRefreshToken(payload);
    await this.revokeAllTokensForUserExcept(userRes.userId, refreshToken);
    const accessToken = this.generateAccessToken(payload);

    const user = plainToInstance(UserResponseDto, userRes, {
      excludeExtraneousValues: true,
    });

    return { accessToken, refreshToken, user };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) return null;

    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Tài khoản chưa được kích hoạt, vui lòng xác minh email.',
        errorCode: 'ACCOUNT_NOT_VERIFIED',
      });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  generateAccessToken(payload: PayloadJwt): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async generateRefreshToken(payload: PayloadJwt): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { userId: payload.sub },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy user để tạo refresh token',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt: new Date(Date.now() + 7 * 86400000),
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async findValidToken(token: string): Promise<RefreshToken | null> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!tokenRecord) {
      return null;
    }

    if (tokenRecord.isRevoked) {
      return null;
    }
    return tokenRecord;
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async verifyRefreshToken(token: string): Promise<PayloadJwt> {
    const tokenRecord = await this.findValidToken(token);
    if (!tokenRecord) {
      throw new UnauthorizedException({
        errorCode: 'REVOKED_REFRESH_TOKEN',
        message: 'Refresh token không hợp lệ hoặc đã bị thu hồi',
      });
    }
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      await this.revokeToken(token);
      throw new UnauthorizedException({
        errorCode: 'EXPIRED_REFRESH_TOKEN',
        message: 'Refresh token đã hết hạn hoặc không hợp lệ',
      });
    }
  }

  async handleRegister(registerDto: RegisterDtoAdmin) {
    // 1. Kiểm tra tồn tại
    const user = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (user) {
      throw new BadRequestException({
        message: 'Email đã tồn tại',
        errorCode: 'EMAIL_EXISTS',
      });
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = await this.roleRepository.findOne({
      where: { roleName: registerDto.roleName },
    });

    if (!role) {
      throw new NotFoundException({
        message: 'Role không tồn tại',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const codeId = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = dayjs().add(5, 'minute');

    // 3. Tạo User
    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      dateOfBirth:
        registerDto.dateOfBirth === '' ? null : registerDto.dateOfBirth,
      phone: registerDto.phone,
      address: registerDto.address,
      role,
      codeId,
      codeExpiresAt: codeExpiresAt.toDate(),
    });

    const savedUser = await this.userRepository.save(newUser);

    try {
      // await this.mailerService.sendMail({
      //   to: savedUser.email,
      //   subject: 'Activate your LearnifyX account',
      //   template: 'verify.hbs',
      //   context: {
      //     name: savedUser.fullName,
      //     activationCode: codeId,
      //     expiresAtFormatted: codeExpiresAt.format('HH:mm:ss [on] DD/MM/YYYY'),
      //   },
      // });
      console.log(`✅ Mail đã gửi thành công tới: ${savedUser.email}`);
    } catch (error) {
      // Nếu mail lỗi, chúng ta log lại để sửa BE nhưng vẫn trả về success cho FE
      // Hoặc throw ra một lỗi rõ ràng hơn để FE xử lý
      console.error('❌ LỖI GỬI MAIL TRÊN PRODUCTION:', error);

      // Tùy chọn: Nếu muốn người dùng biết mail lỗi nhưng tài khoản vẫn được tạo
      // return { message: 'Tạo tài khoản thành công nhưng gửi mail lỗi' };
    }

    return savedUser; // Trả về để Controller trả về 201 cho Frontend
  }

  async handleVerifyMail(email: string, codeId: number) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException({
        message: 'Email không tồn tại',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }
    if (user.codeId !== codeId) {
      throw new BadRequestException({
        message: 'Mã xác thực không đúng',
        errorCode: 'INVALID_CODE',
      });
    }
    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      throw new BadRequestException({
        message: 'Mã xác thực đã hết hạn',
        errorCode: 'EXPIRED_CODE',
      });
    }
    user.isActive = true;
    user.codeId = null;
    user.codeExpiresAt = null;
    await this.userRepository.save(user);
  }

  async revokeAllTokensForUserExcept(
    userId: string,
    excludeToken: string,
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { userId }, token: Not(excludeToken) },
      { isRevoked: true },
    );
  }

  async handlePasswordForget(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Email does not exist',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const codeId = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = dayjs().add(5, 'minute');

    user.codeId = codeId;
    user.codeExpiresAt = codeExpiresAt.toDate();

    const savedUser = await this.userRepository.save(user);

    // --- PHẦN DEBUG QUAN TRỌNG ---
    try {
      console.log(`🚀 Bắt đầu gửi mail tới: ${savedUser.email}...`);

      // Tạm thời để await để xem nó timeout mất bao lâu và lỗi chính xác là gì
      // await this.mailerService.sendMail({
      //   to: savedUser.email,
      //   subject: 'Reset your LearnifyX password',
      //   template: 'reset-password', // Lưu ý: Thường không cần đuôi .hbs nếu đã cấu hình trong Module
      //   context: {
      //     name: savedUser.fullName,
      //     otpCode: codeId,
      //     expiresAtFormatted: codeExpiresAt.format('HH:mm:ss [on] DD/MM/YYYY'),
      //   },
      // });
      await this.mailerService.sendMail({
        // Sử dụng service mới
        to: savedUser.email,
        subject: 'Reset your LearnifyX password',
        template: 'reset-password', // MailService mới của bạn sẽ tự thêm .hbs
        context: {
          name: savedUser.fullName,
          otpCode: codeId, // Khớp với IMailContext (otpCode)
          expiresAtFormatted: codeExpiresAt.format('HH:mm:ss [on] DD/MM/YYYY'),
        },
      });
      console.log(`✅ Mail đã gửi thành công tới ${savedUser.email}`);
    } catch (mailError) {
      // In toàn bộ object lỗi để xem code lỗi (ETIMEOUT, EAUTH, v.v.)
      console.error('❌ Lỗi Mail Chi Tiết:', {
        message: mailError.message,
        code: mailError.code,
        command: mailError.command,
      });
    }

    return { success: true };
  }

  async handleSendVerifyMail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException({
        message: 'Email does not exist',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const codeId = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = dayjs().add(5, 'minute');

    user.codeId = codeId;
    user.codeExpiresAt = codeExpiresAt.toDate();

    await this.userRepository.save(user);
    const savedUser = await this.userRepository.save(user);
    // await this.mailerService.sendMail({
    //   to: savedUser.email,
    //   subject: 'Verify your LearnifyX account',
    //   template: 'verify.hbs',
    //   context: {
    //     name: savedUser.fullName,
    //     activationCode: codeId,
    //     expiresAtFormatted: codeExpiresAt.format('HH:mm:ss [on] DD/MM/YYYY'),
    //   },
    // });
  }

  async handleResetPassword(
    email: string,
    codeId: number,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException({
        message: 'New password and confirm password do not match',
        errorCode: 'PASSWORD_MISMATCH',
      });
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException({
        message: 'Email does not exist',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    if (user.codeId !== codeId) {
      throw new BadRequestException({
        message: 'Invalid verification code',
        errorCode: 'INVALID_CODE',
      });
    }

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      throw new BadRequestException({
        message: 'Verification code has expired',
        errorCode: 'EXPIRED_CODE',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.codeId = null;
    user.codeExpiresAt = null;
    await this.userRepository.save(user);
  }
}
