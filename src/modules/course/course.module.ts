import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Category } from '../category/entities/category.entity';
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Wishlist,
      CartItem,
      Payment,
      User,
      Comment,
      Category,
      LessonVideo,
      Lesson,
      Chapter,
      PaymentItem,
      LessonProgress,
    ]),
    CloudinaryModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
