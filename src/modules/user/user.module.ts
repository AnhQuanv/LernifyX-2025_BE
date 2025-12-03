import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { UserPreference } from '../user_preferences/entities/user_preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken, User, UserPreference])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
