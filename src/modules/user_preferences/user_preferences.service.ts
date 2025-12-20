import { Injectable, Logger } from '@nestjs/common';
import natural from 'natural';
import { In, Not, Repository } from 'typeorm';
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
import vntk from 'vntk';
import { PaymentItem } from '../payment_items/entities/payment_item.entity';

const wordTokenizer = vntk.wordTokenizer();

// Định nghĩa Interface để thêm điểm số tạm thời
interface CourseWithLevelScore extends Course {
  levelScore?: number;
  totalScore?: number;
  score?: number;
}

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);
  TfIdf = natural.TfIdf;

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
    @InjectRepository(PaymentItem)
    private paymentItemRepo: Repository<PaymentItem>,
  ) {}
  private readonly VIETNAMESE_STOPWORDS = new Set([
    'và',
    'là',
    'của',
    'với',
    'những',
    'các',
    'một',
    'cách',
    'đã',
    'sẽ',
    'từ',
    'lên',
    'trong',
    'về',
    'ở',
    'này',
    'cho',
    'hay',
    'rằng',
    'như',
    'bằng',
    'chỉ',
    'có',
    'cả',
    'lớn',
    'nhỏ',
    'thấp',
    'website',
    'tôi',
    'muốn',
    'học',
    'cần',
    'tìm',
    'khóa',
    'hướng',
    'dẫn',
    'thêm',
    'bài',
    'vào',
    'việc',
    'để',
    'dễ',
    'hơn',
    'thể',
    'đến',
    'và',
    'là',
    'của',
    'với',
    'những',
    'các',
    'một',
    'cách',
    'đã',
    'sẽ',
    'từ',
    'lên',
    'trong',
    'về',
    'ở',
    'này',
    'cho',
    'hay',
    'rằng',
    'như',
    'bằng',
    'chỉ',
    'có',
    'cả',
    'lớn',
    'nhỏ',
    'thấp',
    'website',
    'tôi',
    'muốn',
    'học',
    'cần',
    'tìm',
    'khóa',
    'hướng',
    'dẫn',
    'thêm',
    'bài',
    'vào',
    'việc',
    'để',
    'dễ',
    'hơn',
    'thể',
    'đến',
    'mọi',
    'làm',
    'chủ',
    'tạo',
    'ra',
    'trên',
    'bất',
    'kỳ',
    'nào',
    'hoặc',
    'cùng',
    'giúp',
    'mang',
    'lại',
  ]);

  private readonly COMPOUND_WORDS = [
    'giao diện',
    'nền tảng',
    'bắt đầu',
    'sự nghiệp',
    'cấu trúc',
    'độc lập',
    'bất đồng bộ',
    'dịch vụ',
    'giao tiếp',
    'nắm vững',
    'thành thạo',
    'cơ sở dữ liệu',
    'hiện đại',
    'xử lý',
    'lập trình',
    'xây dựng',
    'triển khai',
    'ứng dụng',
    'chuyên nghiệp',
    'nâng cao',
    'cơ bản',
    'hiệu suất',
    'kiến trúc',
    'sử dụng',
    'dự án',
    'tập trung',
    'thiết kế',
    'quản lý',
    'tiền xử lý',
    'áp dụng',
    'trung cấp',
    'kiến thức',
    'quy tắc',
    'đặt tên',
    'bảo trì',
    'kinh nghiệm',
    'xác thực',
    'tương tác',
    'toàn diện',
    'thành thạo',
    'tối ưu hóa',
    'hiệu năng',
    'tái sử dụng',
    'phức tạp',
    'chuyên sâu',
    'tăng cường',
    'khả năng',
    'cấu hình',
    'tích hợp',
    'chuyển đổi',
    'giảm lỗi',
    'làm việc',
    'dữ liệu',
    'giao diện',
    'người dùng',
    'trải nghiệm',
    'đa nền tảng',
    'đồ họa',
    'hiệu ứng',
    'tương tác',
    'chuyên sâu',
    'toàn diện',
    'mới nhất',
    'thời gian thực',
    'tốc độ',
    'hiệu năng',
    'hiệu suất',
    'tối ưu',
    'tối ưu hóa',
    'tải trang',
    'thân thiện',
    'đẹp mắt',
    'nhanh chóng',
    'xây dựng',
    'phát triển',
    'triển khai',
    'đóng gói',
    'vận hành',
    'bảo mật',
    'xác thực',
    'phân quyền',
    'đăng nhập',
    'đăng ký',
    'lỗi runtime',
    'khả năng',
    'mở rộng',
    'duy trì',
    'bảo trì',
    'lập trình',
    'thiết kế',
    'cấu hình',
    'tích hợp',
    'xử lý',
    'nắm vững',
    'thành thạo',
    'tìm việc',
    'sự nghiệp',
    'thực tế',
    'dự án',
    'kiến thức',
    'nền tảng',
    'cơ bản',
    'nâng cao',
    'trung cấp',
    'phân chia',
    'giải quyết',
    'xung đột',
    'khôi phục',
    'tự động',
    'tự động hóa',
    'nguyên tắc',
    'công cụ',
    'quy tắc',
    'đặt tên',
    'tiền xử lý',
    'hệ thống',
    'cơ sở dữ liệu',
    'truy vấn',
    'độc lập',
    'bất đồng bộ',
    'thế hệ',
    'loại bỏ',
    'phổ biến',
    'quy trình',
    'đảm bảo',
    'chất lượng',
  ];

  private preprocessAndSegment(text: string): string[] {
    try {
      const cleanText = text
        .toLowerCase()
        .replace(/next\.?js/g, 'nextjs')
        .replace(/node\.?js/g, 'nodejs')
        .replace(/react\.?js/g, 'reactjs')
        .replace(/css\s?modules/g, 'css_modules')
        .replace(/styled\s?components/g, 'styled_components')
        .replace(/-/g, ' ');

      const rawTokens = wordTokenizer.tag(cleanText) as string[];
      let textAfterVnTK = rawTokens.join(' ');
      this.COMPOUND_WORDS.forEach((word) => {
        const spacePattern = word.replace(/\s+/g, '\\s+');
        const regex = new RegExp(spacePattern, 'g');
        const joinedWord = word.replace(/\s+/g, '_');
        textAfterVnTK = textAfterVnTK.replace(regex, joinedWord);
      });

      const finalTokens = textAfterVnTK
        .split(/\s+/)
        .reduce((acc: string[], t: string) => {
          const cleaned = t.trim().replace(/[^\w\u00C0-\u1EF9]/g, '');

          // Kiểm tra điều kiện: không rỗng, không phải stopword, độ dài > 1
          if (cleaned.length > 1 && !this.VIETNAMESE_STOPWORDS.has(cleaned)) {
            acc.push(cleaned);
          }
          return acc;
        }, []);

      return finalTokens;
    } catch (e) {
      console.log('e: ', e);
      return [];
    }
  }

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
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  recommendCoursesNLP(
    userPreference: UserPreference,
    courses: CourseWithLevelScore[],
    topN = 20,
    wishlistCourseIds: string[] = [],
    cartCourseIds: string[] = [],
  ): CourseDto[] {
    const tfidf = new this.TfIdf();

    // 1. TIỀN XỬ LÝ VÀ TÁCH TỪ (VnTK)
    const userRawText = this.getUserPreferenceText(userPreference);
    const userSegmentedText = this.preprocessAndSegment(userRawText);
    console.log('userRawText', userRawText);
    console.log('userSegmentedText', userSegmentedText);
    // 2. Xây dựng không gian Vector (Vocabulary) từ các tài liệu đã tách từ
    courses.forEach((course) => {
      const courseRawText = this.getCourseText(course);
      const courseSegmentedText = this.preprocessAndSegment(courseRawText);
      tfidf.addDocument(courseSegmentedText, course.id.toString()); // đếm số từ xuất hiện nhiều giữa các khóa học
    });

    // 3. Xây dựng Vocabulary và User Vector
    // Gom tất cả các từ khóa duy nhất từ toàn bộ các khóa học đang có.
    // Lấy danh sách từ khóa của từng khóa học nạp vào Set (để tự động loại bỏ trùng lặp)
    const allTerms = new Set<string>();
    courses.forEach((_, index) => {
      tfidf.listTerms(index).forEach((item) => allTerms.add(item.term));
    });
    // Chuyển Set thành Mảng để làm "cái khung" cố định cho các Vector
    const vocabulary = Array.from(allTerms);

    // 3.2. Chấm điểm yêu cầu của Người dùng
    const userScoresMap = new Map<string, number>();
    let userTerms: string[] = [];

    const rawData: unknown = userSegmentedText;

    if (Array.isArray(rawData)) {
      userTerms = rawData.filter(
        (item): item is string => typeof item === 'string',
      );
    } else if (typeof rawData === 'string' && rawData.trim().length > 0) {
      userTerms = rawData.trim().split(/\s+/);
    } else {
      userTerms = [];
    }

    userTerms.forEach((term: string) => {
      const currentScore = userScoresMap.get(term) || 0;
      userScoresMap.set(term, currentScore + 1);
    });

    // 3.3. Tạo bảng tra cứu IDF từ Vocabulary đã xây dựng ở Bước 3.1
    const idfLookup: Record<string, number> = {};
    courses.forEach((_, index) => {
      tfidf.listTerms(index).forEach((item) => {
        idfLookup[item.term] = item.idf;
      });
    });

    // 3.4. Xây dựng User Vector dựa trên Vocabulary chung
    // Tính điểm TF-IDF cho văn bản của User (để biết từ nào User nhấn mạnh nhất)
    //TF (Term Frequency) - Độ thường xuyên của từ / IDF (Inverse Document Frequency) - Độ hiếm của từ
    // tf = số từ xuất hiện / tổng từ văn vản
    // idf = log tổng số khóa học / só khóa học chứa từ đó
    const userVector = vocabulary.map((term) => {
      const tf = userScoresMap.get(term) || 0;
      const idf = idfLookup[term] || 0;
      return tf * idf;
    });

    const scoredCourses: CourseWithLevelScore[] = courses.map(
      (course, index) => {
        // Lấy điểm của Khóa học theo thứ tự Vocabulary
        const courseScoresMap = new Map<string, number>();
        tfidf
          .listTerms(index)
          .forEach((item) => courseScoresMap.set(item.term, item.tfidf));
        const courseVector = vocabulary.map(
          (term) => courseScoresMap.get(term) || 0,
        );

        const now = new Date();
        const hasExpired =
          course.discountExpiresAt && new Date(course.discountExpiresAt) < now;
        const rawDiscount = Number(course.discount ?? 0);
        const effectiveDiscount = hasExpired ? 0 : rawDiscount;
        const discountScore = effectiveDiscount / 100;

        const score = this.cosine(userVector, courseVector) || 0;

        let ratingScore = 0;
        const rCount = course.ratingCount ?? 0;
        const rVal = Number(course.rating ?? 0);

        if (rCount === 0) {
          ratingScore = 0.8;
        } else {
          const confidenceFactor =
            rCount >= 50 ? 1.0 : 0.7 + (rCount / 50) * 0.3;
          ratingScore = (rVal / 5) * confidenceFactor;
        }
        const effectiveStudents = Math.max(course.students || 0, 10);
        const studentScore = Math.log10(effectiveStudents) / Math.log10(1000);
        const finalStudentScore = Math.min(studentScore, 1.0);
        // 4c. Tổng hợp điểm
        // const totalScore =
        //   Math.sqrt(score) * 0.65 +
        //   0.1 * ratingScore +
        //   0.15 * finalStudentScore +
        //   0.05 * discountScore +
        //   0.05 * (course.levelScore || 0);

        const totalScore =
          Math.sqrt(score) * 0.5 +
          0.3 * finalStudentScore +
          0.1 * ratingScore +
          0.05 * discountScore +
          0.05 * (course.levelScore || 0);

        return { ...course, totalScore, score };
      },
    );

    const topCourses = scoredCourses
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, topN);

    const topCourses1 = scoredCourses
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 40);

    // console.table(
    //   topCourses1.map((c, index) => ({
    //     Hạng: index + 1,
    //     'Tiêu đề': c.title.substring(0, 40) + '...',
    //     'Phù hợp (%)': ((c.totalScore ?? 0) * 100).toFixed(2) + '%',
    //     'Số HV': c.students,
    //     Rating: c.rating,
    //     'Giảm giá': (c.discount || 0) + '%',
    //     'NLP Score': Math.sqrt(c.score ?? 0).toFixed(2),
    //   })),
    // );
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

    if (
      !userPref ||
      !userPref.mainCategories ||
      userPref.mainCategories.length === 0
    ) {
      return [];
    }

    const preferredCategoryNames = userPref.mainCategories.map(
      (c) => c.categoryName,
    );
    const desiredLevels = userPref.desiredLevels || [];

    const [wishlist, cart, purchasedItems] = await Promise.all([
      this.wishlistRepository.find({
        where: { user: { userId } },
        select: { course: { id: true } },
        relations: ['course'],
      }),
      this.cartRepository.find({
        where: { user: { userId } },
        select: { course: { id: true } },
        relations: ['course'],
      }),
      this.paymentItemRepo.find({
        where: {
          payment: {
            user: { userId: userId },
            status: 'success',
          },
        },
        select: { course: { id: true } },
        relations: ['course', 'payment'],
      }),
    ]);

    const wishlistCourseIds = wishlist.map((w) => w.course.id);
    const cartCourseIds = cart.map((c) => c.course.id);
    const purchasedCourseIds = purchasedItems.map((pi) => pi.course.id);

    const courses = await this.courseRepo.find({
      select: [
        'id',
        'title',
        'description',
        'level',
        'requirements',
        'learnings',
        'rating',
        'ratingCount',
        'students',
        'discount',
        'discountExpiresAt',
        'price',
        'originalPrice',
        'instructor',
      ],
      where: {
        status: 'published',
        category: {
          categoryName: In(preferredCategoryNames),
        },
        ...(purchasedCourseIds.length > 0 && {
          id: Not(In(purchasedCourseIds)),
        }),
      },
      relations: ['category', 'instructor'],
    });

    const filteredCourses: CourseWithLevelScore[] = courses.map((course) => {
      let levelScore = 0;
      const normalizedCourseLevel = course.level?.toLowerCase();

      const courseIdx = levelHierarchy.findIndex(
        (lv) => lv.toLowerCase() === normalizedCourseLevel,
      );

      const desiredIndices = desiredLevels.map((lv) =>
        levelHierarchy.findIndex((l) => l.toLowerCase() === lv.toLowerCase()),
      );
      const isExactMatch = desiredLevels.some(
        (lv) => lv.toLowerCase() === normalizedCourseLevel,
      );

      if (isExactMatch) {
        levelScore = 1.0;
      } else if (courseIdx !== -1 && desiredIndices.length > 0) {
        const minDistance = Math.min(
          ...desiredIndices.map((i) => Math.abs(courseIdx - i)),
        );

        if (minDistance === 1) {
          levelScore = 0.7;
        } else if (minDistance === 2) {
          levelScore = 0.1;
        }
      }

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
    if (!user) {
      throw new Error('User not found');
    }

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
