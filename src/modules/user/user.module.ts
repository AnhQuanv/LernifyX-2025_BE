import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
