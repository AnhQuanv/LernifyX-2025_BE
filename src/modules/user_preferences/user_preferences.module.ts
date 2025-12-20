import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user_preferences.service';
import { UserPreferencesController } from './user_preferences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from './entities/user_preference.entity';
import { Course } from '../course/entities/course.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreference,
      Course,
      CartItem,
      Wishlist,
      User,
      Category,
      PaymentItem,
    ]),
  ],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
})
export class UserPreferencesModule {}
