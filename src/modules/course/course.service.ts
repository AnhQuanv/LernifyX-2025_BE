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
import { User } from '../user/entities/user.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';
import { Comment } from '../comment/entities/comment.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

  //

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
        'comments',
        'comments.user',
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
    return {
      lessonId: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      canViewVideo,
      videoUrl: canViewVideo ? lesson.videoUrl : null,
      progress,
      hasQuiz,
      quiz,
    };
  }
}
