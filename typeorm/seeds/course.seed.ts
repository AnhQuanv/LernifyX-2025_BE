import { DataSource, DeepPartial } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';
import { Category } from '../../src/modules/category/entities/category.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Chapter } from '../../src/modules/chapter/entities/chapter.entity';
import { Lesson } from '../../src/modules/lesson/entities/lesson.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';
import { Role } from '../../src/modules/role/entities/role.entity';
import { v4 as uuidv4 } from 'uuid';
import { LessonVideo } from '../../src/modules/lesson_video/entities/lesson_video.entity';
import * as bcrypt from 'bcrypt';

export const seedCourses = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const chapterRepo = dataSource.getRepository(Chapter);
  const lessonRepo = dataSource.getRepository(Lesson);
  const lessonVideoRepo = dataSource.getRepository(LessonVideo);
  const commentRepo = dataSource.getRepository(Comment);
  const roleRepo = dataSource.getRepository(Role);

  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  const teacherRole = await roleRepo.findOneBy({ roleName: 'teacher' });

  const sampleImageUrl =
    'https://res.cloudinary.com/drc4b7rmj/image/upload/v1764497628/Avatar/banh_1764497623330.jpg';
  const sampleOriginalUrl =
    'https://res.cloudinary.com/drc4b7rmj/video/upload/v1763726091/h4ogqnwmsshbvfneixkv.mp4';
  const samplePublicIdBase = 'Courses/Videos/sample_lesson_video';
  const sampleDuration = 600;
  const sampleWidth = 1280;
  const sampleHeight = 720;
  const coursesData = [
    {
      title: 'Masterclass Lập Trình Backend với Node.js & Express',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 40,
      price: 2099000,
      originalPrice: 2099000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách xây dựng các RESTful API có khả năng mở rộng bằng Node.js, Express và MongoDB.',
      learnings: [
        'Nền tảng Express và Middleware',
        'Xử lý Xác thực và Phân quyền (Auth)',
        'Làm việc với MongoDB và Mongoose',
        'Xử lý lỗi và quy trình triển khai ứng dụng',
      ],
      requirements: ['Kiến thức về JavaScript', 'Hiểu biết cơ bản về REST'],
      image: sampleImageUrl,
    },
    {
      title: 'Python Toàn Diện cho Khoa Học Dữ Liệu và Phân Tích',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Cơ Bản',
      duration: 3600 * 35,
      price: 1499000,
      originalPrice: 2999000,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Sử dụng Python để làm sạch, trực quan hóa dữ liệu và giới thiệu về học máy.',
      learnings: [
        'Cơ bản về ngôn ngữ Python',
        'Xử lý dữ liệu với thư viện Pandas',
        'Trực quan hóa dữ liệu với Matplotlib/Seaborn',
        'Giới thiệu về Scikit-learn',
      ],
      requirements: ['Không yêu cầu kinh nghiệm lập trình'],
      image: sampleImageUrl,
    },
    {
      title: 'Học Máy (Machine Learning) A-Z với Dự Án Thực Tế',
      categoryName: 'Trí Tuệ Nhân Tạo',
      instructorName: 'Phạm Thị Thảo',
      level: 'Trung Cấp',
      duration: 3600 * 60,
      price: 2499000,
      originalPrice: 2499000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Xây dựng các mô hình học máy thực tế bằng Python và Scikit-learn.',
      learnings: [
        'Học có giám sát và không giám sát',
        'Regression và classification',
        'Đánh giá hiệu suất mô hình',
        'Phân cụm và Giảm chiều dữ liệu',
      ],
      requirements: ['Cơ bản Python', 'Nền tảng Toán học cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Nền Tảng Marketing Kỹ Thuật Số (Digital Marketing)',
      categoryName: 'Marketing',
      instructorName: 'Nguyễn Thành Luân',
      level: 'Cơ Bản',
      duration: 3600 * 25,
      price: 1299000,
      originalPrice: 1299000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách tạo chiến dịch kỹ thuật số và phát triển thương hiệu trực tuyến.',
      learnings: [
        'Cơ bản về SEO & SEM',
        'Marketing qua Email và Content',
        'Chạy quảng cáo trên mạng xã hội',
        'Tổng quan về Google Analytics',
      ],
      requirements: ['Quan tâm đến marketing và xây dựng thương hiệu'],
      image: sampleImageUrl,
    },
    {
      title: 'Thiết Kế UI/UX Chuyên Nghiệp với Figma',
      categoryName: 'Thiết Kế',
      instructorName: 'Đào Duy Mạnh',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 1799000,
      originalPrice: 2999000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description:
        'Thiết kế giao diện và trải nghiệm người dùng tuyệt đẹp bằng Figma.',
      learnings: [
        'Nghiên cứu người dùng và Xây dựng Persona',
        'Tạo Wireframe và Prototype',
        'Các mô hình UI và khả năng tiếp cận',
        'Xây dựng Portfolio',
      ],
      requirements: ['Quan tâm đến thiết kế', 'Có máy tính cá nhân'],
      image: sampleImageUrl,
    },
    {
      title: 'Luyện Thi Chứng Chỉ AWS Cloud Practitioner',
      categoryName: 'Điện Toán Đám Mây',
      instructorName: 'Võ Minh Phúc',
      level: 'Trung Cấp',
      duration: 3600 * 28,
      price: 2299000,
      originalPrice: 2299000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Chuẩn bị cho chứng chỉ AWS và nắm vững các nguyên tắc cơ bản về điện toán đám mây.',
      learnings: [
        'AWS core services',
        'Identity and access management',
        'Kiến trúc và tính toán chi phí đám mây',
      ],
      image: sampleImageUrl,
    },
    {
      title: 'An Toàn Thông Tin Mạng (Cybersecurity) Cơ Bản',
      categoryName: 'An Toàn Thông Tin',
      instructorName: 'Hoàng Kim Chi',
      level: 'Cơ Bản',
      duration: 3600 * 22,
      price: 1399000,
      originalPrice: 1399000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Hiểu các nguyên tắc cơ bản về an ninh mạng, các mối đe dọa và bảo vệ dữ liệu trực tuyến.',
      learnings: [
        'Các nguyên tắc cơ bản về mạng',
        'Phòng thủ trước Phishing và Malware',
        'Cơ bản về Phản ứng sự cố',
      ],
      requirements: ['Kỹ năng sử dụng máy tính cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Phát Triển Ứng Dụng Di Động Đa Nền Tảng với Flutter',
      categoryName: 'Lập Trình Di Động',
      instructorName: 'Đinh Công Bách',
      level: 'Trung Cấp',
      duration: 3600 * 38,
      price: 1999000,
      originalPrice: 3999000,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      description:
        'Xây dựng ứng dụng di động đa nền tảng bằng Flutter và ngôn ngữ Dart.',
      learnings: [
        'Flutter widgets',
        'Quản lý State hiệu quả',
        'Navigation và routing',
        'Xuất bản ứng dụng lên App Store và Google Play',
      ],
      requirements: ['Kinh nghiệm lập trình cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Game 3D với Unity và C#',
      categoryName: 'Lập Trình Game',
      instructorName: 'Vũ Quốc Hùng',
      level: 'Trung Cấp',
      duration: 3600 * 42,
      price: 2399000,
      originalPrice: 2399000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách xây dựng trò chơi 3D từ đầu bằng công cụ Unity engine và C#.',
      learnings: [
        'Unity interface',
        'Game physics',
        'Scripting với C#',
        'Publishing và optimization',
      ],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Dự Án (Project Management) Thiết Yếu',
      categoryName: 'Kinh Doanh & Quản Lý',
      instructorName: 'Nguyễn Ngọc Trâm',
      level: 'Cơ Bản',
      duration: 3600 * 20,
      price: 1099000,
      originalPrice: 1099000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Quản lý dự án hiệu quả với các phương pháp Agile và Waterfall.',
      learnings: [
        'Chu kỳ sống của Dự án',
        'Kỹ năng giao tiếp và làm việc nhóm',
        'Quản lý rủi ro',
        'Các nguyên tắc cốt lõi của Agile',
      ],
      requirements: ['Quan tâm đến quản lý hoặc lãnh đạo đội nhóm'],
      image: sampleImageUrl,
    },
    {
      title: 'Phân Tích Tài Chính cho Quyết Định Kinh Doanh',
      categoryName: 'Tài Chính',
      instructorName: 'Hoàng Văn Kiên',
      level: 'Trung Cấp',
      duration: 3600 * 34,
      price: 1699000,
      originalPrice: 1699000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Đưa ra các quyết định tài chính thông minh hơn thông qua phân tích dựa trên dữ liệu.',
      learnings: [
        'Phân tích báo cáo tài chính',
        'Quản lý dòng tiền',
        'Lập dự báo và ngân sách',
      ],
      requirements: ['Basic Excel skills'],
      image: sampleImageUrl,
    },

    {
      title: 'DevOps & CI/CD Toàn Tập với Docker, Kubernetes và Jenkins',
      categoryName: 'DevOps',
      instructorName: 'Phạm Quang Huy',
      level: 'Nâng Cao',
      duration: 3600 * 55,
      price: 2999000,
      originalPrice: 4500000,
      discount: 33,
      discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description:
        'Học cách tự động hóa quy trình phát triển, triển khai và vận hành ứng dụng bằng các công cụ DevOps hàng đầu.',
      learnings: [
        'Xây dựng và quản lý Container với Docker',
        'Điều phối ứng dụng với Kubernetes (K8s)',
        'Thiết lập pipeline CI/CD bằng Jenkins',
        'Giám sát và Logging (Prometheus & Grafana)',
      ],
      requirements: ['Kiến thức cơ bản về Linux', 'Kinh nghiệm lập trình web'],
      image: sampleImageUrl,
    },
    {
      title: 'Phân Tích Thống Kê và Mô Hình Hóa với R',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Trung Cấp',
      duration: 3600 * 38,
      price: 1899000,
      originalPrice: 1899000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách sử dụng ngôn ngữ R và các gói (package) phổ biến cho phân tích thống kê chuyên sâu và tạo mô hình dự đoán.',
      learnings: [
        'Cơ bản về ngôn ngữ R và RStudio',
        'Phân tích dữ liệu với Tidyverse',
        'Kiểm định giả thuyết và Hồi quy tuyến tính',
        'Trực quan hóa nâng cao với ggplot2',
      ],
      requirements: ['Nền tảng Toán học cơ bản', 'Kiến thức về thống kê'],
      image: sampleImageUrl,
    },
    {
      title: 'Đầu Tư Chứng Khoán Cơ Bản cho Người Mới Bắt Đầu',
      categoryName: 'Tài Chính',
      instructorName: 'Hoàng Văn Kiên',
      level: 'Cơ Bản',
      duration: 3600 * 18,
      price: 999000,
      originalPrice: 1999000,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      description:
        'Nắm vững kiến thức nền tảng để tự tin đầu tư vào thị trường chứng khoán Việt Nam, từ A đến Z.',
      learnings: [
        'Nguyên tắc cơ bản của thị trường chứng khoán',
        'Đọc hiểu báo cáo tài chính doanh nghiệp',
        'Phân tích cơ bản (FA) và Phân tích kỹ thuật (TA) đơn giản',
        'Xây dựng danh mục đầu tư an toàn',
      ],
      requirements: ['Có máy tính cá nhân', 'Sổ ghi chép'],
      image: sampleImageUrl,
    },
    {
      title: 'Thiết Kế Đồ Họa Ứng Dụng với Photoshop và Illustrator',
      categoryName: 'Thiết Kế',
      instructorName: 'Đào Duy Mạnh',
      level: 'Cơ Bản',
      duration: 3600 * 40,
      price: 1799000,
      originalPrice: 3500000,
      discount: 48,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Khóa học từ A-Z về sử dụng Photoshop và Illustrator để tạo ra các sản phẩm đồ họa ứng dụng cho marketing và in ấn.',
      learnings: [
        'Thành thạo công cụ trong Photoshop',
        'Thiết kế logo và bộ nhận diện thương hiệu với Illustrator',
        'Xử lý ảnh chuyên nghiệp',
        'Quy trình thiết kế sản phẩm in ấn (Poster, Banner)',
      ],
      requirements: ['Máy tính có cài đặt phần mềm Adobe', 'Đam mê thiết kế'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Game 2D với Unity và Ngôn Ngữ C# (Cơ Bản)',
      categoryName: 'Lập Trình Game',
      instructorName: 'Vũ Quốc Hùng',
      level: 'Cơ Bản',
      duration: 3600 * 32,
      price: 1599000,
      originalPrice: 1599000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học các nguyên tắc cơ bản để xây dựng trò chơi 2D vui nhộn và hấp dẫn bằng Unity.',
      learnings: [
        'Cơ bản về Unity 2D',
        'Lập trình chuyển động và va chạm',
        'Quản lý giao diện người dùng (UI)',
        'Tạo hiệu ứng âm thanh và hình ảnh',
      ],
      requirements: [
        'Máy tính có thể chạy Unity',
        'Kiến thức lập trình C# căn bản',
      ],
      image: sampleImageUrl,
    },
    {
      title: 'Nghệ Thuật Thuyết Trình Chuyên Nghiệp và Tạo Ảnh Hưởng',
      categoryName: 'Kỹ Năng Mềm',
      instructorName: 'Lê Huyền Trang',
      level: 'Cơ Bản',
      duration: 3600 * 15,
      price: 899000,
      originalPrice: 1500000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Khóa học giúp bạn tự tin đứng trước đám đông, truyền tải thông điệp rõ ràng và thuyết phục đối tác/khách hàng.',
      learnings: [
        'Kỹ thuật làm chủ sân khấu và ngôn ngữ cơ thể',
        'Xây dựng nội dung và cấu trúc bài thuyết trình logic',
        'Sử dụng công cụ trình chiếu (PowerPoint/Keynote) hiệu quả',
        'Xử lý câu hỏi và tình huống khó',
      ],
      requirements: ['Mong muốn cải thiện kỹ năng giao tiếp'],
      image: sampleImageUrl,
    },
    {
      title: 'SQL Masterclass: Truy Vấn và Thiết Kế Cơ Sở Dữ Liệu',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Trung Cấp',
      duration: 3600 * 25,
      price: 1399000,
      originalPrice: 1399000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách viết các truy vấn SQL phức tạp, tối ưu hóa hiệu suất và thiết kế lược đồ cơ sở dữ liệu quan hệ chuyên nghiệp.',
      learnings: [
        'Thành thạo các lệnh SELECT, INSERT, UPDATE, DELETE',
        'Sử dụng JOINS và Subqueries nâng cao',
        'Tối ưu hóa truy vấn và chỉ mục (Indexing)',
        'Thiết kế CSDL và Chuẩn hóa (Normalization)',
      ],
      requirements: ['Kiến thức cơ bản về máy tính'],
      image: sampleImageUrl,
    },
    {
      title: 'Chuyên Sâu về Google Ads và Quảng Cáo Tìm Kiếm',
      categoryName: 'Marketing',
      instructorName: 'Nguyễn Thành Luân',
      level: 'Nâng Cao',
      duration: 3600 * 28,
      price: 1699000,
      originalPrice: 2899000,
      discount: 41,
      discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      description:
        'Khóa học chuyên sâu về cách thiết lập, quản lý và tối ưu hóa các chiến dịch Google Search và Display Network để đạt ROI cao nhất.',
      learnings: [
        'Cấu trúc và cài đặt chiến dịch Google Ads',
        'Nghiên cứu từ khóa và đấu thầu (Bidding)',
        'Viết Ad Copy và Call-to-Action hiệu quả',
        'Theo dõi chuyển đổi (Conversion Tracking) và Tối ưu hóa',
      ],
      requirements: ['Đã có kinh nghiệm chạy quảng cáo cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Xử Lý Ngôn Ngữ Tự Nhiên (NLP) với Python',
      categoryName: 'Trí Tuệ Nhân Tạo',
      instructorName: 'Phạm Thị Thảo',
      level: 'Nâng Cao',
      duration: 3600 * 45,
      price: 2599000,
      originalPrice: 2599000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Tìm hiểu các mô hình NLP tiên tiến để xây dựng các ứng dụng như dịch máy, phân tích cảm xúc và Chatbot.',
      learnings: [
        'Tiền xử lý văn bản (Tokenization, Lemmatization)',
        'Mô hình thống kê (Hidden Markov Model)',
        'Mô hình Deep Learning cho NLP (RNN, Transformers)',
        'Xây dựng hệ thống phân tích cảm xúc',
      ],
      requirements: ['Kinh nghiệm Python', 'Cơ bản về Machine Learning'],
      image: sampleImageUrl,
    },

    {
      title: 'Thiết Kế Cơ Sở Dữ Liệu NoSQL với MongoDB',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Trung Cấp',
      duration: 3600 * 22,
      price: 1499000,
      originalPrice: 2499000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      description:
        'Học cách thiết kế, quản lý và tối ưu hóa hiệu suất dữ liệu phi quan hệ (NoSQL) bằng MongoDB.',
      learnings: [
        'Cấu trúc Document và Collection',
        'Truy vấn (Query) nâng cao trong MongoDB',
        'Indexing và Performance Tuning',
        'Mô hình hóa dữ liệu NoSQL',
      ],
      requirements: ['Hiểu biết cơ bản về dữ liệu'],
      image: sampleImageUrl,
    },
    {
      title: 'Phân Tích Dữ Liệu Kinh Doanh với Power BI',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Cơ Bản',
      duration: 3600 * 28,
      price: 1599000,
      originalPrice: 1599000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Biến dữ liệu thô thành thông tin chi tiết có giá trị thông qua trực quan hóa và báo cáo bằng Power BI.',
      learnings: [
        'Nhập và làm sạch dữ liệu (Power Query)',
        'Viết công thức DAX cơ bản',
        'Thiết kế Dashboard tương tác',
        'Chia sẻ báo cáo trên Power BI Service',
      ],
      requirements: ['Kiến thức Excel cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Trị Hệ Thống Mạng và Linux',
      categoryName: 'An Toàn Thông Tin',
      instructorName: 'Hoàng Kim Chi',
      level: 'Trung Cấp',
      duration: 3600 * 35,
      price: 1899000,
      originalPrice: 1899000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Thành thạo các lệnh Linux cơ bản, quản lý server và cấu hình mạng cho các môi trường doanh nghiệp.',
      learnings: [
        'Lệnh Linux cơ bản và Shell Scripting',
        'Quản lý người dùng, phân quyền',
        'Cấu hình mạng và dịch vụ (DNS, Web Server)',
        'Bảo mật hệ thống Linux',
      ],
      requirements: ['Kiến thức về máy tính'],
      image: sampleImageUrl,
    },
    {
      title: 'Luyện Thi Chứng Chỉ AWS Solutions Architect Associate',
      categoryName: 'Điện Toán Đám Mây',
      instructorName: 'Võ Minh Phúc',
      level: 'Nâng Cao',
      duration: 3600 * 45,
      price: 3599000,
      originalPrice: 3599000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Khóa học chuyên sâu chuẩn bị cho chứng chỉ SAA, tập trung vào thiết kế kiến trúc đám mây có khả năng mở rộng và hiệu quả chi phí.',
      learnings: [
        'Thiết kế kiến trúc mạng (VPC)',
        'Các dịch vụ tính toán (EC2, Lambda)',
        'Dịch vụ lưu trữ (S3, EBS, EFS)',
        'Kiến trúc bảo mật và độ khả dụng cao',
      ],
      requirements: ['Đã hoàn thành AWS Cloud Practitioner'],
      image: sampleImageUrl,
    },
    {
      title: 'Kỹ Năng Đàm Phán và Thương Lượng Hiệu Quả',
      categoryName: 'Kỹ Năng Mềm',
      instructorName: 'Lê Huyền Trang',
      level: 'Trung Cấp',
      duration: 3600 * 12,
      price: 799000,
      originalPrice: 1299000,
      discount: 38,
      discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description:
        'Nâng cao khả năng đàm phán trong kinh doanh và đời sống, đạt được kết quả tối ưu cho cả hai bên.',
      learnings: [
        'Xác định BATNA và ZOPA',
        'Kỹ thuật lắng nghe và đặt câu hỏi chiến lược',
        'Xử lý mâu thuẫn và các tình huống khó khăn',
        'Thực hành đàm phán qua case study',
      ],
      requirements: ['Đã có kinh nghiệm làm việc (tùy chọn)'],
      image: sampleImageUrl,
    },
    {
      title: 'Tối Ưu Hóa Game Performance cho Unity 3D',
      categoryName: 'Lập Trình Game',
      instructorName: 'Vũ Quốc Hùng',
      level: 'Nâng Cao',
      duration: 3600 * 25,
      price: 1999000,
      originalPrice: 1999000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học các kỹ thuật chuyên sâu để tối ưu hóa hiệu suất đồ họa, vật lý và mã lệnh C# trong Unity.',
      learnings: [
        'Kỹ thuật Culling (Occlusion và Frustum)',
        'Tối ưu hóa mã lệnh C# và Garbage Collection',
        'Shader và Material Optimization',
        'Phân tích hiệu suất bằng Unity Profiler',
      ],
      requirements: ['Kinh nghiệm lập trình Unity 3D'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Thời Gian và Năng Suất Cá Nhân',
      categoryName: 'Kinh Doanh & Quản Lý',
      instructorName: 'Nguyễn Ngọc Trâm',
      level: 'Cơ Bản',
      duration: 3600 * 10,
      price: 599000,
      originalPrice: 999000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Nắm vững các phương pháp quản lý thời gian tiên tiến như Pomodoro và ma trận Eisenhower để làm việc hiệu quả hơn.',
      learnings: [
        'Đặt mục tiêu SMART',
        'Phương pháp Pomodoro và Deep Work',
        'Ma trận Eisenhower để ưu tiên công việc',
        'Kỹ thuật chống trì hoãn',
      ],
      requirements: ['Không có'],
      image: sampleImageUrl,
    },

    {
      title: 'Cơ Sở Dữ Liệu SQL Nâng Cao: Tối Ưu Hóa và Tuning',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Nâng Cao',
      duration: 3600 * 30,
      price: 1899000,
      originalPrice: 1899000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ các kỹ thuật tối ưu hóa truy vấn, chỉ mục (indexing) và kiến trúc cơ sở dữ liệu để đạt hiệu suất cao nhất.',
      learnings: [
        'Phân tích Query Execution Plan',
        'Các loại Index (Clustered, Non-Clustered) và cách sử dụng',
        'Kỹ thuật Denormalization và Partitioning',
        'Sử dụng Stored Procedures và Views hiệu quả',
      ],
      requirements: ['Đã có kinh nghiệm làm việc với SQL cơ bản'],
      image: sampleImageUrl,
    },

    {
      title: 'Node.js Nâng Cao: Microservices và Queue (Kafka/RabbitMQ)',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 45,
      price: 2499000,
      originalPrice: 3899000,
      discount: 36,
      discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      description:
        'Thiết kế và xây dựng kiến trúc Microservices phi đồng bộ sử dụng Node.js và các hệ thống Message Queue.',
      learnings: [
        'Nguyên tắc thiết kế Microservices',
        'Tích hợp Kafka/RabbitMQ cho giao tiếp phi đồng bộ',
        'Xử lý Transactions phân tán (Distributed Transactions)',
        'Giám sát và Logging trong kiến trúc Microservices',
      ],
      requirements: ['Thành thạo Node.js/Express'],
      image: sampleImageUrl,
    },

    // DevOps & Cloud
    {
      title: 'CI/CD Nâng Cao: GitLab CI và GitHub Actions',
      categoryName: 'DevOps',
      instructorName: 'Phạm Quang Huy',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 1899000,
      originalPrice: 3000000,
      discount: 37,
      discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description:
        'Thiết lập và quản lý các Pipeline CI/CD mạnh mẽ bằng hai công cụ phổ biến nhất hiện nay.',
      learnings: [
        'Cấu hình GitLab CI Runner và Jobs',
        'Xây dựng Workflow bằng GitHub Actions',
        'Triển khai tự động lên AWS S3/EC2 hoặc Google Cloud',
        'Quản lý bí mật (Secrets) an toàn',
      ],
      requirements: ['Cơ bản về Docker và Git'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Cấu Hình với Ansible và Terraform',
      categoryName: 'DevOps',
      instructorName: 'Phạm Quang Huy',
      level: 'Nâng Cao',
      duration: 3600 * 35,
      price: 2299000,
      originalPrice: 2299000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách tự động hóa việc cung cấp cơ sở hạ tầng (IaC) và quản lý cấu hình server với các công cụ dẫn đầu thị trường.',
      learnings: [
        'Nguyên tắc Infrastructure as Code (IaC)',
        'Sử dụng Terraform để Provisioning Cloud Resources',
        'Viết Playbook và Role trong Ansible',
        'Quản lý Server hàng loạt và idempotent nature',
      ],
      requirements: ['Cơ bản Linux và Cloud (AWS/Azure/GCP)'],
      image: sampleImageUrl,
    },
    {
      title: 'Nền Tảng Google Cloud Platform (GCP) Essentials',
      categoryName: 'Điện Toán Đám Mây',
      instructorName: 'Võ Minh Phúc',
      level: 'Cơ Bản',
      duration: 3600 * 25,
      price: 1999000,
      originalPrice: 1999000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Giới thiệu tổng quan và hướng dẫn sử dụng các dịch vụ cốt lõi của Google Cloud Platform.',
      learnings: [
        'Compute Engine và Cloud Run',
        'Cloud Storage và Cloud SQL',
        'Quản lý mạng (VPC) và Bảo mật IAM',
        'Tính toán chi phí cơ bản trên GCP',
      ],
      requirements: ['Kiến thức máy tính cơ bản'],
      image: sampleImageUrl,
    },

    {
      title: 'Data Modeling và Thiết Kế Database Chuyên Sâu',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Nâng Cao',
      duration: 3600 * 28,
      price: 1799000,
      originalPrice: 2999000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      description:
        'Làm chủ quy trình Data Modeling từ khái niệm đến mô hình thực thể quan hệ (ERD) và chuẩn hóa CSDL.',
      learnings: [
        'Mô hình hóa dữ liệu quan hệ (ERD)',
        'Các dạng chuẩn (1NF, 2NF, 3NF, BCNF)',
        'Mô hình hóa NoSQL (Document, Key-Value)',
        'Sử dụng công cụ Data Modeling (như draw.io, Erwin)',
      ],
      requirements: ['Kinh nghiệm SQL cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Caching và Redis Masterclass cho Ứng Dụng Tốc Độ Cao',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Trung Cấp',
      duration: 3600 * 20,
      price: 1499000,
      originalPrice: 1499000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Tích hợp Redis để giảm tải cho database chính, tăng tốc độ phản hồi của ứng dụng.',
      learnings: [
        'Các chiến lược Caching (Read-Through, Write-Through)',
        'Cấu trúc dữ liệu của Redis (String, Hash, List, Set)',
        'Sử dụng Redis cho Session, Cache và Message Broker',
        'Tích hợp Redis vào Node.js/Python Backend',
      ],
      requirements: ['Kinh nghiệm lập trình Backend'],
      image: sampleImageUrl,
    },

    {
      title: 'Deep Learning Toàn Diện với TensorFlow và Keras',
      categoryName: 'Trí Tuệ Nhân Tạo',
      instructorName: 'Phạm Thị Thảo',
      level: 'Nâng Cao',
      duration: 3600 * 60,
      price: 3299000,
      originalPrice: 5000000,
      discount: 34,
      discountExpiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xây dựng các mạng nơ-ron phức tạp (CNN, RNN) để giải quyết các bài toán thị giác máy tính và NLP.',
      learnings: [
        'Mạng nơ-ron cơ bản (ANN) và Backpropagation',
        'Mạng Tích chập (CNN) cho Computer Vision',
        'Mạng Nơ-ron Hồi quy (RNN) cho chuỗi thời gian',
        'Sử dụng TensorFlow/Keras và triển khai mô hình',
      ],
      requirements: ['Thành thạo Python', 'Cơ bản Machine Learning'],
      image: sampleImageUrl,
    },
    {
      title:
        'Phân Tích Dữ Liệu với Python (Pandas) và Trực Quan Hóa (Matplotlib)',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Cơ Bản',
      duration: 3600 * 30,
      price: 1499000,
      originalPrice: 2999000,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Làm chủ các công cụ cốt lõi của Python để xử lý, làm sạch và trực quan hóa dữ liệu hiệu quả.',
      learnings: [
        'Cấu trúc dữ liệu DataFrame trong Pandas',
        'Làm sạch và tiền xử lý dữ liệu',
        'Tạo biểu đồ tĩnh và tương tác với Matplotlib/Seaborn',
        'Phân tích thăm dò dữ liệu (EDA)',
      ],
      requirements: ['Cơ bản về Python'],
      image: sampleImageUrl,
    },

    {
      title: 'Thiết Kế Responsive Web Nâng Cao với Tailwind CSS',
      categoryName: 'Thiết Kế',
      instructorName: 'Đào Duy Mạnh',
      level: 'Trung Cấp',
      duration: 3600 * 18,
      price: 999000,
      originalPrice: 1599000,
      discount: 37,
      discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xây dựng giao diện người dùng nhanh chóng, hiện đại và responsive bằng Utility-first Framework Tailwind CSS.',
      learnings: [
        'Cơ bản về Utility-first CSS',
        'Sử dụng Grid, Flexbox và Customizing Theme',
        'Thiết kế Responsive và Dark Mode',
        'Tích hợp Tailwind CSS với các Framework (React/Vue/Next)',
      ],
      requirements: ['Cơ bản về HTML và CSS'],
      image: sampleImageUrl,
    },
    {
      title:
        'InDesign Masterclass: Thiết Kế Ấn Phẩm Chuyên Nghiệp (Sách, Tạp Chí)',
      categoryName: 'Thiết Kế',
      instructorName: 'Đào Duy Mạnh',
      level: 'Nâng Cao',
      duration: 3600 * 25,
      price: 1699000,
      originalPrice: 1699000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Thành thạo Adobe InDesign để tạo ra các ấn phẩm đa trang chất lượng cao sẵn sàng cho in ấn.',
      learnings: [
        'Quản lý Master Pages và Styles',
        'Thiết lập Typography chuyên nghiệp',
        'Sắp xếp bố cục phức tạp (Multi-column, Margin)',
        'Xuất file in ấn và PDF tương tác',
      ],
      requirements: ['Cơ bản về đồ họa'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Sản Phẩm (Product Management) Toàn Diện',
      categoryName: 'Kinh Doanh & Quản Lý',
      instructorName: 'Nguyễn Ngọc Trâm',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 1799000,
      originalPrice: 3299000,
      discount: 45,
      discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description:
        'Nắm vững vai trò Product Manager, từ nghiên cứu thị trường đến việc ra mắt và phát triển sản phẩm.',
      learnings: [
        'Nghiên cứu thị trường và Phân tích đối thủ',
        'Xây dựng Product Roadmap và Backlog',
        'Phương pháp Agile/Scrum trong PM',
        'Phân tích Metrics (KPIs, North Star Metric)',
      ],
      requirements: ['Kinh nghiệm làm việc cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Kỹ Năng Viết Email và Báo Cáo Chuyên Nghiệp',
      categoryName: 'Kỹ Năng Mềm',
      instructorName: 'Lê Huyền Trang',
      level: 'Cơ Bản',
      duration: 3600 * 10,
      price: 599000,
      originalPrice: 999000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Nâng cao khả năng giao tiếp qua văn bản, viết email rõ ràng, lịch sự và báo cáo thuyết phục.',
      learnings: [
        'Cấu trúc email hiệu quả (Subject, Body, CTA)',
        'Ngôn ngữ lịch sự và chuyên nghiệp',
        'Cách viết báo cáo tổng hợp và đề xuất',
        'Tránh các lỗi phổ biến khi viết văn bản',
      ],
      requirements: ['Kỹ năng văn phòng cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Tài Chính Cá Nhân và Đầu Tư Dài Hạn',
      categoryName: 'Tài Chính',
      instructorName: 'Hoàng Văn Kiên',
      level: 'Cơ Bản',
      duration: 3600 * 15,
      price: 899000,
      originalPrice: 1500000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Xây dựng kế hoạch tài chính vững chắc, quản lý nợ, và bắt đầu hành trình đầu tư an toàn.',
      learnings: [
        'Nguyên tắc 6 Chiếc Hũ và Lập Ngân sách',
        'Quản lý Nợ và Lãi suất kép',
        'Các kênh Đầu tư cơ bản (Cổ phiếu, Quỹ, Bất động sản)',
        'Xây dựng Quỹ Khẩn cấp',
      ],
      requirements: ['Không có'],
      image: sampleImageUrl,
    },
    {
      title: 'Ethical Hacking và Kiểm Thử Xâm Nhập Cơ Bản',
      categoryName: 'An Toàn Thông Tin',
      instructorName: 'Hoàng Kim Chi',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 2199000,
      originalPrice: 2199000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học các kỹ thuật tấn công và phòng thủ mạng, từ đó kiểm thử và bảo mật hệ thống.',
      learnings: [
        'Các giai đoạn của Pentesting (Thăm dò, Quét, Khai thác)',
        'Kỹ thuật SQL Injection và XSS',
        'Bảo mật Mạng Wi-Fi và VPN',
        'Sử dụng các công cụ như Nmap và Metasploit',
      ],
      requirements: ['Kiến thức mạng và Linux cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Di Động Nâng Cao với Kotlin và Jetpack Compose',
      categoryName: 'Lập Trình Di Động',
      instructorName: 'Đinh Công Bách',
      level: 'Nâng Cao',
      duration: 3600 * 40,
      price: 2499000,
      originalPrice: 4500000,
      discount: 44,
      discountExpiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      description:
        'Phát triển ứng dụng Android hiện đại, sử dụng Kotlin và thư viện UI khai báo Jetpack Compose.',
      learnings: [
        'Cú pháp nâng cao của Kotlin',
        'Sử dụng Jetpack Compose cho UI',
        'Quản lý State và Coroutines',
        'Kiến trúc MVVM/MVI và Dependency Injection',
      ],
      requirements: ['Cơ bản về lập trình Android/Kotlin'],
      image: sampleImageUrl,
    },
    {
      title: 'Tối Ưu Hóa Game Engine và Đồ Họa Nâng Cao (Unity Shader)',
      categoryName: 'Lập Trình Game',
      instructorName: 'Vũ Quốc Hùng',
      level: 'Nâng Cao',
      duration: 3600 * 30,
      price: 2199000,
      originalPrice: 2199000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Đi sâu vào lập trình Shader, Rendering Pipeline và tối ưu hóa đồ họa để tạo ra hình ảnh chất lượng cao.',
      learnings: [
        'Cơ bản về Unity Shader Language (ShaderLab/HLSL)',
        'Tạo Custom Shader (Unlit, Surface)',
        'Kỹ thuật Post-Processing và Lighting',
        'Tối ưu hóa Draw Calls và Batching',
      ],
      requirements: ['Kinh nghiệm lập trình Unity cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Web Backend với Python Django và REST Framework',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Trung Cấp',
      duration: 3600 * 35,
      price: 1899000,
      originalPrice: 3500000,
      discount: 46,
      discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      description:
        'Xây dựng các API mạnh mẽ, bảo mật và khả năng mở rộng bằng Framework Django của Python.',
      learnings: [
        'Cơ bản về Django ORM và Models',
        'Xây dựng API với Django REST Framework',
        'Xử lý Authentication (JWT) và Permissions',
        'Deployment ứng dụng Django',
      ],
      requirements: ['Cơ bản về Python và SQL'],
      image: sampleImageUrl,
    },
    {
      title: 'Giới Thiệu về Quantum Computing và Lập Trình Cơ Bản',
      categoryName: 'Trí Tuệ Nhân Tạo',
      instructorName: 'Phạm Thị Thảo',
      level: 'Nâng Cao',
      duration: 3600 * 18,
      price: 1599000,
      originalPrice: 1599000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Khám phá các nguyên tắc của Máy tính Lượng tử (Quantum Computing) và thực hành với Qiskit/Cirq.',
      learnings: [
        'Khái niệm Qubit, Superposition và Entanglement',
        'Cổng Lượng tử và Mạch Lượng tử',
        'Thuật toán lượng tử cơ bản (Deutsch-Jozsa, Grover)',
        'Thực hành với thư viện Qiskit',
      ],
      requirements: ['Nền tảng Toán học/Vật lý cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Tiếng Anh Giao Tiếp Cơ Bản trong Môi Trường Công Việc IT',
      categoryName: 'Kỹ Năng Mềm',
      instructorName: 'Lê Huyền Trang',
      level: 'Cơ Bản',
      duration: 3600 * 15,
      price: 999000,
      originalPrice: 999000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học các từ vựng và mẫu câu cần thiết để giao tiếp hiệu quả trong các cuộc họp, báo cáo dự án IT.',
      learnings: [
        'Từ vựng chuyên ngành IT và Công nghệ',
        'Thực hành phỏng vấn và thuyết trình tiếng Anh',
        'Viết email và tài liệu kỹ thuật bằng tiếng Anh',
        'Nghe hiểu trong các buổi Daily Scrum',
      ],
      requirements: ['Tiếng Anh cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Xây Dựng Ứng Dụng Fullstack với NestJS và GraphQL',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 40,
      price: 2399000,
      originalPrice: 4000000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description:
        'Học cách thiết kế và xây dựng API theo kiến trúc GraphQL hiện đại sử dụng NestJS (TypeScript) và Apollo Server.',
      learnings: [
        'Cơ bản về NestJS Framework và TypeScript',
        'Thiết kế Schema và Resolvers trong GraphQL',
        'Xử lý Authentication và Authorization với Guards',
        'Tích hợp TypeORM và Database',
      ],
      requirements: ['Kinh nghiệm lập trình Node.js/TypeScript'],
      image: sampleImageUrl,
    },
    {
      title: 'Tối Ưu Hóa Trải Nghiệm Người Dùng (UX) trong Ứng Dụng Web',
      categoryName: 'Lập Trình Web',
      instructorName: 'Đào Duy Mạnh', // Giả định designer tham gia hướng dẫn mảng UX
      level: 'Trung Cấp',
      duration: 3600 * 15,
      price: 999000,
      originalPrice: 1599000,
      discount: 37,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Áp dụng các nguyên tắc UX để cải thiện khả năng sử dụng, tính hấp dẫn và hiệu quả của các ứng dụng web.',
      learnings: [
        'Nguyên tắc thiết kế thân thiện với người dùng (Usability Heuristics)',
        'Thực hiện A/B Testing và Phân tích hành vi người dùng',
        'Cải thiện Flow và Feedback Loop',
        'Thiết kế Form và Input tối ưu',
      ],
      requirements: ['Cơ bản về HTML/CSS', 'Quan tâm đến UI/UX'],
      image: sampleImageUrl,
    },

    {
      title: 'Lập Trình Web với Rust và Actix Web Framework',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 45,
      price: 2699000,
      originalPrice: 4500000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xây dựng các dịch vụ backend siêu nhanh và an toàn bộ nhớ (memory-safe) với ngôn ngữ Rust.',
      learnings: [
        'Cơ bản về Rust Syntax và Ownership Model',
        'Lập trình Web Server với Actix Web',
        'Xử lý I/O và Asynchronous Programming',
        'Kết nối PostgreSQL/MySQL với Diesel ORM',
      ],
      requirements: [
        'Kinh nghiệm lập trình Backend',
        'Nắm vững kiến thức cấu trúc dữ liệu',
      ],
      image: sampleImageUrl,
    },
    {
      title: 'Bảo Mật Ứng Dụng Web (Security) Toàn Diện (OWASP Top 10)',
      categoryName: 'An Toàn Thông Tin',
      instructorName: 'Hoàng Kim Chi',
      level: 'Nâng Cao',
      duration: 3600 * 30,
      price: 1999000,
      originalPrice: 3299000,
      discount: 39,
      discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xác định, phòng chống và giảm thiểu các lỗ hổng bảo mật phổ biến nhất theo danh sách OWASP Top 10.',
      learnings: [
        'Phòng chống SQL Injection và Cross-Site Scripting (XSS)',
        'Quản lý Session và Cookie an toàn',
        'Xử lý Authentication và Authorization (Oauth2, JWT)',
        'Kiểm thử xâm nhập (Penetration Testing) cơ bản',
      ],
      requirements: ['Kinh nghiệm lập trình Web/Backend'],
      image: sampleImageUrl,
    },

    // --- BỔ SUNG KHÓA HỌC MỚI (DevOps & Cloud) ---
    {
      title:
        'Mastering Kubernetes (K8s) Nâng Cao: Cluster, Networking và Storage',
      categoryName: 'DevOps',
      instructorName: 'Phạm Quang Huy',
      level: 'Nâng Cao',
      duration: 3600 * 50,
      price: 3499000,
      originalPrice: 3499000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ Kubernetes từ việc cài đặt cluster đến quản lý các thành phần phức tạp như Service Mesh, Ingress, và Volume.',
      learnings: [
        'Cấu trúc và Kiến trúc của Kubernetes Cluster',
        'Quản lý Mạng (Networking) và Service Discovery',
        'Lưu trữ Bền vững (Persistent Storage) với Volumes và PVCs',
        'Sử dụng Helm để quản lý ứng dụng phức tạp',
      ],
      requirements: ['Thành thạo Docker và cơ bản Kubernetes'],
      image: sampleImageUrl,
    },
    {
      title: 'Monitoring và Logging với Prometheus và Grafana',
      categoryName: 'DevOps',
      instructorName: 'Phạm Quang Huy',
      level: 'Trung Cấp',
      duration: 3600 * 25,
      price: 1599000,
      originalPrice: 2800000,
      discount: 43,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Thiết lập hệ thống giám sát hiệu suất ứng dụng và cơ sở hạ tầng theo thời gian thực (Real-time).',
      learnings: [
        'Cài đặt và cấu hình Prometheus (Metrics)',
        'Thiết kế Dashboard trực quan với Grafana',
        'Alerting và thông báo sự cố',
        'Logging tập trung với ELK/Loki Stack',
      ],
      requirements: ['Cơ bản Linux và Server'],
      image: sampleImageUrl,
    },
    {
      title: 'Điện Toán Đám Mây: Azure Fundamentals (AZ-900)',
      categoryName: 'Điện Toán Đám Mây',
      instructorName: 'Võ Minh Phúc',
      level: 'Cơ Bản',
      duration: 3600 * 20,
      price: 1899000,
      originalPrice: 1899000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Tổng quan về các dịch vụ và nguyên tắc cơ bản của Microsoft Azure, chuẩn bị cho chứng chỉ AZ-900.',
      learnings: [
        'Khái niệm về Cloud Computing và Azure',
        'Các dịch vụ cốt lõi (Compute, Storage, Networking)',
        'Bảo mật, Quyền riêng tư và Tuân thủ trên Azure',
        'Quản lý chi phí và SLA',
      ],
      requirements: ['Không có'],
      image: sampleImageUrl,
    },
    {
      title: 'Serverless Computing với AWS Lambda và API Gateway',
      categoryName: 'Điện Toán Đám Mây',
      instructorName: 'Võ Minh Phúc',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 2099000,
      originalPrice: 3200000,
      discount: 35,
      discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xây dựng, triển khai và quản lý các ứng dụng không máy chủ (Serverless) hiệu quả về chi phí.',
      learnings: [
        'Lập trình và triển khai AWS Lambda Functions',
        'Cấu hình API Gateway cho RESTful API',
        'Làm việc với DynamoDB (NoSQL Serverless Database)',
        'Quản lý và giám sát Serverless Application Model (SAM)',
      ],
      requirements: ['Kinh nghiệm lập trình cơ bản', 'Cơ bản về AWS'],
      image: sampleImageUrl,
    },
    {
      title: 'Tối Ưu Hóa PostgreSQL: Scaling và Performance Tuning',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Nâng Cao',
      duration: 3600 * 35,
      price: 2299000,
      originalPrice: 2299000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Khóa học chuyên sâu về quản trị và tối ưu hóa PostgreSQL cho các hệ thống có tải trọng lớn và yêu cầu độ sẵn sàng cao.',
      learnings: [
        'Sử dụng Explain Analyze để tối ưu truy vấn',
        'Indexing Strategies nâng cao (Partial Index, Function Index)',
        'Partitioning và Table Inheritance',
        'Replication (Master-Slave) và High Availability',
      ],
      requirements: ['Kinh nghiệm với SQL và PostgreSQL cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Phân Tích Dữ Liệu Lớn (Big Data) với Apache Spark',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Nâng Cao',
      duration: 3600 * 40,
      price: 2899000,
      originalPrice: 4800000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xử lý và phân tích dữ liệu phân tán (Big Data) bằng công cụ Apache Spark, sử dụng Python (PySpark).',
      learnings: [
        'Kiến trúc phân tán của Spark Cluster',
        'Làm việc với RDDs, DataFrames và Spark SQL',
        'Thực hiện các phép biến đổi và hành động (Transformations and Actions)',
        'Tối ưu hóa hiệu suất ứng dụng Spark',
      ],
      requirements: ['Thành thạo Python', 'Cơ bản về SQL'],
      image: sampleImageUrl,
    },
    {
      title:
        'Elasticsearch và ELK Stack: Tìm Kiếm Toàn Văn Bản và Phân Tích Log',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Trung Cấp',
      duration: 3600 * 25,
      price: 1699000,
      originalPrice: 1699000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ Elasticsearch cho khả năng tìm kiếm tốc độ cao và sử dụng ELK (Elasticsearch, Logstash, Kibana) để quản lý Log.',
      learnings: [
        'Cấu trúc Inverted Index và Query Language của Elasticsearch',
        'Sử dụng Logstash để thu thập và xử lý dữ liệu',
        'Xây dựng Dashboard phân tích Log với Kibana',
        'Tối ưu hóa tốc độ tìm kiếm và indexing',
      ],
      requirements: ['Kinh nghiệm làm việc với dữ liệu JSON'],
      image: sampleImageUrl,
    },
    {
      title: 'Git Nâng Cao và Quản Lý Version Control Cho Dự Án Lớn',
      categoryName: 'Lập Trình Web',
      instructorName: 'Phạm Quang Huy',
      level: 'Trung Cấp',
      duration: 3600 * 15,
      price: 899000,
      originalPrice: 1399000,
      discount: 35,
      discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description:
        'Làm chủ các lệnh Git phức tạp, quản lý xung đột, và áp dụng các mô hình Branching (Git Flow, GitHub Flow).',
      learnings: [
        'Lệnh Rebase, Cherry-pick và Interactive Rebase',
        'Quản lý Submodules và Git Hooks',
        'Giải quyết xung đột Merge phức tạp',
        'Áp dụng chiến lược Branching cho đội nhóm',
      ],
      requirements: ['Đã biết sử dụng Git cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Thiết Kế Hệ Thống (System Design) cho Kỹ Sư Phần Mềm',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 30,
      price: 2499000,
      originalPrice: 2499000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách thiết kế kiến trúc các hệ thống phân tán lớn (ví dụ: Twitter, Netflix) để giải quyết các vấn đề về khả năng mở rộng, độ khả dụng và hiệu suất.',
      learnings: [
        'Kiến trúc Load Balancer và Gateway',
        'Thiết kế Caching Layers (CDN, Redis)',
        'Database Sharding và Replication',
        'Sử dụng Message Queue và Asynchronous Processing',
      ],
      requirements: ['Kinh nghiệm lập trình Backend Nâng Cao'],
      image: sampleImageUrl,
    },
    {
      title: 'Công Cụ Thiết Kế Vector Chuyên Nghiệp với Sketch và Adobe XD',
      categoryName: 'Thiết Kế',
      instructorName: 'Đào Duy Mạnh',
      level: 'Trung Cấp',
      duration: 3600 * 20,
      price: 1399000,
      originalPrice: 2200000,
      discount: 36,
      discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      description:
        'Khóa học tập trung vào các công cụ vector phổ biến để thiết kế UI/UX và tạo prototype nhanh chóng.',
      learnings: [
        'Quản lý Component và Library trong Sketch/XD',
        'Tạo Interactive Prototype và Animation',
        'Hợp tác và bàn giao thiết kế cho Developers',
        'Nguyên tắc thiết kế Design System cơ bản',
      ],
      requirements: ['Cơ bản về UI/UX'],
      image: sampleImageUrl,
    },
    {
      title: 'Phát Triển Ứng Dụng Đa Nền Tảng với React Native và Expo',
      categoryName: 'Lập Trình Di Động',
      instructorName: 'Đinh Công Bách',
      level: 'Trung Cấp',
      duration: 3600 * 45,
      price: 2099000,
      originalPrice: 3500000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description:
        'Học cách sử dụng React và JavaScript để xây dựng ứng dụng di động cho cả iOS và Android một cách hiệu quả.',
      learnings: [
        'Cấu trúc và Component trong React Native',
        'Sử dụng Expo CLI và Workflow',
        'Navigation và State Management (Redux/Context)',
        'Truy cập Native APIs và Deployment',
      ],
      requirements: ['Thành thạo React và JavaScript'],
      image: sampleImageUrl,
    },
    {
      title: 'Tối Ưu Hóa Tỷ Lệ Chuyển Đổi (CRO) cho Website/Landing Page',
      categoryName: 'Marketing',
      instructorName: 'Nguyễn Thành Luân',
      level: 'Trung Cấp',
      duration: 3600 * 18,
      price: 1199000,
      originalPrice: 1999000,
      discount: 40,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Áp dụng tâm lý học và phân tích dữ liệu để biến người truy cập thành khách hàng hoặc người đăng ký.',
      learnings: [
        'Phân tích Phễu Chuyển Đổi (Conversion Funnel)',
        'Thiết kế Call-to-Action (CTA) hiệu quả',
        'Sử dụng Heatmaps và Session Recording (Hotjar, Microsoft Clarity)',
        'Thực hiện các chiến dịch A/B Testing chuyên nghiệp',
      ],
      requirements: ['Cơ bản về Digital Marketing/Google Analytics'],
      image: sampleImageUrl,
    },
    {
      title: 'Phân Tích Dữ Liệu Thực Nghiệm A/B Testing Chuyên Sâu',
      categoryName: 'Khoa Học Dữ Liệu',
      instructorName: 'Lê Hoàng Minh',
      level: 'Trung Cấp',
      duration: 3600 * 20,
      price: 1399000,
      originalPrice: 1399000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ các phương pháp thống kê để thiết kế và phân tích kết quả thử nghiệm A/B Testing, đảm bảo tính chính xác và hiệu lực.',
      learnings: [
        'Thiết kế Thử nghiệm (Sample Size, Duration)',
        'Kiểm định giả thuyết thống kê (T-test, Chi-square)',
        'Xử lý Multiple Testing Problem',
        'Phân tích kết quả A/B Testing bằng Python/R',
      ],
      requirements: ['Kiến thức Thống kê cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Rủi Ro và Khắc Phục Sự Cố IT (Incident Response)',
      categoryName: 'An Toàn Thông Tin',
      instructorName: 'Hoàng Kim Chi',
      level: 'Nâng Cao',
      duration: 3600 * 25,
      price: 1799000,
      originalPrice: 1799000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học cách xây dựng kế hoạch ứng phó sự cố an ninh mạng và khôi phục hệ thống một cách nhanh chóng, hiệu quả.',
      learnings: [
        'Các giai đoạn của Incident Response (NIST, SANS)',
        'Phân loại và ưu tiên sự cố (Triage)',
        'Kỹ thuật điều tra Digital Forensics cơ bản',
        'Xây dựng các quy trình phục hồi sau thảm họa (Disaster Recovery)',
      ],
      requirements: ['Kiến thức về Mạng và Bảo mật cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Game Nâng Cao với Unreal Engine 5 (C++)',
      categoryName: 'Lập Trình Game',
      instructorName: 'Vũ Quốc Hùng',
      level: 'Nâng Cao',
      duration: 3600 * 50,
      price: 2799000,
      originalPrice: 4999000,
      discount: 44,
      discountExpiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      description:
        'Khóa học chuyên sâu về phát triển game 3D chất lượng AAA bằng Unreal Engine và ngôn ngữ C++.',
      learnings: [
        'Cơ bản về C++ trong Unreal Engine',
        'Sử dụng Blueprint và tích hợp C++',
        'Hệ thống Vật lý và Animation nâng cao',
        'Tối ưu hóa và Deployment cho các nền tảng',
      ],
      requirements: ['Kinh nghiệm lập trình C++ cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Quản Lý Dữ Liệu Thời Gian Thực (Real-time Data) với Apache Kafka',
      categoryName: 'Cơ Sở Dữ Liệu',
      instructorName: 'Trần Văn Tùng',
      level: 'Nâng Cao',
      duration: 3600 * 30,
      price: 1999000,
      originalPrice: 1999000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ Apache Kafka để xây dựng các data pipeline, truyền tải dữ liệu sự kiện (event stream) tốc độ cao và đáng tin cậy.',
      learnings: [
        'Kiến trúc Kafka (Broker, Producer, Consumer, Topic)',
        'Thiết lập Kafka Cluster cơ bản',
        'Sử dụng Kafka Streams cho việc xử lý dữ liệu',
        'Tích hợp Kafka với Microservices',
      ],
      requirements: ['Kinh nghiệm lập trình Backend', 'Cơ bản về Linux'],
      image: sampleImageUrl,
    },
    {
      title: 'Kỹ Năng Hợp Tác và Giải Quyết Mâu Thuẫn trong Đội Nhóm Lập Trình',
      categoryName: 'Kỹ Năng Mềm',
      instructorName: 'Lê Huyền Trang',
      level: 'Trung Cấp',
      duration: 3600 * 12,
      price: 799000,
      originalPrice: 1200000,
      discount: 33,
      discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      description:
        'Học cách làm việc hiệu quả với đồng nghiệp, đưa ra và nhận phản hồi, và giải quyết các xung đột thường gặp trong môi trường Agile/Scrum.',
      learnings: [
        'Nguyên tắc Giao tiếp Hiệu quả (Active Listening)',
        'Phương pháp Lãnh đạo tình huống (Situational Leadership)',
        'Kỹ thuật đưa ra và nhận Phản hồi mang tính xây dựng',
        'Xử lý các xung đột cá nhân và chuyên môn',
      ],
      requirements: ['Kinh nghiệm làm việc nhóm (tùy chọn)'],
      image: sampleImageUrl,
    },
    // -------------------------------------------
    {
      title: 'Khóa Học Phát Triển Toàn Diện React & Redux',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Trung Cấp',
      duration: 3600 * 45,
      price: 1000000,
      originalPrice: 1000000,
      discount: 0,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Thành thạo React từ cơ bản đến nâng cao với các dự án thực tế và Redux Toolkit.',
      learnings: [
        'Cấu trúc cơ bản của React và JSX',
        'Sử dụng Hooks và Context API hiệu quả',
        'Quản lý State với Redux Toolkit',
        'Xây dựng Routing và triển khai ứng dụng',
      ],
      requirements: ['Kiến thức cơ bản về HTML/CSS', 'Nắm vững JavaScript ES6'],
      image: sampleImageUrl,
    },
    {
      title: 'Xây Dựng Ứng Dụng Tương Tác Cao với Vue.js 3',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Trung Cấp',
      duration: 3600 * 30,
      price: 1000000,
      originalPrice: 1000000,
      discount: 0,
      discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      description:
        'Nắm vững Framework Vue.js 3, Composition API và xây dựng các ứng dụng đơn trang (SPA) hiệu suất cao.',
      learnings: [
        'Vue.js 3 Fundamentals',
        'Composition API và Pinia State Management',
        'Vue Router và Quản lý Form',
        'Tối ưu hóa hiệu suất và Deployment',
      ],
      requirements: [
        'HTML, CSS, JavaScript ES6',
        'Cơ bản về Vue.js 2 (tùy chọn)',
      ],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Web Cơ Bản: HTML5, CSS3 và JavaScript ES6',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Cơ Bản',
      duration: 3600 * 50,
      price: 1000000,
      originalPrice: 1000000,
      discount: 0,
      discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description:
        'Nền tảng vững chắc để bắt đầu sự nghiệp lập trình web, tạo giao diện và logic cơ bản.',
      learnings: [
        'Xây dựng cấu trúc với HTML5',
        'Thiết kế giao diện đẹp với CSS3 (Flexbox, Grid)',
        'Lập trình tương tác với JavaScript ES6',
        'Dự án website tĩnh đầu tiên',
      ],
      requirements: ['Không yêu cầu kinh nghiệm'],
      image: sampleImageUrl,
    },
    {
      title: 'Fullstack Next.js 14 & Prisma: Xây Dựng Ứng Dụng E-commerce',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Nâng Cao',
      duration: 3600 * 50,
      price: 1000000,
      originalPrice: 2000000,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      description:
        'Học cách xây dựng ứng dụng Fullstack hiện đại với Next.js App Router, TypeScript, Tailwind CSS và Prisma ORM.',
      learnings: [
        'Sử dụng Next.js App Router và Server Components',
        'Quản lý cơ sở dữ liệu với Prisma và PostgreSQL',
        'Xử lý xác thực (Authentication) với NextAuth',
        'Triển khai (Deployment) lên Vercel',
      ],
      requirements: ['Kinh nghiệm cơ bản với React và Node.js'],
      image: sampleImageUrl,
    },
    {
      title: 'Thành Thạo TypeScript: Từ Zero đến Chuyên Sâu',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Trung Cấp',
      duration: 3600 * 20,
      price: 1099000,
      originalPrice: 1999000,
      discount: 45,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Chuyển đổi các dự án JavaScript sang TypeScript để tăng cường khả năng bảo trì và giảm lỗi runtime.',
      learnings: [
        'Type Primitives và Type Inference',
        'Sử dụng Generics và Utility Types nâng cao',
        'Làm việc với Classes, Interfaces và Type Aliases',
        'Cấu hình tsconfig.json và Tích hợp vào dự án React/Node',
      ],
      requirements: ['Nắm vững JavaScript ES6'],
      image: sampleImageUrl,
    },
    {
      title: 'Xây Dựng API Hiệu Suất Cao với Go (Golang) và Gin Framework',
      categoryName: 'Lập Trình Backend',
      instructorName: 'Trần Thị Mai',
      level: 'Nâng Cao',
      duration: 3600 * 35,
      price: 2199000,
      originalPrice: 2199000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Học ngôn ngữ Go và cách sử dụng Gin Framework để xây dựng các microservices và API tốc độ cao.',
      learnings: [
        'Cơ bản về Go Syntax và Concurrency (Goroutines)',
        'Thiết kế RESTful API với Gin',
        'Xử lý Cơ sở dữ liệu (SQL/NoSQL) trong Go',
        'Testing và Triển khai dịch vụ Go',
      ],
      requirements: ['Kinh nghiệm lập trình Backend'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Frontend Nâng Cao với Svelte và SvelteKit',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Trung Cấp',
      duration: 3600 * 28,
      price: 1699000,
      originalPrice: 2800000,
      discount: 39,
      discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      description:
        'Học Framework Svelte thế hệ mới, tối ưu hóa hiệu suất ứng dụng web bằng cách loại bỏ Virtual DOM.',
      learnings: [
        'Cơ bản về Svelte Component và Reactivity',
        'Sử dụng SvelteKit cho Server-Side Rendering (SSR)',
        'Quản lý State và Routing trong SvelteKit',
        'Xây dựng một dự án thực tế với SvelteKit',
      ],
      requirements: ['Kiến thức HTML, CSS, JavaScript cơ bản'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Web Socket Thời Gian Thực với Socket.IO và React',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Trung Cấp',
      duration: 3600 * 20,
      price: 1299000,
      originalPrice: 2000000,
      discount: 35,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Xây dựng các ứng dụng chat, thông báo theo thời gian thực (real-time) bằng Socket.IO và tích hợp vào React.',
      learnings: [
        'Cơ bản về Web Sockets và Long Polling',
        'Thiết lập Socket.IO Server (Node.js) và Client (React)',
        'Xây dựng ứng dụng Chat Group',
        'Xử lý Disconnect và Tái kết nối',
      ],
      requirements: ['Kinh nghiệm cơ bản với React và Node.js'],
      image: sampleImageUrl,
    },
    {
      title: 'Performance Optimization: Tối Ưu Hóa Tốc Độ Website Frontend',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Nâng Cao',
      duration: 3600 * 25,
      price: 1000000,
      originalPrice: 1000000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Làm chủ các kỹ thuật tối ưu hóa để đạt điểm Core Web Vitals cao và tăng tốc độ tải trang.',
      learnings: [
        'Phân tích hiệu suất với Lighthouse và WebPageTest',
        'Tối ưu hóa hình ảnh và Lazy Loading',
        'Code Splitting và Tree Shaking',
        'Caching và Service Worker',
      ],
      requirements: ['Thành thạo JavaScript và một Framework (React/Vue)'],
      image: sampleImageUrl,
    },
    {
      title:
        'Xây Dựng Framework/Thư Viện Frontend từ Đầu bằng Vanilla JavaScript',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Nâng Cao',
      duration: 3600 * 35,
      price: 2199000,
      originalPrice: 2199000,
      discount: 0,
      discountExpiresAt: null,
      description:
        'Đi sâu vào cơ chế hoạt động của các framework (Virtual DOM, Reactivity) bằng cách tự xây dựng phiên bản đơn giản.',
      learnings: [
        'Hiểu cơ chế Virtual DOM và Reconciliation',
        'Xây dựng hệ thống Component cơ bản',
        'Quản lý State theo cơ chế Observer Pattern',
        'Tối ưu hóa Performance của Rendering',
      ],
      requirements: ['Thành thạo JavaScript ES6+'],
      image: sampleImageUrl,
    },
    {
      title: 'Lập Trình Front-end Chuyên Sâu với Webpack và Bundling',
      categoryName: 'Lập Trình Web',
      instructorName: 'Nguyễn Văn An',
      level: 'Nâng Cao',
      duration: 3600 * 20,
      price: 1399000,
      originalPrice: 2299000,
      discount: 39,
      discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      description:
        'Nắm vững các công cụ Bundling (Webpack, Rollup, Vite) để quản lý tài nguyên, tối ưu hóa kích thước và tốc độ tải ứng dụng.',
      learnings: [
        'Cấu hình Webpack từ đầu (Loaders, Plugins)',
        'Sử dụng Code Splitting và Lazy Loading',
        'Tối ưu hóa Tree Shaking và Minification',
        'So sánh Webpack vs Vite và chọn công cụ phù hợp',
      ],
      requirements: ['Thành thạo JavaScript Modules'],
      image: sampleImageUrl,
    },
  ];

  const randomDaysAgo = Math.floor(Math.random() * 365);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - randomDaysAgo);

  for (const data of coursesData) {
    // Category
    let category = await categoryRepo.findOne({
      where: { categoryName: data.categoryName },
    });
    if (!category) {
      category = categoryRepo.create({ categoryName: data.categoryName });
      await categoryRepo.save(category);
    }

    let instructor = await userRepo.findOne({
      where: { fullName: data.instructorName },
    });
    if (!instructor) {
      const emailName = data.instructorName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();

      instructor = userRepo.create({
        fullName: data.instructorName,
        email: `${emailName}@example.com`,
        password: '123456',
        phone: '09' + Math.floor(Math.random() * 900000000 + 100000000),
        dateOfBirth: '1990-01-01',
        address: 'Hà Nội, Việt Nam',
        isActive: true,
        role: teacherRole ?? undefined,
      });
      await userRepo.save(instructor);
    }
    const hashedPassword = await bcrypt.hash('123456', 10);
    const course = courseRepo.create({
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      originalPrice: data.originalPrice || null,
      discount: data.discount || null,
      discountExpiresAt: data.discountExpiresAt || null,
      rating: Number((Math.random() * (5 - 3) + 3).toFixed(1)),
      ratingCount: Math.floor(Math.random() * 1000 + 50),
      students: Math.floor(Math.random() * 5000 + 1000),
      level: data.level,
      image: data.image,
      requirements: data.requirements || null,
      learnings: data.learnings,
      status: 'published',
      category,
      instructor,
      createdAt,
      updatedAt: createdAt,
    } as DeepPartial<Course>);
    await courseRepo.save(course);
    const seederTimestamp = Date.now();
    for (let i = 1; i <= 3; i++) {
      const chapter = chapterRepo.create({
        id: uuidv4(),
        title: `Chương ${i}: Giới thiệu và Các khái niệm cơ bản (Phần ${i})`,
        order: i,
        course,
      });
      await chapterRepo.save(chapter);

      for (let j = 1; j <= 3; j++) {
        const lesson = lessonRepo.create({
          id: uuidv4(),
          title: `Bài học ${j}: Khái niệm chủ chốt số ${j}`,
          content: `Nội dung bài học ${j} của chương ${i} trong khóa ${course.title}`,
          duration: Math.floor(Math.random() * 12) + 5,
          order: j,
          chapter,
        });
        await lessonRepo.save(lesson);

        const videoAsset = lessonVideoRepo.create({
          lesson: lesson,
          publicId: `${samplePublicIdBase}_chapter${i}_lesson${j}_${seederTimestamp}`,
          originalUrl: sampleOriginalUrl,
          duration: sampleDuration,
          widthOriginal: sampleWidth,
          heightOriginal: sampleHeight,
        });

        await lessonVideoRepo.save(videoAsset);
      }
    }
    const reviewers = ['Hoàng Thị Bích', 'Phan Văn Cường', 'Đỗ Mai Hoa'];
    for (const name of reviewers) {
      let reviewer = await userRepo.findOne({ where: { fullName: name } });
      if (!reviewer) {
        const emailName = name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '.')
          .toLowerCase();

        reviewer = userRepo.create({
          fullName: name,
          email: `${emailName}@student.com`,
          password: hashedPassword,
          phone: '09' + Math.floor(Math.random() * 900000000 + 100000000),
          dateOfBirth: '1995-01-01',
          address: 'TP. Hồ Chí Minh, Việt Nam',
          isActive: true,
          role: studentRole ?? undefined,
        });
        await userRepo.save(reviewer);
      }

      const courseComment = commentRepo.create({
        content: `Khóa học "${data.title}" rất hay và thực tế! Tôi học được rất nhiều từ giảng viên ${data.instructorName}.`,
        rating: Math.floor(Math.random() * 2) + 4,
        user: reviewer,
        type: 'course',
        course,
      });
      await commentRepo.save(courseComment);

      const lessons = await lessonRepo.find({
        where: { chapter: { course: { id: course.id } } },
        relations: ['chapter', 'chapter.course'],
      });

      const randomLessonIndexes = [0, 3].map(
        (offset) => offset + Math.floor(Math.random() * (lessons.length / 3)),
      );

      for (const index of randomLessonIndexes) {
        if (lessons[index]) {
          const lessonComment = commentRepo.create({
            content: `Bài giảng "${lessons[index].title}" trong ${lessons[index].chapter.title} rất dễ hiểu. Cảm ơn Giảng viên ${data.instructorName}.`,
            user: reviewer,
            lesson: lessons[index],
            type: 'lesson',
          });
          await commentRepo.save(lessonComment);
        }
      }
    }
  }

  console.log(
    `✅ Seeded ${coursesData.length} full courses  with chapters, lessons, instructors & reviews!`,
  );
};
