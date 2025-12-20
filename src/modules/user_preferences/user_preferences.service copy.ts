import { Injectable } from '@nestjs/common';
import natural from 'natural';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { UserPreference } from './entities/user_preference.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { plainToInstance } from 'class-transformer';
import { CourseDto } from '../course/dto/course.dto';
import { CreateUserPreferenceDto } from './dto/create-user_preference.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';

interface CourseWithLevelScore extends Course {
  levelScore?: number;
  totalScore?: number;
}

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(UserPreference)
    private preferenceRepo: Repository<UserPreference>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  TfIdf = natural.TfIdf;

  getUserPreferenceText(userPreference: UserPreference): string {
    return [
      ...(userPreference.mainCategories?.map((c) => c.categoryName) || []),
      ...(userPreference.learningGoals || []),
      ...(userPreference.interestedSkills || []),
      ...(userPreference.desiredLevels || []),
    ].join(' ');
  }

  getCourseText(course: Course): string {
    return [
      course.title,
      course.description,
      course.category?.categoryName,
      course.level,
      ...(course.requirements || []),
      ...(course.learnings || []),
    ].join(' ');
  }

  cosine(vecA: number[], vecB: number[]): number {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dot / (normA * normB);
  }

  recommendCoursesNLP(
    userPreference: UserPreference,
    courses: CourseWithLevelScore[],
    topN = 20,
    wishlistCourseIds: string[] = [],
    cartCourseIds: string[] = [],
  ): CourseDto[] {
    const tfidf = new this.TfIdf();

    courses.forEach((course) => {
      tfidf.addDocument(this.getCourseText(course), course.id.toString());
    });

    const userText = this.getUserPreferenceText(userPreference);
    const userVector: number[] = [];
    tfidf.tfidfs(userText, function (i, measure) {
      userVector.push(measure);
    });

    const scoredCourses: CourseWithLevelScore[] = courses.map(
      (course, index) => {
        const courseVector: number[] = [];
        tfidf.listTerms(index).forEach((item) => courseVector.push(item.tfidf));

        const score = this.cosine(userVector, courseVector) || 0;

        const ratingWeight = 0.5;
        const studentWeight = 0.3;
        const discountWeight = 0.2;

        const ratingScore = (course.rating || 0) / 5;
        const studentScore = (course.students || 0) / 5000;
        const discountScore = course.discount ? 1 : 0;

        const totalScore =
          score +
          ratingWeight * ratingScore +
          studentWeight * studentScore +
          discountWeight * discountScore +
          (course.levelScore || 0) * 0.3;

        return { ...course, totalScore };
      },
    );

    const topCourses = scoredCourses
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, topN);

    const formatted = plainToInstance(CourseDto, topCourses, {
      excludeExtraneousValues: true,
    }).map((course) => ({
      ...course,
      isInWishlist: wishlistCourseIds.includes(course.id),
      isInCart: cartCourseIds.includes(course.id),
    }));

    return formatted;
  }

  async recommendCourses(userId: string, topN = 20): Promise<CourseDto[]> {
    const levelHierarchy = ['Cơ Bản', 'Trung Cấp', 'Nâng Cao'];

    const userPref = await this.preferenceRepo.findOne({
      where: { user: { userId } },
      relations: ['mainCategories'],
    });
    if (!userPref) return [];

    const [wishlist, cart] = await Promise.all([
      this.wishlistRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      }),
      this.cartRepository.find({
        where: { user: { userId } },
        relations: ['course'],
      }),
    ]);
    const wishlistCourseIds = wishlist.map((w) => w.course.id);
    const cartCourseIds = cart.map((c) => c.course.id);

    const courses = await this.courseRepo.find({
      where: { status: 'published' },
      relations: ['category'],
    });

    const preferredCategories =
      userPref.mainCategories?.map((c) => c.categoryName) || [];
    const desiredLevels = userPref.desiredLevels || [];

    const filteredCourses: CourseWithLevelScore[] = courses
      .filter((c) => preferredCategories.includes(c.category?.categoryName))
      .map((course) => {
        let levelScore = 0;
        const courseIdx = levelHierarchy.findIndex(
          (lv) => lv.toLowerCase() === course.level?.toLowerCase(),
        );
        const desiredIndices = desiredLevels.map((lv) =>
          levelHierarchy.findIndex((l) => l.toLowerCase() === lv.toLowerCase()),
        );

        if (desiredIndices.includes(courseIdx)) levelScore = 1;
        else if (
          Math.min(...desiredIndices.map((i) => Math.abs(courseIdx - i))) === 1
        )
          levelScore = 0.5;

        return { ...course, levelScore };
      });

    return this.recommendCoursesNLP(
      userPref,
      filteredCourses,
      topN,
      wishlistCourseIds,
      cartCourseIds,
    );
  }

  async handleCreate(userId: string, dto: CreateUserPreferenceDto) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new Error('User not found');

    const categories = await this.categoryRepo.find({
      where: { categoryId: In(dto.mainCategoryIds) },
    });

    const preference = this.preferenceRepo.create({
      user,
      mainCategories: categories,
      desiredLevels: dto.desiredLevels || [],
      learningGoals: dto.learningGoals || [],
      interestedSkills: dto.interestedSkills || [],
    });

    const createdPref = await this.preferenceRepo.save(preference);

    await this.userRepo.update({ userId }, { hasPreferences: true });

    return createdPref;
  }
}
