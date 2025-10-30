import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { FilterCoursesDto } from './dto/filter-courses.dto';
import { plainToInstance } from 'class-transformer';
import { CourseDetailDto, CourseDto } from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}
  async handleFilterCourses({
    category = 'all',
    level = 'all',
    rating = 'all',
    sortBy = 'default',
    page = 1,
    limit = 6,
    search,
  }: FilterCoursesDto) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.status = :status', { status: 'published' });

    if (category && category !== 'all') {
      query.andWhere('category.name = :category', { category });
    }

    if (level && level !== 'all') {
      query.andWhere('course.level = :level', { level });
    }

    if (rating && rating !== 'all') {
      query.andWhere('course.rating >= :rating', { rating: Number(rating) });
    }

    if (search && search.trim() !== '') {
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
        query.orderBy('course.createdAt', 'DESC'); // mặc định: mới nhất
        break;
    }
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [courses, total] = await query.getManyAndCount();

    const formatted = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    });
    console.log('Formatted Courses:', formatted);
    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: formatted,
    };
  }

  async handleGetHomeCourses(): Promise<CourseDto[]> {
    const courses = await this.courseRepository.find({
      where: { status: 'published' },
      relations: ['category', 'instructor'],
      order: { students: 'DESC' },
      take: 12,
    });
    const formatted = plainToInstance(CourseDto, courses, {
      excludeExtraneousValues: true,
    });
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
    if (!course) throw new Error('Course not found');
    return plainToInstance(CourseDetailDto, course, {
      excludeExtraneousValues: true,
    });
  }
}
