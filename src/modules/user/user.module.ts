import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { UserPreference } from '../user_preferences/entities/user_preference.entity';
import { Course } from '../course/entities/course.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';
import { Role } from '../role/entities/role.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefreshToken,
      User,
      UserPreference,
      Course,
      Chapter,
      Lesson,
      LessonProgress,
      Role,
      Payment,
      PaymentItem,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
