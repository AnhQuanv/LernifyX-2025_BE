import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CourseDto } from '../course/dto/course.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async handleGetUserWishlist(
    userId: string,
    page: number = 1,
    limit: number = 6,
  ) {
    const skip = (page - 1) * limit;
    const [wishlist, total] = await this.wishlistRepo.findAndCount({
      where: {
        user: { userId },
        course: {
          status: 'published',
        },
      },
      relations: ['course', 'course.category', 'course.instructor'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const courses = wishlist.map((w) => w.course);
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

  async handleAddToWishlist(userId: string, courseId: string) {
    const user = await this.userRepo.findOne({ where: { userId } });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });

    if (!user || !course) {
      throw new NotFoundException({
        message: 'Không tìm thấy user hoặc course',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const existing = await this.wishlistRepo.findOne({
      where: { user: { userId: userId }, course: { id: courseId } },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Khóa học đã có trong wishlist',
        errorCode: 'ITEM_ALREADY_EXISTS',
      });
    }

    const item = this.wishlistRepo.create({ user, course });
    await this.wishlistRepo.save(item);
    const formatted = plainToInstance(CourseDto, item.course, {
      excludeExtraneousValues: true,
    });

    return formatted;
  }

  async handleRemoveFromWishlist(userId: string, courseId: string) {
    const wishlist = await this.wishlistRepo.findOne({
      where: { user: { userId: userId }, course: { id: courseId } },
    });

    if (!wishlist)
      throw new NotFoundException({
        message: 'Không tìm thấy trong danh sách wishlist',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    await this.wishlistRepo.remove(wishlist);
    return courseId;
  }
}
