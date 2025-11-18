import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';
import { Course } from '../course/entities/course.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Payment,
      PaymentItem,
      Course,
      Wishlist,
      CartItem,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
