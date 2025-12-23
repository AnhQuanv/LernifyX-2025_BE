import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { In, Repository } from 'typeorm';
import {
  FilterCoursesDto,
  TeacherCourseFilterDto,
} from './dto/filter-courses.dto';
import { plainToInstance } from 'class-transformer';
import {
  CourseDetailDto,
  CourseDto,
  CourseStatusCountRaw,
  CreateCourseResponseDto,
} from './dto/course.dto';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { Category } from '../category/entities/category.entity';
import { UpdateCourseDto } from './dto/update-course.dto';
import { v2 as Cloudinary } from 'cloudinary';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';
type CourseWithRevenue = Course & {
  revenue: number | null;
};
interface GrossRevenueResult {
  grossRevenue: string | null;
}
export interface CourseRevenueDetail {
  id: string;
  name: string;
  value: number;
  netRevenue: number;
}
export interface CourseRevenueRawResult {
  id: string;
  studentCount: string;
  netRevenue: string;
}
interface CourseRevenueRaw {
  id: string;
  netRevenue: string;
}
const PLATFORM_FEE_RATE = 0.1;
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
    @InjectRepository(PaymentItem)
    private readonly paymentItemRepository: Repository<PaymentItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

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
    let courses = await this.courseRepository.find({
      where: { status: 'published' },
      relations: ['category', 'instructor'],
      order: { students: 'DESC' }, // ưu tiên nhiều học viên
    });

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

    courses = courses.slice(0, 12);

    const formatted = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    }).map((course) => ({
      ...course,
      isInWishlist: wishlistCourseIds.includes(course.id),
      isInCart: cartCourseIds.includes(course.id),
    }));

    return formatted;
  }

  async handleGetCourseDetail(
    courseId: string,
    userId?: string,
  ): Promise<CourseDetailDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: 'published' },
      relations: [
        'category',
        'instructor',
        'chapters',
        'chapters.lessons',
        'chapters.lessons.quizQuestions',
        'chapters.lessons.quizQuestions.options',
      ],
    });

    if (!course)
      throw new NotFoundException({
        message: 'Không tìm thấy khóa học',
        errorCode: 'RESOURCE_NOT_FOUND',
      });

    let isPurchased = false;
    let userLessonProgress: LessonProgress[] = [];

    if (userId) {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: [
          'payments',
          'payments.items',
          'payments.items.course',
          'lessonProgress',
          'lessonProgress.lesson',
          'lessonProgress.notes',
        ],
      });

      if (user) {
        const purchasedCourseIds = user.payments
          .filter((p) => p.status === 'success')
          .flatMap((p) => p.items.map((i) => i.course.id));

        isPurchased = purchasedCourseIds.includes(courseId);

        if (isPurchased) {
          const lessonIdsOfCourse = course.chapters.flatMap((ch) =>
            ch.lessons.map((ls) => ls.id),
          );

          userLessonProgress = user.lessonProgress.filter((p) =>
            lessonIdsOfCourse.includes(p.lesson.id),
          );
        }
      }
    }

    course.chapters = course.chapters
      .sort((a, b) => a.order - b.order)
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.sort((a, b) => a.order - b.order),
      }));

    const chaptersWithProgress = course.chapters.map((ch) => {
      const lessons = ch.lessons.map((lesson) => {
        const lp = userLessonProgress.find((p) => p.lesson.id === lesson.id);

        return {
          ...lesson,
          progress: isPurchased
            ? lp
              ? {
                  id: lp.id,
                  completed: lp.completed,
                  lastPosition: lp.lastPosition ?? 0,
                  notes:
                    lp.notes
                      ?.map((n) => ({
                        id: n.id,
                        text: n.text,
                        createdAt: n.createdAt,
                        updatedAt: n.updatedAt,
                      }))
                      .sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime(),
                      ) ?? [],
                  updatedAt: lp.updatedAt,
                }
              : null
            : null,
          hasQuiz: lesson.quizQuestions?.length > 0,
        };
      });

      return { ...ch, lessons };
    });

    const result = plainToInstance(
      CourseDetailDto,
      {
        ...course,
        chapters: chaptersWithProgress,
        isPurchased,
      },
      { excludeExtraneousValues: true },
    );

    return result;
  }

  async handleGetMyLearningCourses(
    { progressStatus = 'all', limit = 6, page = 1 },
    userId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: [
        'payments',
        'payments.items',
        'payments.items.course',
        'payments.items.course.instructor',
        'payments.items.course.category',
        'payments.items.course.chapters',
        'payments.items.course.chapters.lessons',
        'lessonProgress',
        'lessonProgress.lesson',
      ],
    });

    if (!user)
      return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };

    let purchasedCourses = user.payments
      .filter((p) => p.status === 'success')
      .flatMap((p) => p.items.map((i) => i.course));

    const uniqueCoursesMap: Record<string, (typeof purchasedCourses)[0]> = {};
    for (const course of purchasedCourses) {
      uniqueCoursesMap[course.id] = course;
    }
    purchasedCourses = Object.values(uniqueCoursesMap);

    const coursesWithProgress = purchasedCourses.map((course) => {
      const allLessons = course.chapters.flatMap((ch) => ch.lessons);
      const completedLessons = allLessons.filter((lesson) =>
        user.lessonProgress.some(
          (lp) => lp.lesson.id === lesson.id && lp.completed,
        ),
      );
      const progress =
        allLessons.length > 0
          ? Math.round((completedLessons.length / allLessons.length) * 100)
          : 0;

      return { course, progress };
    });

    const filteredCourses = coursesWithProgress.filter(({ progress }) => {
      switch (progressStatus) {
        case 'not-started':
          return progress === 0;
        case 'in-progress':
          return progress > 0 && progress < 100;
        case 'completed':
          return progress === 100;
        default:
          return true; // all
      }
    });

    const total = filteredCourses.length;
    const skip = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);

    const result = paginatedCourses.map(({ course, progress }) => ({
      ...plainToInstance(CourseDto, course, { excludeExtraneousValues: true }),
      progress,
    }));

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handleGetTeacher({
    search = '',
    page = 1,
    limit = 6,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .innerJoin('user.courses', 'course', 'course.status = :status', {
        status: 'published',
      })
      .where('role.roleName = :role', { role: 'teacher' })
      .andWhere(
        search
          ? '(user.fullName LIKE :search OR user.email LIKE :search)'
          : '1=1',
        { search: `%${search}%` },
      )
      .select([
        'user.userId AS id',
        'user.fullName AS name',
        'user.bio AS bio',
        'user.avatar AS image',
        'user.email AS email',
        'COUNT(course.id) AS courses',
        'COALESCE(SUM(course.students), 0) AS students',
      ])
      .groupBy('user.userId')
      // Thêm sắp xếp để giảng viên có nhiều học viên/khóa học lên đầu (tùy chọn)
      .orderBy('students', 'DESC');

    // Lấy tổng số giảng viên thỏa mãn (đã publish khóa học)
    const rawDataForAll = await qb.getRawMany();
    const total = rawDataForAll.length;

    const data = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handleGetLessonDetail(
    courseId: string,
    lessonId: string,
    userId: string,
  ) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: 'published' },
      relations: [
        'chapters',
        'chapters.lessons',
        'chapters.lessons.quizQuestions',
        'chapters.lessons.quizQuestions.options',
        'chapters.lessons.videoAsset',
      ],
    });
    if (!course) throw new NotFoundException('Không tìm thấy course');

    const user = await this.userRepository.findOne({
      where: { userId },
      relations: [
        'payments',
        'payments.items',
        'payments.items.course',
        'lessonProgress',
        'lessonProgress.lesson',
        'lessonProgress.notes',
      ],
    });
    if (!user) throw new NotFoundException('Không tìm thấy user');

    const purchasedCourseIds = user.payments
      .filter((p) => p.status === 'success')
      .flatMap((p) => p.items.map((i) => i.course.id));
    if (!purchasedCourseIds.includes(courseId))
      throw new NotFoundException('Chưa mua khóa học này');

    const lessonProgressMap = new Map(
      user.lessonProgress.map((lp) => [lp.lesson.id, lp]),
    );

    const allLessons = course.chapters
      .sort((a, b) => a.order - b.order)
      .flatMap((ch) => ch.lessons.sort((a, b) => a.order - b.order));

    const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
    if (lessonIndex === -1)
      throw new NotFoundException('Không tìm thấy lesson');

    const lesson = allLessons[lessonIndex];

    let canViewVideo = false;

    if (lessonIndex === 0) {
      canViewVideo = true;
    } else {
      const prevLesson = allLessons[lessonIndex - 1];
      const prevLp = lessonProgressMap.get(prevLesson.id);
      canViewVideo = prevLp?.completed || false;
    }

    const lp = lessonProgressMap.get(lessonId);
    const progress = lp
      ? {
          id: lp.id,
          completed: lp.completed,
          lastPosition: lp.lastPosition ?? 0,
          notes:
            lp.notes
              ?.map((n) => ({
                id: n.id,
                text: n.text,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
              }))
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              ) ?? [],
          updatedAt: lp.updatedAt,
        }
      : null;

    const hasQuiz = lesson.quizQuestions && lesson.quizQuestions.length > 0;
    const quiz = hasQuiz
      ? lesson.quizQuestions
          .sort((a, b) => a.order - b.order)
          .map((q) => {
            const optionsText = q.options.map((o) => o.text);
            const correctAnswerIndex = q.options.findIndex(
              (o) => o.id === q.correctOptionId,
            );

            return {
              id: q.id,
              question: q.question,
              options: optionsText,
              correctAnswer: correctAnswerIndex,
            };
          })
      : [];
    const videoAsset = lesson.videoAsset;
    return {
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      canViewVideo,
      videoAsset:
        canViewVideo && videoAsset
          ? {
              publicId: videoAsset.publicId,
              originalUrl: videoAsset.originalUrl,
              duration: videoAsset.duration,
              width: videoAsset.widthOriginal,
              height: videoAsset.heightOriginal,
            }
          : null,
      progress,
      hasQuiz,
      quiz,
    };
  }

  async handleGetTeacherDetail(teacherId: string, userId?: string) {
    const teacher = await this.userRepository.findOne({
      where: { userId: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    let courses = await this.courseRepository.find({
      where: {
        status: 'published',
        instructor: { userId: teacherId },
      },
      relations: ['category', 'instructor'],
      order: { students: 'DESC' },
    });

    let wishlistCourseIds: string[] = [];
    let cartCourseIds: string[] = [];
    let purchasedCourseIds: string[] = [];

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
      cartCourseIds = cart.map((c) => c.course.id);

      const payments = await this.paymentRepository.find({
        where: { user: { userId }, status: 'success' },
        relations: ['items', 'items.course'],
      });

      purchasedCourseIds = payments.flatMap((p) =>
        p.items.map((i) => i.course.id),
      );

      courses = courses.filter((c) => !purchasedCourseIds.includes(c.id));
    }

    const coursesList = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    }).map((course) => ({
      ...course,
      isInWishlist: wishlistCourseIds.includes(course.id),
      isInCart: cartCourseIds.includes(course.id),
    }));

    const totalStudents = courses.reduce(
      (sum, c) => sum + (c.students || 0),
      0,
    );

    return {
      id: teacher.userId,
      name: teacher.fullName,
      bio: teacher.bio,
      description: teacher.description,
      fullBio: teacher.bio,
      students: totalStudents,
      courses: courses.length,
      email: teacher.email,
      courses_list: coursesList,
      image: teacher.avatar,
    };
  }

  async handleCreateCourse(dto: CreateCourseDto, instructorId: string) {
    const course = new Course();

    course.title = dto.title;
    course.description = dto.description || '';
    course.requirements = dto.requirements || [];
    course.learnings = dto.learnings || [];
    course.level = dto.level || 'Cơ Bản';
    course.image = dto.image || '';

    course.originalPrice = dto.originalPrice
      ? parseFloat(dto.originalPrice)
      : null;
    course.price = dto.price ? parseFloat(dto.price) : null;

    if (dto.hasDiscount && course.price && course.originalPrice) {
      course.discount =
        ((course.originalPrice - course.price) / course.originalPrice) * 100;
      course.discountExpiresAt = dto.discountExpiresAt
        ? new Date(dto.discountExpiresAt)
        : null;
    } else {
      course.discount = null;
      course.discountExpiresAt = null;
    }

    if (dto.category) {
      const category = await this.categoryRepository.findOne({
        where: { categoryId: dto.category },
      });
      if (!category) throw new NotFoundException('Category not found');
      course.category = category;
    }

    const instructor = await this.userRepository.findOne({
      where: { userId: instructorId },
    });
    if (!instructor) throw new NotFoundException('Instructor not found');
    course.instructor = instructor;

    course.status = dto.status || 'draft';

    const savedCourse = await this.courseRepository.save(course);
    const formatted = plainToInstance(CreateCourseResponseDto, savedCourse, {
      excludeExtraneousValues: true,
    });
    return formatted;
  }

  async handleUpdateCourse(dto: UpdateCourseDto, instructorId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.id },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructor.userId !== instructorId) {
      throw new ForbiddenException('You are not allowed to update this course');
    }

    if (dto.title !== undefined) course.title = dto.title;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.requirements !== undefined) course.requirements = dto.requirements;
    if (dto.learnings !== undefined) course.learnings = dto.learnings;
    if (dto.level !== undefined) course.level = dto.level;
    if (dto.image !== undefined) course.image = dto.image;

    if (dto.category !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { categoryId: dto.category },
      });

      if (!category) throw new NotFoundException('Category not found');
      course.category = category;
    }

    if (dto.originalPrice !== undefined) {
      course.originalPrice = dto.originalPrice
        ? parseFloat(dto.originalPrice)
        : null;
    }

    if (dto.price !== undefined) {
      course.price = dto.price ? parseFloat(dto.price) : null;
    }

    if (dto.hasDiscount !== undefined) {
      if (dto.hasDiscount && course.price && course.originalPrice) {
        course.discount =
          ((course.originalPrice - course.price) / course.originalPrice) * 100;

        course.discountExpiresAt = dto.discountExpiresAt
          ? new Date(dto.discountExpiresAt)
          : null;
      } else {
        course.discount = null;
        course.discountExpiresAt = null;
      }
    }

    if (dto.status !== undefined) {
      course.status = dto.status;
    }

    const updated = await this.courseRepository.save(course);

    return plainToInstance(CreateCourseResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async handleDeleteCourse(courseId: string, instructorId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    console.log('teacher id: ', course.instructor.userId);
    console.log('user id: ', instructorId);

    if (course.instructor.userId !== instructorId) {
      throw new ForbiddenException('You are not allowed to update this course');
    }

    await this.courseRepository.delete(courseId);
  }

  async handleFilterTeacherCourses(
    {
      status = 'all',
      search,
      sortBy = 'newest',
      page = 1,
      limit = 6,
    }: TeacherCourseFilterDto,
    teacherId: string,
  ) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .where('instructor.userId = :teacherId', { teacherId });

    if (status && status !== 'all') {
      query.andWhere('course.status = :status', { status });
    }

    if (search) {
      query.andWhere('LOWER(course.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    switch (sortBy) {
      case 'newest':
        query.orderBy('course.createdAt', 'DESC');
        break;
      case 'oldest':
        query.orderBy('course.createdAt', 'ASC');
        break;
      case 'a-z':
        query.orderBy('course.title', 'ASC');
        break;
      case 'z-a':
        query.orderBy('course.title', 'DESC');
        break;
      default:
        query.orderBy('course.createdAt', 'DESC');
        break;
    }

    const skip = (page - 1) * limit;
    const [courses, totalCount] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const publishedCourses = courses.filter((c) => c.status === 'published');
    let coursesWithRevenue: CourseWithRevenue[];
    const PLATFORM_FEE_RATE = 0.1;
    if (publishedCourses.length > 0) {
      const courseIds = publishedCourses.map((c) => c.id);
      const revenueQuery = this.paymentItemRepository
        .createQueryBuilder('item')
        .select('item.course_id', 'courseId')
        .addSelect('SUM(item.price)', 'grossRevenue')
        .innerJoin('item.payment', 'payment')
        .where('item.course_id IN (:...courseIds)', { courseIds })
        .andWhere('payment.status = :paymentStatus', {
          paymentStatus: 'success',
        })
        .groupBy('item.course_id');

      const revenueResults: { courseId: string; grossRevenue: string }[] =
        await revenueQuery.getRawMany();
      const revenueMap = new Map<string, number>(
        revenueResults.map((r) => {
          const grossRevenue = parseFloat(r.grossRevenue);
          const netRevenue = grossRevenue * (1 - PLATFORM_FEE_RATE);
          return [r.courseId, parseFloat(netRevenue.toFixed(2))];
        }),
      );

      coursesWithRevenue = courses.map((course) => {
        // Lấy doanh thu thực nhận (Net Revenue)
        const revenue = revenueMap.get(course.id) || 0;

        return {
          ...course,
          revenue, // revenue ở đây là Net Revenue
        } as CourseWithRevenue;
      });
    } else {
      coursesWithRevenue = courses.map((course) => ({
        ...course,
        revenue: null,
      })) as CourseWithRevenue[];
    }
    const totalPages = Math.ceil(totalCount / limit);
    const formatted = plainToInstance(CourseDto, coursesWithRevenue);

    return {
      data: formatted,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: totalPages,
      },
    };
  }

  async handleGetTeacherCourseCounts(teacherId: string) {
    const baseQuery = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.instructor', 'instructor')
      .where('instructor.userId = :teacherId', { teacherId })
      .select('course.status', 'status')
      .addSelect('COUNT(course.id)', 'count')
      .groupBy('course.status');

    const results = await baseQuery.getRawMany<CourseStatusCountRaw>();

    const counts = {
      totalPublished: 0,
      totalPending: 0,
      totalDraft: 0,
      totalRejected: 0,
    };

    let totalAll = 0;

    for (const row of results) {
      const status = row.status;
      const count = parseInt(row.count, 10);
      totalAll += count;

      switch (status) {
        case 'published':
          counts.totalPublished = count;
          break;
        case 'pending':
          counts.totalPending = count;
          break;
        case 'draft':
          counts.totalDraft = count;
          break;
        case 'rejected':
          counts.totalRejected = count;
          break;
      }
    }

    return {
      ...counts,
      totalAll: totalAll,
    };
  }

  async handleGetTeacherCourseDetail(teacherId: string, courseId: string) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.id = :courseId', { courseId })
      .andWhere('course.instructor.userId = :teacherId', { teacherId })
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.chapters', 'chapter', undefined, {
        orderBy: { 'chapter.order': 'ASC' },
      })
      .leftJoinAndSelect('chapter.lessons', 'lesson', undefined, {
        orderBy: { 'lesson.order': 'ASC' },
      })
      .leftJoinAndSelect('lesson.videoAsset', 'videoAsset')
      .leftJoinAndSelect('lesson.quizQuestions', 'quizQuestion')
      .leftJoinAndSelect('quizQuestion.options', 'option')
      .getOne();

    if (!course) {
      throw new NotFoundException({
        message: 'Không tìm thấy khóa học',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }
    let netRevenue: number | null = null;
    const PLATFORM_FEE_RATE = 0.1;
    if (course.status === 'published') {
      const query = this.paymentItemRepository
        .createQueryBuilder('item')
        .select('SUM(item.price)', 'grossRevenue')
        .innerJoin('item.payment', 'payment')
        .where('item.course_id = :courseId', { courseId })
        .andWhere('payment.status = :paymentStatus', {
          paymentStatus: 'success',
        });

      const result = await query.getRawOne<GrossRevenueResult>();
      if (result && result.grossRevenue) {
        const grossRevenue = parseFloat(result.grossRevenue);
        const calculatedNetRevenue = grossRevenue * (1 - PLATFORM_FEE_RATE);
        netRevenue = parseFloat(calculatedNetRevenue.toFixed(2));
      } else {
        netRevenue = 0;
      }
    }

    const formattedCourse = {
      ...course,
      revenue: netRevenue,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => ({
          ...lesson,
          videoId: undefined,
          canViewVideo: !!lesson.videoAsset,
          hasQuiz: lesson.quizQuestions && lesson.quizQuestions.length > 0,
        })),
      })),
    };
    const result = plainToInstance(CourseDetailDto, formattedCourse, {
      excludeExtraneousValues: true,
    });
    return result;
  }

  async handleGetTeacherCourseStudentProgress(
    courseId: string,
    teacherId: string,
    page: number,
    limit: number,
  ) {
    const course = await this.courseRepository.findOne({
      where: {
        id: courseId,
        instructor: {
          userId: teacherId,
        },
      },
      relations: ['instructor', 'chapters', 'chapters.lessons'],
    });

    if (!course) {
      throw new ForbiddenException(
        'Bạn không phải là người hướng dẫn của khóa học này hoặc khóa học không tồn tại.',
      );
    }

    const allLessonIds =
      course.chapters?.flatMap((c) => c.lessons.map((l) => l.id)) || [];
    const totalLessons = allLessonIds.length;

    const payments = await this.paymentItemRepository.find({
      where: {
        course: { id: courseId },
        payment: { status: 'success' },
      },
      relations: ['payment', 'payment.user'],
    });

    const buyerIds = Array.from(
      new Set(payments.map((item) => item.payment.user.userId)),
    );
    const totalStudents = buyerIds.length;

    if (totalStudents === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }

    const completedMap = new Map<string, number>();
    if (totalLessons > 0) {
      const progress = await this.lessonProgressRepository.find({
        where: {
          user: { userId: In(buyerIds) },
          lesson: { id: In(allLessonIds) },
          completed: true,
        },
        relations: ['lesson', 'user'],
      });

      progress.forEach((p) => {
        const count = completedMap.get(p.user.userId) || 0;
        completedMap.set(p.user.userId, count + 1);
      });
    }

    const studentInfos = await this.userRepository.find({
      where: { userId: In(buyerIds) },
    });

    const mappedResult = studentInfos.map((user) => {
      const completedLessons = completedMap.get(user.userId) || 0;
      const progressPercentage =
        totalLessons > 0
          ? parseFloat(((completedLessons / totalLessons) * 100).toFixed(2))
          : 0;

      return {
        user: {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar || null,
        },
        progressPercentage,
      };
    });

    const startIndex = (page - 1) * limit;
    const pagedResult = mappedResult.slice(startIndex, startIndex + limit);

    return {
      data: pagedResult,
      pagination: {
        total: totalStudents,
        page,
        limit,
        totalPages: Math.ceil(totalStudents / limit),
      },
    };
  }

  async handleGetTeacherCourseEdit(teacherId: string, courseId: string) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.id = :courseId', { courseId })
      .andWhere('course.instructor.userId = :teacherId', { teacherId })
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.chapters', 'chapter', undefined, {
        orderBy: { 'chapter.order': 'ASC' },
      })
      .leftJoinAndSelect('chapter.lessons', 'lesson', undefined, {
        orderBy: { 'lesson.order': 'ASC' },
      })
      .leftJoinAndSelect('lesson.videoAsset', 'videoAsset')
      .leftJoinAndSelect('lesson.quizQuestions', 'quizQuestion', undefined, {
        orderBy: { 'quizQuestion.order': 'ASC' },
      })
      .leftJoinAndSelect('quizQuestion.options', 'option')
      .getOne();

    if (!course) {
      throw new NotFoundException({
        message: 'Không tìm thấy khóa học',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }
    if (course.instructor.userId !== teacherId) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền truy cập khóa học này',
        errorCode: 'FORBIDDEN',
      });
    }

    const formattedCourse = {
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        createdAt: undefined,
        updatedAt: undefined,
        lessons: chapter.lessons.map((lesson) => ({
          ...lesson,
          videoId: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          videoAsset: lesson.videoAsset
            ? {
                id: lesson.videoAsset.id,
                originalUrl: lesson.videoAsset.originalUrl,
                duration: lesson.videoAsset.duration,
                widthOriginal: lesson.videoAsset.widthOriginal,
                heightOriginal: lesson.videoAsset.heightOriginal,
              }
            : null,
          hasQuiz: lesson.quizQuestions && lesson.quizQuestions.length > 0,
          quiz: lesson.quizQuestions?.map((q) => ({
            ...q,
            createdAt: undefined,
            updatedAt: undefined,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
            })),
          })),
        })),
      })),
    };
    const result = plainToInstance(CourseDetailDto, formattedCourse);
    return result;
  }

  async handleGetTeacherCoursesRevenue(teacherId: string) {
    const teacherPublishedCourses = await this.courseRepository.find({
      select: ['id', 'title', 'students'],
      where: {
        instructor: { userId: teacherId },
        status: 'published',
      },
      relations: ['instructor'],
    });

    if (!teacherPublishedCourses || teacherPublishedCourses.length === 0) {
      return {
        totalPublishedCourses: 0,
        totalStudents: 0,
        totalNetRevenue: 0,
        courseRevenueDetails: [],
      };
    }

    const teacherCourseIds = teacherPublishedCourses.map((c) => c.id);

    const courseRevenueRaw: CourseRevenueRawResult[] =
      await this.paymentItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.payment', 'payment', 'payment.status = :status', {
          status: 'success',
        })
        .innerJoin('payment.user', 'buyer')

        .where('item.course_id IN (:...courseIds)', {
          courseIds: teacherCourseIds,
        })

        .select('item.course_id', 'id')
        .addSelect(`SUM(item.price * (1 - :feeRate))`, 'netRevenue')
        .setParameter('feeRate', PLATFORM_FEE_RATE)

        .groupBy('item.course_id')
        .getRawMany();

    const totalStudentsFromCourses = teacherPublishedCourses.reduce(
      (sum, course) => sum + (course.students || 0),
      0,
    );

    const totalStudents = totalStudentsFromCourses;

    let totalNetRevenue = 0;
    const courseNetRevenues: { id: string; netValue: number }[] = [];
    for (const raw of courseRevenueRaw) {
      const netRevenueValue = parseFloat(raw.netRevenue) || 0;
      totalNetRevenue += netRevenueValue;
      courseNetRevenues.push({ id: raw.id, netValue: netRevenueValue });
    }
    const courseRevenueDetails: CourseRevenueDetail[] = [];
    for (const item of courseNetRevenues) {
      const courseId = item.id;
      const netRevenueValue = item.netValue;

      const courseTitle =
        teacherPublishedCourses.find((c) => c.id === courseId)?.title ||
        'Khóa học không xác định';

      let percentValue = 0;
      if (totalNetRevenue > 0) {
        percentValue = (netRevenueValue / totalNetRevenue) * 100;
      }

      courseRevenueDetails.push({
        id: courseId,
        name: courseTitle,
        value: parseFloat(percentValue.toFixed(2)),
        netRevenue: netRevenueValue,
      });
    }
    return {
      totalPublishedCourses: teacherPublishedCourses.length,
      totalStudents: totalStudents,
      totalNetRevenue: parseFloat(totalNetRevenue.toFixed(2)),
      courseRevenueDetails: courseRevenueDetails,
    };
  }

  async handleGetTeacherCoursesRevenuePage(teacherId: string) {
    const teacherPublishedCourses = await this.courseRepository.find({
      select: ['id', 'title', 'rating', 'students'],
      where: {
        instructor: { userId: teacherId },
        status: 'published',
      },
      relations: ['instructor'],
    });

    if (!teacherPublishedCourses || teacherPublishedCourses.length === 0) {
      return [];
    }

    const teacherCourseIds = teacherPublishedCourses.map((c) => c.id);

    const courseRevenueRaw = await this.paymentItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment', 'payment.status = :status', {
        status: 'success',
      })
      .where('item.course_id IN (:...courseIds)', {
        courseIds: teacherCourseIds,
      })
      .select('item.course_id', 'id')
      .addSelect(`SUM(item.price * (1 - :feeRate))`, 'netRevenue')
      .setParameter('feeRate', PLATFORM_FEE_RATE)
      .groupBy('item.course_id')
      .getRawMany();

    const courseNetRevenues: { id: string; netValue: number }[] = [];

    for (const raw of courseRevenueRaw as CourseRevenueRaw[]) {
      const netRevenueValue = parseFloat(raw.netRevenue) || 0;

      if (netRevenueValue > 0) {
        courseNetRevenues.push({ id: raw.id, netValue: netRevenueValue });
      }
    }

    const courseInfoMap = new Map(
      teacherPublishedCourses.map((c) => [
        c.id,
        { title: c.title, rating: c.rating, students: c.students },
      ]),
    );

    const courseRevenueDetails = courseNetRevenues.map((item) => {
      const courseId = item.id;
      const netRevenueValue = item.netValue;
      const courseInfo = courseInfoMap.get(courseId);
      const courseTitle = courseInfo?.title || 'Khóa học không xác định';
      const courseRating = courseInfo?.rating || 0;
      const courseStudents = courseInfo?.students || 0;

      return {
        id: courseId,
        name: courseTitle,
        rating: courseRating,
        students: courseStudents,
        netRevenue: netRevenueValue,
      };
    });

    return courseRevenueDetails;
  }
}
