import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequestDto, RegisterDto } from './dto/auth-request.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { PayloadJwt } from './auth.interface';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { Role } from '../role/entities/role.entity';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';

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
    private readonly mailerService: MailerService,
  ) {}

  async handleLogin(authRequestDto: AuthRequestDto) {
    const userRes = await this.validateUser(
      authRequestDto.email,
      authRequestDto.password,
    );

    if (!userRes) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload: PayloadJwt = {
      sub: userRes.userId,
      email: userRes.email,
      fullName: userRes.fullName,
      roleName: userRes.role.roleName,
    };

    const accessToken = this.generateAccessToken(payload);

    const refreshToken = await this.generateRefreshToken(payload);

    const user = plainToInstance(UserResponseDto, userRes, {
      excludeExtraneousValues: true,
    });

    console.log('user: ', user);

    return { accessToken, refreshToken, user };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user || !(await bcrypt.compare(pass, user.password))) return null;
    return user;
  }

  generateAccessToken(payload: PayloadJwt): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '10m',
    });
  }

  async generateRefreshToken(payload: PayloadJwt): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { userId: payload.sub },
    });

    if (!user) {
      throw new Error('Không tìm thấy user để tạo refresh token');
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
    return await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async verifyRefreshToken(token: string): Promise<PayloadJwt> {
    const tokenRecord = await this.findValidToken(token);
    if (!tokenRecord) {
      throw new UnauthorizedException({
        errorCode: 'INVALID_TOKEN',
        message: 'Refresh token không hợp lệ hoặc đã bị thu hồi',
      });
    }
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  async handleRegister(registerDto: RegisterDto) {
    console.log('dto: ', registerDto);
    const user = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (user) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const role = await this.roleRepository.findOne({
      where: { roleName: registerDto.roleName },
    });

    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    const codeId = Math.floor(100000 + Math.random() * 900000);
    const codeExpiresAt = dayjs().add(5, 'minute');

    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      dateOfBirth: registerDto.dateOfBirth,
      phone: registerDto.phone,
      address: registerDto.address,
      role,
      codeId,
      codeExpiresAt: codeExpiresAt.toDate(),
    });
    await this.mailerService.sendMail({
      to: newUser.email,
      subject: 'Activate your LearnifyX account',
      template: 'verify.hbs',
      context: {
        name: newUser?.fullName ?? newUser.email,
        activationCode: codeId,
        expiresAtFormatted: codeExpiresAt.format('HH:mm:ss [on] DD/MM/YYYY'),
      },
    });
    await this.userRepository.save(newUser);
  }

  async handleVerifyMail(email: string, codeId: number) {
    console.log('email, codeId: ', email, codeId);
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Email không tồn tại');
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
}
