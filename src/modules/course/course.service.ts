/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import {
  FilterCoursesDto,
  TeacherCourseFilterDto,
} from './dto/filter-courses.dto';
import { plainToInstance } from 'class-transformer';
import {
  CourseDetailDto,
  CourseDto,
  CourseDto1,
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
import { LessonVideo } from '../lesson_video/entities/lesson_video.entity';
import { v4 as uuidv4 } from 'uuid';
import { QuizOption } from '../quiz_option/entities/quiz_option.entity';
import { QuizQuestion } from '../quiz_question/entities/quiz_question.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Chapter } from '../chapter/entities/chapter.entity';

interface GrossRevenueResult {
  grossRevenue: string | null;
}

export interface TeacherCourseTree {
  id: string;
  name: string;
  courses: {
    id: string;
    title: string;
  }[];
}

export interface CourseRevenueDetail {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  value: number;
  gmv: number;
  netRevenue: number;
}
export interface CourseRevenueRawResult {
  id: string;
  studentCount: string;
  netRevenue: string;
}
interface CourseRevenueRaw {
  courseId: string;
  netRevenue: string;
}

interface CourseRevenueRaw1 {
  courseId: string;
  totalBasePrice: string | null;
}

interface AdminCourseRevenueRaw {
  courseId: string;
  totalBaseRevenue: string | null;
}

interface CourseStatsRaw {
  totalAll: string;
  totalPublished: string;
  totalPending: string;
  totalDraft: string;
  totalRejected: string;
  totalArchived: string;
}
const PLATFORM_FEE_RATE = 0.1;
@Injectable()
export class CourseService {
  constructor(
    private dataSource: DataSource,
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
      order: { students: 'DESC' },
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
          return true;
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
      .orderBy('students', 'DESC');

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

  async handleGetLessonDetailForTeacher(courseId: string, lessonId: string) {
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

    if (!course) throw new NotFoundException('Không tìm thấy khóa học');

    const allLessons = course.chapters
      .sort((a, b) => a.order - b.order)
      .flatMap((ch) => ch.lessons.sort((a, b) => a.order - b.order));

    const lesson = allLessons.find((l) => l.id === lessonId);
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học');

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
      canViewVideo: true,
      videoAsset: videoAsset
        ? {
            publicId: videoAsset.publicId,
            originalUrl: videoAsset.originalUrl,
            duration: videoAsset.duration,
            width: videoAsset.widthOriginal,
            height: videoAsset.heightOriginal,
          }
        : null,
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

  async handleCreateCourseDraft(courseId: string, userId: string) {
    if (!courseId) {
      throw new BadRequestException('courseId không được để trống');
    }
    return await this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(Course, {
        where: { id: courseId, instructor: { userId } },
        relations: [
          'category',
          'instructor',
          'chapters',
          'chapters.lessons',
          'chapters.lessons.videoAsset',
          'chapters.lessons.quizQuestions',
          'chapters.lessons.quizQuestions.options',
        ],
      });

      if (!course) throw new NotFoundException('Không tìm thấy khóa học');
      if (!['published', 'archived'].includes(course.status)) {
        return { redirectId: course.id };
      }

      const existingDraft = await manager.findOne(Course, {
        where: {
          parentId: courseId,
          status: In(['draft', 'pending', 'rejected']),
        },
      });
      if (existingDraft) return { redirectId: existingDraft.id };

      const newChapters = (course.chapters || []).map((chapter) => {
        const newLessons = (chapter.lessons || []).map((lesson) => {
          let newVideoAsset: LessonVideo | null = null;
          if (lesson.videoAsset) {
            const { id, lesson: _, ...videoData } = lesson.videoAsset;
            newVideoAsset = manager.create(LessonVideo, {
              ...videoData,
              id: uuidv4(),
            } as DeepPartial<LessonVideo>);
          }

          const newQuizQuestions = (lesson.quizQuestions || []).map((q) => {
            const newQuestionId = uuidv4();
            let newCorrectOptionId: string | null = null;

            const newOptions = (q.options || []).map((o) => {
              const newOptionId = uuidv4();
              if (o.id === q.correctOptionId) {
                newCorrectOptionId = newOptionId;
              }
              const { id, createdAt, updatedAt, ...optionData } = o;
              return manager.create(QuizOption, {
                ...optionData,
                id: newOptionId,
              });
            });

            const { id, createdAt, updatedAt, options, ...qData } = q;
            return manager.create(QuizQuestion, {
              ...qData,
              id: newQuestionId,
              options: newOptions,
              correctOptionId: newCorrectOptionId ?? undefined,
            } as any);
          });

          const {
            id: originalLessonId,
            createdAt,
            updatedAt,
            videoAsset,
            quizQuestions,
            ...lessonData
          } = lesson;
          return manager.create(Lesson, {
            ...lessonData,
            id: uuidv4(),
            parentId: originalLessonId,
            videoAsset: newVideoAsset ?? undefined,
            quizQuestions: newQuizQuestions,
          } as any);
        });

        const {
          id: originalChapterId,
          createdAt,
          updatedAt,
          lessons,
          ...chapterData
        } = chapter;
        return manager.create(Chapter, {
          ...chapterData,
          id: uuidv4(),
          parentId: originalChapterId,
          lessons: newLessons,
        });
      });

      const { id, createdAt, updatedAt, childDrafts, chapters, ...courseData } =
        course;
      const draftCourse = manager.create(Course, {
        ...courseData,
        id: uuidv4(),
        status: 'draft',
        isLive: false,
        parentId: courseId,
        hasDraft: false,
        chapters: newChapters,
        students: 0,
        rating: 0,
        ratingCount: 0,
      });

      const savedDraft = await manager.save(draftCourse);

      await manager.update(Course, courseId, { hasDraft: true });
      const parentCourse = await manager.findOne(Course, {
        where: { id: courseId },
      });

      if (parentCourse) {
        parentCourse.hasDraft = true;
        const updatedParent = await manager.save(parentCourse);
      }

      return { id: savedDraft.id };
    });
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

  async handleUpdateCourse(
    dto: UpdateCourseDto,
    instructorId: string,
    userRole?: string,
  ) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.id },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học!');
    }

    const isOwner = course.instructor.userId === instructorId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này!',
      );
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

    if (dto.rejectionReason !== undefined) {
      course.rejectionReason = dto.rejectionReason;
    }

    if (dto.archiveReason !== undefined) {
      course.archiveReason = dto.archiveReason;
    }

    if (dto.submissionNote !== undefined) {
      course.submissionNote = dto.submissionNote;
    }

    if (dto.isLive !== undefined) {
      course.isLive = dto.isLive;
    }

    const updated = await this.courseRepository.save(course);

    return plainToInstance(CreateCourseResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async handleApproveChildCourse(childCourseId: string, adminId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const childCourse = await manager.findOne(Course, {
        where: { id: childCourseId },
        relations: [
          'instructor',
          'category',
          'chapters',
          'chapters.lessons',
          'chapters.lessons.videoAsset',
          'chapters.lessons.quizQuestions',
          'chapters.lessons.quizQuestions.options',
        ],
      });

      if (!childCourse) {
        throw new NotFoundException('Không tìm thấy bản nháp khóa học');
      }

      if (!childCourse.parentId) {
        throw new BadRequestException(
          'Khóa học này không phải là bản nháp (không có ParentId)',
        );
      }

      const parentCourse = await manager.findOne(Course, {
        where: { id: childCourse.parentId },
        relations: ['category'],
      });

      if (!parentCourse) {
        throw new NotFoundException('Không tìm thấy khóa học gốc để đồng bộ');
      }

      parentCourse.title = childCourse.title;
      parentCourse.description = childCourse.description;
      parentCourse.requirements = childCourse.requirements;
      parentCourse.learnings = childCourse.learnings;
      parentCourse.price = childCourse.price;
      parentCourse.originalPrice = childCourse.originalPrice;
      parentCourse.discount = childCourse.discount;
      parentCourse.image = childCourse.image;
      parentCourse.level = childCourse.level;
      parentCourse.category = childCourse.category;
      parentCourse.isLive = childCourse.isLive;
      parentCourse.hasDraft = false;
      parentCourse.status = 'published';

      for (const childChapter of childCourse.chapters) {
        if (!childChapter.parentId) continue;

        const targetChapter = await manager.findOne(Chapter, {
          where: { id: childChapter.parentId },
        });

        if (targetChapter) {
          targetChapter.title = childChapter.title;
          targetChapter.order = childChapter.order;
          await manager.save(targetChapter);

          for (const childLesson of childChapter.lessons) {
            if (!childLesson.parentId) continue;

            const targetLesson = await manager.findOne(Lesson, {
              where: { id: childLesson.parentId },
              relations: ['videoAsset'],
            });

            if (targetLesson) {
              targetLesson.title = childLesson.title;
              targetLesson.content = childLesson.content;
              targetLesson.order = childLesson.order;
              targetLesson.duration = childLesson.duration;

              if (childLesson.videoAsset) {
                if (targetLesson.videoAsset) {
                  targetLesson.videoAsset.publicId =
                    childLesson.videoAsset.publicId;
                  targetLesson.videoAsset.originalUrl =
                    childLesson.videoAsset.originalUrl;
                  targetLesson.videoAsset.duration =
                    childLesson.videoAsset.duration;
                  await manager.save(targetLesson.videoAsset);
                } else {
                  const newVideo = manager.create(LessonVideo, {
                    publicId: childLesson.videoAsset.publicId,
                    originalUrl: childLesson.videoAsset.originalUrl,
                    duration: childLesson.videoAsset.duration,
                    lesson: targetLesson,
                  });
                  await manager.save(newVideo);
                }
              }

              await manager.delete(QuizQuestion, {
                lesson: { id: targetLesson.id },
              });

              if (
                childLesson.quizQuestions &&
                childLesson.quizQuestions.length > 0
              ) {
                for (const childQuiz of childLesson.quizQuestions) {
                  const newQuiz = manager.create(QuizQuestion, {
                    id: uuidv4(),
                    question: childQuiz.question,
                    order: childQuiz.order,
                    lesson: targetLesson,
                  });
                  const savedQuiz = await manager.save(newQuiz);

                  let newCorrectId: string | null = null;
                  for (const opt of childQuiz.options) {
                    const newOptId = uuidv4();
                    if (opt.id === childQuiz.correctOptionId) {
                      newCorrectId = newOptId;
                    }
                    await manager.save(QuizOption, {
                      id: newOptId,
                      text: opt.text,
                      question: savedQuiz,
                    });
                  }
                  await manager.update(QuizQuestion, savedQuiz.id, {
                    correctOptionId: newCorrectId ?? undefined,
                  });
                }
              }
              await manager.save(targetLesson);
            }
          }
        }
      }

      await manager.save(parentCourse);

      childCourse.status = 'published';
      await manager.save(childCourse);
      await manager.delete(Course, childCourse.id);
      return {
        success: true,
        message: 'Đã phê duyệt và đồng bộ nội dung thành công',
      };
    });
  }

  async handleDeleteCourse(courseId: string, instructorId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học!');
    }

    if (course.instructor.userId !== instructorId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật khóa học này!');
    }

    await this.courseRepository.delete(courseId);
  }

  async handleDeletePublishedCourse(courseId: string, instructorId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học!');
    }

    if (course.instructor.userId !== instructorId) {
      throw new ForbiddenException('Bạn không có quyền xóa khóa học này!');
    }

    const parentId = course.parentId;

    await this.courseRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Course, courseId);
        if (parentId) {
          await transactionalEntityManager.update(
            Course,
            { id: parentId },
            { hasDraft: false },
          );
        }
      },
    );
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
      .leftJoinAndSelect('course.childDrafts', 'childDrafts')
      .where('instructor.userId = :teacherId', { teacherId })
      .andWhere('course.parentId IS NULL');

    if (status && status !== 'all') {
      if (status === 'published' || status === 'archived') {
        query.andWhere('course.status = :status', { status });
      } else {
        query.andWhere(
          '(course.status = :status OR childDrafts.status = :status)',
          { status },
        );
      }
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

    let coursesWithRevenue: any[] = [];
    const TEACHER_COMMISSION_RATE = 0.9;

    if (courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const revenueResults = await this.paymentItemRepository
        .createQueryBuilder('item')
        .select('item.course_id', 'courseId')
        .addSelect('SUM(item.price)', 'totalBasePrice')
        .innerJoin('item.payment', 'payment')
        .where('item.course_id IN (:...courseIds)', { courseIds })
        .andWhere('payment.status = :paymentStatus', {
          paymentStatus: 'success',
        })
        .groupBy('item.course_id')
        .getRawMany<CourseRevenueRaw1>();

      const revenueMap = new Map<string, { basePrice: number; net: number }>(
        revenueResults.map((r) => [
          r.courseId,
          {
            basePrice: parseFloat(r.totalBasePrice || '0'),
            net: parseFloat(r.totalBasePrice || '0') * TEACHER_COMMISSION_RATE,
          },
        ]),
      );

      coursesWithRevenue = courses.map((course) => {
        const revData = revenueMap.get(course.id) || { basePrice: 0, net: 0 };
        return {
          ...course,
          revenue: revData.basePrice,
          netRevenue: revData.net,
        };
      });
    }

    const totalPages = Math.ceil(totalCount / limit);
    const formatted = plainToInstance(CourseDto1, coursesWithRevenue);

    return {
      data: formatted,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
      },
    };
  }

  async handleGetTeacherCourseCounts(teacherId: string) {
    const result = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.instructor', 'instructor')
      .leftJoin('course.childDrafts', 'child')
      .where('instructor.userId = :teacherId', { teacherId })
      .andWhere('course.parentId IS NULL')
      .select([
        'COUNT(DISTINCT course.id) AS totalAll',
        "COUNT(DISTINCT CASE WHEN course.status = 'published' THEN course.id END) AS totalPublished",
        "COUNT(DISTINCT CASE WHEN course.status = 'archived' THEN course.id END) AS totalArchived",
        "COUNT(DISTINCT CASE WHEN course.status = 'pending' OR child.status = 'pending' THEN course.id END) AS totalPending",
        "COUNT(DISTINCT CASE WHEN course.status = 'draft' OR child.status = 'draft' THEN course.id END) AS totalDraft",
        "COUNT(DISTINCT CASE WHEN course.status = 'rejected' OR child.status = 'rejected' THEN course.id END) AS totalRejected",
      ])
      .getRawOne<CourseStatsRaw>();

    if (!result) return this.getDefaultCounts();

    return {
      totalAll: parseInt(result.totalAll, 10),
      totalPublished: parseInt(result.totalPublished, 10),
      totalPending: parseInt(result.totalPending, 10),
      totalDraft: parseInt(result.totalDraft, 10),
      totalRejected: parseInt(result.totalRejected, 10),
      totalArchived: parseInt(result.totalArchived, 10),
    };
  }

  private getDefaultCounts() {
    return {
      totalAll: 0,
      totalPublished: 0,
      totalPending: 0,
      totalDraft: 0,
      totalRejected: 0,
      totalArchived: 0,
    };
  }

  async handleGetTeacherCourseDetail(
    userId: string,
    courseId: string,
    isAdmin: boolean = false,
  ) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lessons', 'lesson')
      .leftJoinAndSelect('lesson.videoAsset', 'videoAsset')
      .leftJoinAndSelect('lesson.quizQuestions', 'quizQuestion')
      .leftJoinAndSelect('quizQuestion.options', 'option')
      .where('course.id = :courseId', { courseId });

    if (!isAdmin) {
      query.andWhere('course.instructor.userId = :userId', { userId });
    }

    query.orderBy({
      'chapter.order': 'ASC',
      'lesson.order': 'ASC',
    });

    const course = await query.getOne();

    if (!course) {
      throw new NotFoundException({
        message: 'Không tìm thấy khóa học hoặc bạn không có quyền truy cập',
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
    isAdmin: boolean = false,
  ) {
    const whereCondition: FindOptionsWhere<Course> = { id: courseId };

    if (!isAdmin) {
      whereCondition.instructor = { userId: teacherId };
    }

    const course = await this.courseRepository.findOne({
      where: whereCondition,
      relations: ['instructor', 'chapters', 'chapters.lessons'],
    });

    if (!course) {
      throw new ForbiddenException(
        isAdmin
          ? 'Khóa học không tồn tại.'
          : 'Bạn không phải là người hướng dẫn của khóa học này hoặc khóa học không tồn tại.',
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
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
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
    const allTeacherCourses = await this.courseRepository.find({
      select: ['id', 'title', 'status'],
      where: { instructor: { userId: teacherId } },
    });

    if (!allTeacherCourses || allTeacherCourses.length === 0) {
      return { courseRevenueDetails: [] };
    }

    const allCourseIds = allTeacherCourses.map((c) => c.id);

    const courseRevenueRaw = await this.paymentItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment', 'payment.status = :status', {
        status: 'success',
      })
      .where('item.course_id IN (:...courseIds)', {
        courseIds: allCourseIds,
      })
      .select('item.course_id', 'id')
      .addSelect('SUM(item.price)', 'gmv')
      .groupBy('item.course_id')
      .getRawMany<{ id: string; gmv: string }>();

    const TEACHER_RATE = 1 - PLATFORM_FEE_RATE;

    const totalNetRevenue = courseRevenueRaw.reduce(
      (sum, raw) => sum + parseFloat(raw.gmv) * TEACHER_RATE,
      0,
    );

    const courseRevenueDetails: CourseRevenueDetail[] = courseRevenueRaw.map(
      (raw) => {
        const courseId = raw.id;
        const gmvValue = parseFloat(raw.gmv) || 0;
        const netRevenueValue = gmvValue * TEACHER_RATE;

        const courseInfo = allTeacherCourses.find((c) => c.id === courseId);
        const courseTitle = courseInfo?.title || 'Khóa học không xác định';
        const courseStatus = courseInfo?.status || 'archived';

        let percentValue = 0;
        if (totalNetRevenue > 0) {
          percentValue = (netRevenueValue / totalNetRevenue) * 100;
        }

        return {
          id: courseId,
          name: courseTitle,
          status: courseStatus,
          value: parseFloat(percentValue.toFixed(2)),
          gmv: parseFloat(gmvValue.toFixed(2)),
          netRevenue: parseFloat(netRevenueValue.toFixed(2)),
        };
      },
    );

    return {
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
      .select('item.course_id', 'courseId')
      .addSelect(`SUM(item.price * (1 - :feeRate))`, 'netRevenue')
      .setParameter('feeRate', PLATFORM_FEE_RATE)
      .groupBy('item.course_id')
      .getRawMany<CourseRevenueRaw>();

    const courseInfoMap = new Map(
      teacherPublishedCourses.map((c) => [
        c.id,
        { title: c.title, rating: c.rating, students: c.students },
      ]),
    );

    const courseRevenueDetails = courseRevenueRaw.map((raw) => {
      const courseId = raw.courseId;
      const netRevenueValue = parseFloat(raw.netRevenue) || 0;
      const courseInfo = courseInfoMap.get(courseId);

      return {
        id: courseId,
        name: courseInfo?.title || 'Khóa học không xác định',
        rating: courseInfo?.rating || '0',
        students: courseInfo?.students || 0,
        netRevenue: netRevenueValue,
      };
    });

    return courseRevenueDetails;
  }

  async handleGetAdminCourseCounts() {
    const result = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.childDrafts', 'child')
      .where('course.parentId IS NULL')
      .select([
        "COUNT(DISTINCT CASE WHEN course.status != 'draft' THEN course.id END) AS totalAll",
        "COUNT(DISTINCT CASE WHEN course.status = 'published' THEN course.id END) AS totalPublished",
        "COUNT(DISTINCT CASE WHEN course.status = 'archived' THEN course.id END) AS totalArchived",
        "COUNT(DISTINCT CASE WHEN course.status = 'pending' OR child.status = 'pending' THEN course.id END) AS totalPending",
        "COUNT(DISTINCT CASE WHEN course.status = 'rejected' OR child.status = 'rejected' THEN course.id END) AS totalRejected",
      ])
      .getRawOne<Omit<CourseStatsRaw, 'totalDraft'>>();

    if (!result) {
      return {
        totalAll: 0,
        totalPublished: 0,
        totalPending: 0,
        totalRejected: 0,
        totalArchived: 0,
      };
    }

    return {
      totalAll: parseInt(result.totalAll, 10),
      totalPublished: parseInt(result.totalPublished, 10),
      totalPending: parseInt(result.totalPending, 10),
      totalRejected: parseInt(result.totalRejected, 10),
      totalArchived: parseInt(result.totalArchived, 10),
    };
  }
  async handleFilterAdminCourses({
    status = 'all',
    search,
    sortBy = 'newest',
    page = 1,
    limit = 6,
  }: TeacherCourseFilterDto) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect(
        'course.childDrafts',
        'childDrafts',
        'childDrafts.status != :draftStatus',
        { draftStatus: 'draft' },
      )
      .where('course.parentId IS NULL');

    if (status && status !== 'all') {
      if (status === 'published' || status === 'archived') {
        query.andWhere('course.status = :status', { status });
      } else {
        query.andWhere(
          '(course.status = :status OR childDrafts.status = :status)',
          { status },
        );
      }
    } else {
      query.andWhere('course.status IN (:...statuses)', {
        statuses: ['published', 'pending', 'rejected', 'archived'],
      });
    }

    if (search) {
      query.andWhere('(LOWER(course.title) LIKE LOWER(:search) )', {
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

    let coursesWithRevenue: any[] = [];
    if (courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const revenueResults = await this.paymentItemRepository
        .createQueryBuilder('item')
        .select('item.course_id', 'courseId')
        .addSelect('SUM(item.price)', 'totalBaseRevenue')
        .innerJoin('item.payment', 'payment')
        .where('item.course_id IN (:...courseIds)', { courseIds })
        .andWhere('payment.status = :paymentStatus', {
          paymentStatus: 'success',
        })
        .groupBy('item.course_id')
        .getRawMany<AdminCourseRevenueRaw>();

      const revenueMap = new Map<
        string,
        { revenue: number; platformProfit: number }
      >(
        revenueResults.map((r) => [
          r.courseId,
          {
            revenue: parseFloat(r.totalBaseRevenue || '0'),
            platformProfit: parseFloat(r.totalBaseRevenue || '0') * 0.2,
          },
        ]),
      );

      coursesWithRevenue = courses.map((course) => {
        const data = revenueMap.get(course.id) || {
          revenue: 0,
          platformProfit: 0,
        };
        return {
          ...course,
          revenue: data.revenue,
          platformProfit: data.platformProfit,
        };
      });
    }

    const totalPages = Math.ceil(totalCount / limit);
    const formatted = plainToInstance(CourseDto1, coursesWithRevenue);

    return {
      data: formatted,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: totalPages,
      },
    };
  }

  async handleGetTeacherCourseTree() {
    const paidCoursesRaw = await this.paymentItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.payment', 'payment')
      .where('payment.status = :status', { status: 'success' })
      .select('DISTINCT item.course_id', 'courseId')
      .getRawMany<{ courseId: string }>();

    if (paidCoursesRaw.length === 0) return [];

    const validCourseIds = paidCoursesRaw.map((pc) => pc.courseId);

    const teachers = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.courses', 'course', 'course.id IN (:...ids)', {
        ids: validCourseIds,
      })
      .select([
        'user.userId',
        'user.fullName',
        'course.id',
        'course.title',
        'course.status',
      ])
      .getMany();

    return teachers.map((user) => ({
      id: user.userId,
      name: user.fullName,
      courses: user.courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
      })),
    }));
  }
}
