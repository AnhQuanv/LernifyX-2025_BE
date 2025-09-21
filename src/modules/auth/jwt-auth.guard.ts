import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: Error & { name: string }) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token đã hết hạn');
      } else if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Access token không hợp lệ');
      }
      throw new UnauthorizedException('Không xác thực được người dùng');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
