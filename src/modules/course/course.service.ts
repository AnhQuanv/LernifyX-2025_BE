import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { FilterCoursesDto } from './dto/filter-courses.dto';
import { plainToInstance } from 'class-transformer';
import { CourseDetailDto, CourseDto } from './dto/course.dto';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { Payment } from '../payment/entities/payment.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}
  // async handleFilterCourses(
  //   {
  //     category = 'all',
  //     level = 'all',
  //     rating = 'all',
  //     sortBy = 'default',
  //     page = 1,
  //     limit = 6,
  //     search,
  //   }: FilterCoursesDto,
  //   userId?: string,
  // ) {
  //   const query = this.courseRepository
  //     .createQueryBuilder('course')
  //     .leftJoinAndSelect('course.category', 'category')
  //     .leftJoinAndSelect('course.instructor', 'instructor')
  //     .where('course.status = :status', { status: 'published' });

  //   if (category && category !== 'all') {
  //     query.andWhere('category.name = :category', { category });
  //   }

  //   if (level && level !== 'all') {
  //     query.andWhere('course.level = :level', { level });
  //   }

  //   if (rating && rating !== 'all') {
  //     query.andWhere('course.rating >= :rating', { rating: Number(rating) });
  //   }

  //   if (search && search.trim() !== '') {
  //     query.andWhere(
  //       '(course.title LIKE :search OR course.description LIKE :search OR instructor.fullName LIKE :search)',
  //       { search: `%${search}%` },
  //     );
  //   }

  //   switch (sortBy) {
  //     case 'a-z':
  //       query.orderBy('course.title', 'ASC');
  //       break;
  //     case 'z-a':
  //       query.orderBy('course.title', 'DESC');
  //       break;
  //     case 'price_asc':
  //       query.orderBy('course.price', 'ASC');
  //       break;
  //     case 'price_desc':
  //       query.orderBy('course.price', 'DESC');
  //       break;
  //     default:
  //       query.orderBy('course.createdAt', 'DESC'); // mặc định: mới nhất
  //       break;
  //   }

  //   let courses = await query.getMany();
  //   let wishlistCourseIds: string[] = [];
  //   let cartCourseIds: string[] = [];

  //   if (userId) {
  //     const wishlist = await this.wishlistRepository.find({
  //       where: { user: { userId } },
  //       relations: ['course'],
  //     });
  //     wishlistCourseIds = wishlist.map((w) => w.course.id);

  //     const cart = await this.cartRepository.find({
  //       where: { user: { userId } },
  //       relations: ['course'],
  //     });
  //     cartCourseIds = cart.map((w) => w.course.id);

  //     // Lấy danh sách course đã mua
  //     const payments = await this.paymentRepository.find({
  //       where: { user: { userId }, status: 'success' },
  //       relations: ['items', 'items.course'],
  //     });
  //     const purchasedCourseIds = payments.flatMap((p) =>
  //       p.items.map((i) => i.course.id),
  //     );

  //     // Lọc course đã mua
  //     courses = courses.filter((c) => !purchasedCourseIds.includes(c.id));
  //     total = courses.length;
  //   }
  //   const skip = (page - 1) * limit;
  //   query.skip(skip).take(limit);

  //   const formatted = plainToInstance(CourseDto, courses, {
  //     excludeExtraneousValues: true,
  //   }).map((course) => ({
  //     ...course,
  //     isInWishlist: wishlistCourseIds.includes(course.id),
  //     isInCart: cartCourseIds.includes(course.id),
  //   }));
  //   return {
  //     data: formatted,
  //     pagination: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  async handleFilterCourses(
    {
      category = 'all',
      level = 'all',
      rating = 'all',
      sortBy = 'default',
      page = 1,
      limit = 6,
      search,
    }: FilterCoursesDto,
    userId?: string,
  ) {
    // 1. Tạo query cơ bản
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.status = :status', { status: 'published' });

    if (category !== 'all') {
      query.andWhere('category.name = :category', { category });
    }

    if (level !== 'all') {
      query.andWhere('course.level = :level', { level });
    }

    if (rating !== 'all') {
      query.andWhere('course.rating >= :rating', { rating: Number(rating) });
    }

    if (search?.trim()) {
      query.andWhere(
        '(course.title LIKE :search OR course.description LIKE :search OR instructor.fullName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    switch (sortBy) {
      case 'a-z':
        query.orderBy('course.title', 'ASC');
        break;
      case 'z-a':
        query.orderBy('course.title', 'DESC');
        break;
      case 'price_asc':
        query.orderBy('course.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('course.price', 'DESC');
        break;
      default:
        query.orderBy('course.createdAt', 'DESC');
        break;
    }

    let courses = await query.getMany();

    let wishlistCourseIds: string[] = [];
    let cartCourseIds: string[] = [];
    if (userId) {
      const wishlist = await this.wishlistRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      });
      wishlistCourseIds = wishlist.map((w) => w.course.id);

      const cart = await this.cartRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      });
      cartCourseIds = cart.map((w) => w.course.id);

      const payments = await this.paymentRepository.find({
        where: { user: { userId }, status: 'success' },
        relations: ['items', 'items.course'],
      });
      const purchasedCourseIds = payments.flatMap((p) =>
        p.items.map((i) => i.course.id),
      );

      courses = courses.filter((c) => !purchasedCourseIds.includes(c.id));
    }

    const total = courses.length;

    const skip = (page - 1) * limit;
    const paginatedCourses = courses.slice(skip, skip + limit);

    const formatted = plainToInstance(CourseDto, paginatedCourses, {
      excludeExtraneousValues: true,
    }).map((course) => ({
      ...course,
      isInWishlist: wishlistCourseIds.includes(course.id),
      isInCart: cartCourseIds.includes(course.id),
    }));

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

  async handleGetHomeCourses(userId?: string): Promise<CourseDto[]> {
    // 1. Lấy tất cả khóa học published
    let courses = await this.courseRepository.find({
      where: { status: 'published' },
      relations: ['category', 'instructor'],
      order: { students: 'DESC' }, // ưu tiên nhiều học viên
    });

    let wishlistCourseIds: string[] = [];
    let cartCourseIds: string[] = [];

    if (userId) {
      // 2. Lấy wishlist & cart
      const wishlist = await this.wishlistRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      });
      wishlistCourseIds = wishlist.map((w) => w.course.id);

      const cart = await this.cartRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      });
      cartCourseIds = cart.map((w) => w.course.id);

      // 3. Lấy danh sách course đã mua
      const payments = await this.paymentRepository.find({
        where: { user: { userId }, status: 'success' },
        relations: ['items', 'items.course'],
      });
      const purchasedCourseIds = payments.flatMap((p) =>
        p.items.map((i) => i.course.id),
      );

      // 4. Lọc course đã mua
      courses = courses.filter((c) => !purchasedCourseIds.includes(c.id));
    }

    // 5. Lấy 12 khóa học nổi bật
    courses = courses.slice(0, 12);

    // 6. Map thêm isInWishlist, isInCart
    const formatted = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    }).map((course) => ({
      ...course,
      isInWishlist: wishlistCourseIds.includes(course.id),
      isInCart: cartCourseIds.includes(course.id),
    }));

    return formatted;
  }

  async handleGetCourseDetail(courseId: string): Promise<CourseDetailDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: 'published' },
      relations: [
        'category',
        'instructor',
        'chapters',
        'chapters.lessons',
        'comments',
        'comments.user',
      ],
    });
    if (!course)
      throw new NotFoundException({
        message: 'Không tìm thấy  course',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    return plainToInstance(CourseDetailDto, course, {
      excludeExtraneousValues: true,
    });
  }
}
