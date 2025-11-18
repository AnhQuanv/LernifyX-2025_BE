import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken, User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
