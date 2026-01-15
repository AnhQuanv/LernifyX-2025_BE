import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

export interface CourseResponse {
  id: string;
  title: string;
  instructor?: string;
  image?: string;
  duration?: number;
  category?: string;
  level?: string;
  progress?: number;
  students: number;
  rating: number;
  ratingCount: number;
  originalPrice: number | null;
  price: number | null;
  discount: number | null;
  discountExpiresAt: Date | null;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  revenue?: number;
  netRevenue?: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async handleGetProfile(user_id: string) {
    const user = await this.userRepo.findOne({
      where: { userId: user_id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const userDTO = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return userDTO;
  }

  async handleUpdateProfile(userId: string, dto: UpdateProfileDto) {
    const idToFind = dto.userId || userId;

    const user = await this.userRepo.findOne({
      where: { userId: idToFind },
      relations: ['role'],
    });

    if (!user)
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.dateOfBirth) user.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.address) user.address = dto.address;
    if (dto.avatar) user.avatar = dto.avatar;
    if (dto.description) user.description = dto.description;
    if (dto.bio) user.bio = dto.bio;
    if (dto.password) user.password = dto.password;
    if (dto.isActive) user.isActive = dto.isActive;
    await this.userRepo.save(user);
    const userDTO = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return userDTO;
  }

  async handleChangePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.userRepo.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException({
        message: 'Mật khẩu cũ không đúng',
        errorCode: 'INVALID_OLD_PASSWORD',
      });
    }

    const isSame = await bcrypt.compare(dto.newPassword, user.password);
    if (isSame)
      throw new BadRequestException({
        message: 'Mật khẩu mới không được giống mật khẩu cũ',
        errorCode: 'PASSWORD_SAME_AS_OLD',
      });

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepo.save(user);

    return null;
  }

  async handleGetStudentsCourseProgress({
    limit = 6,
    page = 1,
    search = '',
    role = 'student',
  }) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepo.findAndCount({
      where: [
        {
          role: { roleName: role },
          fullName: Raw((alias) => `${alias} LIKE '%${search}%'`),
        },
        {
          role: { roleName: role },
          email: Raw((alias) => `${alias} LIKE '%${search}%'`),
        },
      ],
      relations: [
        'role',
        'payments',
        'payments.items',
        'payments.items.course',
        'payments.items.course.instructor',
        'payments.items.course.category',
        'payments.items.course.chapters',
        'payments.items.course.chapters.lessons',
        'lessonProgress',
        'lessonProgress.lesson',
        'courses',
        'courses.category',
        'courses.instructor',
        'courses.paymentItems',
        'courses.paymentItems.payment',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    const data = users.map((user) => {
      let coursesResult: CourseResponse[] = [];

      if (role === 'student') {
        const purchasedCoursesRaw =
          user.payments
            ?.filter((p) => p.status === 'success')
            .flatMap((p) => p.items.map((i) => i.course)) || [];

        const uniqueCourses = Array.from(
          new Map(purchasedCoursesRaw.map((c) => [c.id, c])).values(),
        );

        coursesResult = uniqueCourses.map((course) => {
          const allLessons = course.chapters?.flatMap((ch) => ch.lessons) || [];
          const completedLessons = allLessons.filter((l) =>
            user.lessonProgress?.some(
              (lp) => lp.lesson?.id === l.id && lp.completed,
            ),
          );
          const progress =
            allLessons.length > 0
              ? Math.round((completedLessons.length / allLessons.length) * 100)
              : 0;

          return {
            id: course.id,
            title: course.title,
            instructor: course.instructor?.fullName,
            image: course.image,
            duration: course.duration,
            category: course.category?.categoryName,
            level: course.level,
            progress: progress,
            students: course.students || 0,
            rating: Number(course.rating) || 0,
            ratingCount: course.ratingCount || 0,
            originalPrice: course.originalPrice,
            price: course.price,
            discount: course.discount,
            discountExpiresAt: course.discountExpiresAt,
            status: course.status,
          };
        });
      } else if (role === 'teacher') {
        const COMMISSION_RATE = 0.1; // Phí sàn 10%
        const taughtCourses =
          user.courses?.filter((c) => c.status === 'published') || [];

        coursesResult = taughtCourses.map((course) => {
          const totalRevenue =
            course.paymentItems?.reduce((sum: number, item) => {
              if (item.payment?.status === 'success') {
                return sum + (Number(item.price) || 0);
              }
              return sum;
            }, 0) || 0;

          const netRevenue = totalRevenue * (1 - COMMISSION_RATE);

          return {
            id: course.id,
            title: course.title,
            instructor: user.fullName,
            image: course.image,
            duration: course.duration,
            category: course.category?.categoryName,
            level: course.level,
            students: course.students || 0,
            rating: Number(course.rating) || 0,
            ratingCount: course.ratingCount || 0,
            originalPrice: course.originalPrice,
            price: course.price,
            discount: course.discount,
            discountExpiresAt: course.discountExpiresAt,
            status: course.status,
            revenue: Math.round(totalRevenue),
            netRevenue: Math.round(netRevenue),
          };
        });
      } else {
        coursesResult = [];
      }

      return {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        roleName: user.role?.roleName,
        isActive: user.isActive,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt.toISOString().split('T')[0],
        course: coursesResult,
      };
    });

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async handleDeleteUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['courses', 'payments'],
    });
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID: ${userId}`,
      );
    }
    try {
      await this.userRepo.remove(user);
      return true;
    } catch {
      throw new BadRequestException(
        'Không thể xóa người dùng này vì họ đã có dữ liệu khóa học hoặc giao dịch liên quan.',
      );
    }
  }
}
