import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CourseDto } from '../course/dto/course.dto';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async handleGetUserCart(userId: string, page: number = 1, limit: number = 6) {
    const skip = (page - 1) * limit;
    const [cart, total] = await this.cartRepo.findAndCount({
      where: {
        user: { userId },
        isPurchased: false,
        course: {
          status: 'published',
        },
      },
      relations: ['course', 'course.category', 'course.instructor'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const courses = cart.map((c) => c.course);
    const formatted = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    });

    return {
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handleAddToCart(userId: string, courseId: string) {
    const user = await this.userRepo.findOne({ where: { userId } });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });

    if (!user || !course) {
      throw new NotFoundException({
        message: 'Không tìm thấy user hoặc course',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const existing = await this.cartRepo.findOne({
      where: {
        user: { userId: userId },
        course: { id: courseId },
        isPurchased: false,
      },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Khóa học đã có trong giỏ hàng',
        errorCode: 'ITEM_ALREADY_EXISTS',
      });
    }
    const item = this.cartRepo.create({ user, course });
    await this.cartRepo.save(item);
    const formatted = plainToInstance(CourseDto, item.course, {
      excludeExtraneousValues: true,
    });

    return formatted;
  }

  async handleRemoveFromCart(userId: string, courseId: string) {
    const cart = await this.cartRepo.findOne({
      where: {
        user: { userId: userId },
        course: { id: courseId },
        isPurchased: false,
      },
    });

    if (!cart)
      throw new NotFoundException({
        message: 'Không tìm thấy trong danh sách cart',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    await this.cartRepo.remove(cart);
    return courseId;
  }
}
