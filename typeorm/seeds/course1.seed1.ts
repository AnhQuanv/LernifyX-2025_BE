import { DataSource, DeepPartial } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';
import { Category } from '../../src/modules/category/entities/category.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Chapter } from '../../src/modules/chapter/entities/chapter.entity';
import { Lesson } from '../../src/modules/lesson/entities/lesson.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';
import { Role } from '../../src/modules/role/entities/role.entity';
import { LessonVideo } from '../../src/modules/lesson_video/entities/lesson_video.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface LessonData {
  title: string;
  content: string;
}

interface ChapterData {
  title: string;
  lessons: LessonData[];
}

interface CourseData {
  title: string;
  categoryName: string;
  instructorName: string;
  level: string;
  duration: number;
  price: number;
  originalPrice: number;
  discount: number;
  discountExpiresAt: Date | null;
  description: string;
  learnings: string[];
  requirements: string[];
  image: string;
  chapters: ChapterData[];
}

// --- Dữ liệu Cố định ---
const sampleImageUrl =
  'https://res.cloudinary.com/drc4b7rmj/image/upload/v1765697944/fviba233pcpwe3v2h5zo.jpg';
const sampleOriginalUrl =
  'https://stream.mux.com/J02MyoiL7n4184AXGA01SL02kgaZCNcHgi1hOsy7HOOES00.m3u8';
const sampleDuration = 207;
const sampleWidth = 576;
const sampleHeight = 360;

// Hàm tạo ngày ngẫu nhiên
const createRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const coursesData: CourseData[] = [
  {
    // Khóa 2: ReactJS Toàn Diện: Hooks, Context & Redux - Intermediate
    title: 'ReactJS Toàn Diện: Từ Cơ Bản đến Nâng Cao với Hooks và Context API',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1599000,
    originalPrice: 2200000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Thành thạo thư viện ReactJS, tập trung vào việc sử dụng Functional Components và Hooks để xây dựng các ứng dụng Single Page Application (SPA) chuyên nghiệp và có thể mở rộng.',
    learnings: [
      'Thành thạo các Hooks cơ bản: useState, useEffect, useContext',
      'Quản lý State toàn cục bằng Context API và useReducer',
      'Sử dụng Redux Toolkit cho các ứng dụng phức tạp',
      'Xây dựng Custom Hooks cho logic tái sử dụng',
      'Tối ưu hóa hiệu năng bằng useMemo, useCallback',
    ],
    requirements: ['Kiến thức vững về HTML, CSS và JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng React và Hooks Cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Setup Project với Vite/CRA và JSX',
            content:
              'Hướng dẫn cài đặt môi trường và làm quen với cú pháp JSX.',
          },
          {
            title: 'Bài 1.2: State Management với useState',
            content:
              'Cách khai báo và cập nhật state trong Functional Components.',
          },
          {
            title: 'Bài 1.3: Side Effects với useEffect',
            content:
              'Sử dụng useEffect để xử lý các tác vụ ngoài lề như Fetch API.',
          },
        ],
      },
      {
        title: 'Chương 2: Quản lý State Nâng Cao và Custom Hooks',
        lessons: [
          {
            title: 'Bài 2.1: Truyền dữ liệu xuyên suốt với Context API',
            content: 'Sử dụng Context để tránh Prop Drilling.',
          },
          {
            title: 'Bài 2.2: Redux Toolkit: Khái niệm Store, Reducers, Actions',
            content: 'Giới thiệu về Redux Toolkit và cách setup store.',
          },
          {
            title: 'Bài 2.3: Xây dựng Custom Hooks để tái sử dụng logic',
            content: 'Thực hành tạo Hooks cho form validation, fetch data.',
          },
        ],
      },
    ],
  },
  {
    // Khóa 3: Node.js/ExpressJS: API Backend Toàn Diện - Intermediate
    title: 'Node.js/ExpressJS: Xây dựng RESTful API Backend Toàn Diện',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Thanh Hải',
    level: 'Nâng Cao',
    duration: 3600 * 28,
    price: 1899000,
    originalPrice: 2600000,
    discount: 0,
    discountExpiresAt: null,
    description:
      'Khóa học tập trung vào việc xây dựng API Backend mạnh mẽ bằng Node.js và framework Express.js, bao gồm kết nối database, xác thực (Authentication), và bảo mật API.',
    learnings: [
      'Thiết kế và triển khai RESTful APIs',
      'Sử dụng MongoDB/Mongoose cho Database',
      'Implement JWT Authentication (Đăng nhập/Đăng ký)',
      'Xử lý lỗi và Logging hiệu quả',
      'Triển khai ứng dụng lên Cloud (Heroku/Render)',
    ],
    requirements: ['Kiến thức vững về JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Node.js và ExpressJS Cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Node.js Runtime và Mô hình Non-blocking I/O',
            content: 'Giải thích cách Node.js hoạt động với Event Loop.',
          },
          {
            title: 'Bài 1.2: Thiết lập Express Server và Routing',
            content:
              'Tạo server Express đầu tiên và định nghĩa các route cơ bản.',
          },
          {
            title: 'Bài 1.3: Middleware và Xử lý Request/Response',
            content: 'Sử dụng các Middleware như body-parser, morgan.',
          },
        ],
      },
      {
        title: 'Chương 2: Database và Authentication',
        lessons: [
          {
            title: 'Bài 2.1: Kết nối MongoDB và sử dụng Mongoose',
            content:
              'Cài đặt MongoDB Atlas, kết nối Mongoose và định nghĩa Schemas.',
          },
          {
            title: 'Bài 2.2: Mã hóa mật khẩu với Bcrypt và JWT Authentication',
            content:
              'Thực hành quy trình Đăng ký (Register) và Đăng nhập (Login).',
          },
          {
            title: 'Bài 2.3: Viết API CRUD hoàn chỉnh cho một tài nguyên',
            content:
              'Triển khai các phương thức GET, POST, PUT, DELETE cho một đối tượng.',
          },
        ],
      },
    ],
  },
  {
    // Khóa 5: Lập Trình Web Cơ bản: HTML, CSS, JavaScript - Beginner
    title: 'Lập Trình Web Cơ Bản: HTML, CSS, JavaScript Toàn Tập',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phạm Thị Hương',
    level: 'Cơ Bản',
    duration: 3600 * 15,
    price: 599000,
    originalPrice: 999000,
    discount: 40,
    discountExpiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học nền tảng tuyệt vời cho những người mới bắt đầu, xây dựng kiến thức vững chắc về ba trụ cột của lập trình web: HTML, CSS và JavaScript.',
    learnings: [
      'Thành thạo cấu trúc HTML5 Semantic',
      'Thiết kế giao diện Responsive với Flexbox và Grid CSS',
      'Thao tác với DOM bằng JavaScript',
      'Hiểu về Asynchronous JavaScript (Promises, Async/Await)',
    ],
    requirements: ['Máy tính có kết nối Internet'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: HTML5 và Cấu trúc trang web',
        lessons: [
          {
            title: 'Bài 1.1: Cấu trúc cơ bản và thẻ HTML Semantic',
            content:
              'Phân biệt các thẻ HTML5 mới và tầm quan trọng của ngữ nghĩa.',
          },
          {
            title: 'Bài 1.2: Làm việc với Forms và Validation',
            content:
              'Thiết kế các form đăng ký, đăng nhập và sử dụng thuộc tính validation.',
          },
        ],
      },
      {
        title: 'Chương 2: CSS3 và Thiết kế Responsive',
        lessons: [
          {
            title: 'Bài 2.1: Layout với Flexbox và Grid CSS',
            content:
              'Hướng dẫn sử dụng hai công cụ layout mạnh mẽ nhất của CSS.',
          },
          {
            title: 'Bài 2.2: Media Queries và Mobile-First Design',
            content:
              'Cách sử dụng Media Queries để điều chỉnh giao diện trên các kích thước màn hình khác nhau.',
          },
        ],
      },
      {
        title: 'Chương 3: JavaScript Cơ bản và DOM Manipulation',
        lessons: [
          {
            title: 'Bài 3.1: Variables, Data Types và Functions trong JS',
            content:
              'Ôn tập kiến thức nền tảng về biến, kiểu dữ liệu, và cách viết hàm.',
          },
          {
            title: 'Bài 3.2: Thao tác với DOM (Document Object Model)',
            content:
              'Sử dụng JavaScript để chọn, thêm, sửa, xóa các phần tử HTML trên trang web.',
          },
          {
            title: 'Bài 3.3: Fetch API và Xử lý bất đồng bộ (Async/Await)',
            content:
              'Học cách gửi yêu cầu HTTP (API Call) để lấy dữ liệu từ server.',
          },
        ],
      },
    ],
  },

  // -------------------------------------

  // KHÓA 1: Xây Dựng Framework/Thư Viện Frontend từ Đầu bằng Vanilla JavaScript (CÓ CHAPTER CHI TIẾT)
  {
    title:
      'Xây Dựng Framework/Thư Viện Frontend từ Đầu bằng Vanilla JavaScript',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 35,
    price: 2199000,
    originalPrice: 2800000,
    discount: 0,
    discountExpiresAt: null,
    description:
      'Đi sâu vào cơ chế hoạt động của các framework (Virtual DOM, Reactivity) bằng cách tự xây dựng phiên bản đơn giản để hiểu rõ hơn về cách các thư viện lớn như React hoặc Vue hoạt động.',
    learnings: [
      'Hiểu cơ chế Virtual DOM và Reconciliation',
      'Xây dựng hệ thống Component cơ bản',
      'Quản lý State theo cơ chế Observer Pattern',
      'Tối ưu hóa Performance của Rendering',
    ],
    requirements: ['Thành thạo JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Khái niệm về Virtual DOM và Reconciliation',
        lessons: [
          {
            title: 'Bài 1.1: Virtual DOM là gì và tại sao cần nó?',
            content:
              'Giới thiệu về sự khác biệt giữa DOM và Virtual DOM, lý do ra đời và các vấn đề giải quyết.',
          },
          {
            title: 'Bài 1.2: Xây dựng hàm createElement và render cơ bản',
            content:
              'Thực hành tạo ra các hàm mô phỏng phần tử DOM ảo (VNode) và cách gắn nó vào DOM thực.',
          },
          {
            title: 'Bài 1.3: Cơ chế Diffing (Reconciliation) hoạt động',
            content:
              'Phân tích thuật toán so sánh VNode cũ và mới để tìm ra sự khác biệt (patches).',
          },
        ],
      },
      {
        title: 'Chương 2: Thiết kế Hệ thống Component và State',
        lessons: [
          {
            title: 'Bài 2.1: Implement Functional Component',
            content:
              'Cách tạo các hàm component đơn giản và cơ chế tái sử dụng.',
          },
          {
            title: 'Bài 2.2: Xây dựng cơ chế Quản lý State (Reactivity)',
            content:
              'Sử dụng Proxy hoặc Getter/Setter để theo dõi sự thay đổi của State (Observer Pattern).',
          },
          {
            title: 'Bài 2.3: Lifecycle Hooks cơ bản (onMount, onUpdate)',
            content:
              'Thêm các hàm callback vào Component để xử lý sự kiện trong vòng đời.',
          },
        ],
      },
    ],
  },
  // KHÓA 2: ReactJS Toàn Diện: Từ Cơ Bản đến Nâng Cao với Hooks và Context API (CÓ CHAPTER CHI TIẾT)
  {
    title: 'ReactJS Toàn Diện: Từ Cơ Bản đến Nâng Cao với Hooks và Context API',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An', // Giữ nguyên Phan Văn An để tránh lỗi Duplicate Key với Nguyễn Văn An
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1599000,
    originalPrice: 2200000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Thành thạo thư viện ReactJS, tập trung vào việc sử dụng Functional Components và Hooks để xây dựng các ứng dụng Single Page Application (SPA) chuyên nghiệp và có thể mở rộng.',
    learnings: [
      'Thành thạo các Hooks cơ bản: useState, useEffect, useContext',
      'Quản lý State toàn cục bằng Context API và useReducer',
      'Sử dụng Redux Toolkit cho các ứng dụng phức tạp',
      'Xây dựng Custom Hooks cho logic tái sử dụng',
      'Tối ưu hóa hiệu năng bằng useMemo, useCallback',
    ],
    requirements: ['Kiến thức vững về HTML, CSS và JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng React và Hooks Cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Setup Project với Vite/CRA và JSX',
            content:
              'Hướng dẫn cài đặt môi trường và làm quen với cú pháp JSX.',
          },
          {
            title: 'Bài 1.2: State Management với useState',
            content:
              'Cách khai báo và cập nhật state trong Functional Components.',
          },
          {
            title: 'Bài 1.3: Side Effects với useEffect',
            content:
              'Sử dụng useEffect để xử lý các tác vụ ngoài lề như Fetch API.',
          },
        ],
      },
      {
        title: 'Chương 2: Quản lý State Nâng Cao và Custom Hooks',
        lessons: [
          {
            title: 'Bài 2.1: Truyền dữ liệu xuyên suốt với Context API',
            content: 'Sử dụng Context để tránh Prop Drilling.',
          },
          {
            title: 'Bài 2.2: Redux Toolkit: Khái niệm Store, Reducers, Actions',
            content: 'Giới thiệu về Redux Toolkit và cách setup store.',
          },
          {
            title: 'Bài 2.3: Xây dựng Custom Hooks để tái sử dụng logic',
            content: 'Thực hành tạo Hooks cho form validation, fetch data.',
          },
        ],
      },
    ],
  },
  // KHÓA 3: Khóa Học Phát Triển Toàn Diện React & Redux (SỬ DỤNG LOGIC MẶC ĐỊNH)
  {
    title: 'Khóa Học Phát Triển Toàn Diện React & Redux',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 45,
    price: 0,
    originalPrice: 1000000,
    discount: 0,
    discountExpiresAt: null,
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
    chapters: [
      {
        title: 'Chương 1: Nền tảng React và Hooks',
        lessons: [
          {
            title: 'Bài 1.1: Hooks cơ bản (useState, useEffect)',
            content: `Nội dung bài học về State và Lifecycle.`,
          },
          {
            title: 'Bài 1.2: Quản lý State cục bộ và Props',
            content: 'Cách truyền dữ liệu giữa các Component.',
          },
        ],
      },
      {
        title: 'Chương 2: Redux Toolkit và State Toàn Cục',
        lessons: [
          {
            title: 'Bài 2.1: Giới thiệu Redux Store và Reducers',
            content: 'Cài đặt và cấu hình Redux Toolkit.',
          },
          {
            title: 'Bài 2.2: Async Logic với Redux Thunks',
            content: 'Xử lý Fetch API với Redux.',
          },
        ],
      },
    ],
  },
  // KHÓA 4: Xây Dựng Ứng Dụng Tương Tác Cao với Vue.js 3 (SỬ DỤNG LOGIC MẶC ĐỊNH)
  {
    title: 'Xây Dựng Ứng Dụng Tương Tác Cao với Vue.js 3',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 30,
    price: 500000,
    originalPrice: 1000000,
    discount: 50,
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
    chapters: [
      {
        title: 'Chương 1: Composition API Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: setup() function và Reactivity',
            content: `Cơ chế phản ứng trong Vue 3 và Composition API.`,
          },
          {
            title: 'Bài 1.2: ref() và reactive()',
            content: 'Phân biệt và sử dụng hai hàm chính.',
          },
        ],
      },
      {
        title: 'Chương 2: State Management với Pinia',
        lessons: [
          {
            title: 'Bài 2.1: Thiết lập Pinia Store',
            content: 'Tạo Store và Actions trong Pinia.',
          },
          {
            title: 'Bài 2.2: Vue Router và Navigation Guards',
            content: 'Định tuyến và bảo vệ routes.',
          },
        ],
      },
    ],
  },
  // KHÓA 5: Lập Trình Web Cơ Bản: HTML5, CSS3 và JavaScript ES6 (SỬ DỤNG LOGIC MẶC ĐỊNH)
  {
    title: 'Lập Trình Web Cơ Bản: HTML5, CSS3 và JavaScript ES6',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Cơ Bản',
    duration: 3600 * 50,
    price: 500000,
    originalPrice: 1000000,
    discount: 50,
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
    chapters: [
      {
        title: 'Chương 1: HTML5 Semantic và Forms',
        lessons: [
          {
            title: 'Bài 1.1: Thẻ Semantic và Cấu trúc trang',
            content: `Tối ưu hóa cấu trúc website bằng HTML5.`,
          },
          {
            title: 'Bài 1.2: Biểu mẫu (Forms) và Accessibility',
            content: 'Tạo form và các thuộc tính hỗ trợ.',
          },
        ],
      },
      {
        title: 'Chương 2: CSS3 và Kỹ thuật Layout',
        lessons: [
          {
            title: 'Bài 2.1: Flexbox Masterclass',
            content: 'Nắm vững Flexbox để dàn trang.',
          },
          {
            title: 'Bài 2.2: Grid CSS và Thiết kế Responsive',
            content: 'Kết hợp Grid và Media Queries.',
          },
        ],
      },
    ],
  },
  // KHÓA 6: Fullstack Next.js 14 & Prisma: Xây Dựng Ứng Dụng E-commerce (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: Next.js App Router và Server Components',
        lessons: [
          {
            title: 'Bài 1.1: Khái niệm Server Components và Client Components',
            content: `Lập trình phía server và client với Next.js 14.`,
          },
          {
            title: 'Bài 1.2: Thiết kế Database Schema với Prisma',
            content: 'Cài đặt Prisma và định nghĩa models.',
          },
        ],
      },
      {
        title: 'Chương 2: Authentication và API Routes',
        lessons: [
          {
            title: 'Bài 2.1: Triển khai NextAuth cho Đăng nhập',
            content: 'Thực hiện xác thực người dùng.',
          },
          {
            title: 'Bài 2.2: Xây dựng CRUD API với Server Actions',
            content: 'Sử dụng Server Actions để tương tác với DB.',
          },
        ],
      },
    ],
  },
  // KHÓA 7: Thành Thạo TypeScript: Từ Zero đến Chuyên Sâu (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: TypeScript Cơ bản và Typing',
        lessons: [
          {
            title: 'Bài 1.1: Primitive Types và Type Inference',
            content: `Các kiểu dữ liệu cơ bản và khả năng suy luận kiểu.`,
          },
          {
            title: 'Bài 1.2: Interfaces và Type Aliases',
            content: 'Phân biệt và sử dụng Interfaces và Aliases.',
          },
        ],
      },
      {
        title: 'Chương 2: Generics và Advanced Types',
        lessons: [
          {
            title: 'Bài 2.1: Generics và Tái sử dụng Code',
            content: 'Áp dụng Generics để tạo các hàm và kiểu linh hoạt.',
          },
          {
            title: 'Bài 2.2: Utility Types và Conditional Types',
            content: 'Sử dụng các kiểu hỗ trợ như Partial, Readonly.',
          },
        ],
      },
    ],
  },
  // KHÓA 8: Xây Dựng API Hiệu Suất Cao với Go (Golang) và Gin Framework (SỬ DỤNG LOGIC MẶC ĐỊNH)
  {
    title: 'Xây Dựng API Hiệu Suất Cao với Go (Golang) và Gin Framework',
    categoryName: 'Lập Trình Web',
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
    chapters: [
      {
        title: 'Chương 1: Go Fundamentals và Concurrency',
        lessons: [
          {
            title: 'Bài 1.1: Go Syntax, Packages và Functions',
            content: `Cơ bản về cú pháp và cấu trúc dự án Go.`,
          },
          {
            title: 'Bài 1.2: Goroutines và Channels',
            content: 'Lập trình song song và đồng bộ hóa.',
          },
        ],
      },
      {
        title: 'Chương 2: RESTful API với Gin và GORM',
        lessons: [
          {
            title: 'Bài 2.1: Thiết lập Gin Router',
            content: 'Tạo các endpoint API cơ bản với Gin.',
          },
          {
            title: 'Bài 2.2: Kết nối Database và sử dụng GORM',
            content: 'Thực hiện các thao tác CRUD với PostgreSQL/MySQL.',
          },
        ],
      },
    ],
  },
  // KHÓA 9: Lập Trình Frontend Nâng Cao với Svelte và SvelteKit (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: Svelte Components và Reactivity',
        lessons: [
          {
            title: 'Bài 1.1: Định nghĩa Svelte Component và Scoped CSS',
            content: `Cấu trúc Component và cách Svelte xử lý CSS.`,
          },
          {
            title: 'Bài 1.2: Svelte Stores và Quản lý State',
            content: 'Sử dụng Svelte Stores để quản lý state toàn cục.',
          },
        ],
      },
      {
        title: 'Chương 2: SvelteKit và SSR',
        lessons: [
          {
            title: 'Bài 2.1: Khái niệm về SvelteKit và Routing',
            content: 'Cấu hình dự án SvelteKit và định tuyến.',
          },
          {
            title: 'Bài 2.2: Server-Side Rendering và Endpoints',
            content: 'Tận dụng SSR và tạo API Endpoints.',
          },
        ],
      },
    ],
  },
  // KHÓA 10: Lập Trình Web Socket Thời Gian Thực với Socket.IO và React (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: Cơ chế Web Socket và Socket.IO',
        lessons: [
          {
            title: 'Bài 1.1: Web Sockets vs REST API',
            content: `So sánh và ứng dụng thời gian thực.`,
          },
          {
            title: 'Bài 1.2: Thiết lập Server Socket.IO (Node/Express)',
            content: 'Tạo máy chủ Socket.IO.',
          },
        ],
      },
      {
        title: 'Chương 2: Tích hợp React Client',
        lessons: [
          {
            title: 'Bài 2.1: Kết nối Client Socket.IO trong React',
            content: 'Sử dụng useEffect để quản lý kết nối.',
          },
          {
            title: 'Bài 2.2: Xây dựng Chat Room cơ bản',
            content: 'Thực hiện gửi/nhận tin nhắn giữa nhiều người dùng.',
          },
        ],
      },
    ],
  },
  // KHÓA 11: Performance Optimization: Tối Ưu Hóa Tốc Độ Website Frontend (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: Đo lường và Core Web Vitals',
        lessons: [
          {
            title: 'Bài 1.1: Lighthouse và Phân tích hiệu suất',
            content: `Cách sử dụng công cụ Lighthouse và ý nghĩa của các chỉ số.`,
          },
          {
            title: 'Bài 1.2: Tối ưu hóa DOM và Rendering',
            content: 'Các kỹ thuật cải thiện Layout Shift và Painting.',
          },
        ],
      },
      {
        title: 'Chương 2: Tối ưu hóa Tài nguyên',
        lessons: [
          {
            title: 'Bài 2.1: Lazy Loading và Tối ưu hóa Hình ảnh',
            content: 'Kỹ thuật tải hình ảnh theo yêu cầu và WebP.',
          },
          {
            title: 'Bài 2.2: Code Splitting và Bundling',
            content: 'Sử dụng Webpack để tối ưu kích thước bundle.',
          },
        ],
      },
    ],
  },
  // KHÓA 12: Lập Trình Front-end Chuyên Sâu với Webpack và Bundling (SỬ DỤNG LOGIC MẶC ĐỊNH)
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
    chapters: [
      {
        title: 'Chương 1: Webpack Fundamentals và Cấu hình',
        lessons: [
          {
            title: 'Bài 1.1: Entry, Output và Loaders (Babel, CSS)',
            content: `Các thành phần cốt lõi của Webpack và cách xử lý các loại file.`,
          },
          {
            title: 'Bài 1.2: Plugins và Tối ưu hóa Assets',
            content: 'Sử dụng các Plugins phổ biến như HtmlWebpackPlugin.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỹ thuật Tối ưu hóa Performance',
        lessons: [
          {
            title: 'Bài 2.1: Code Splitting và Dynamic Imports',
            content: 'Kỹ thuật tách code để tải theo yêu cầu.',
          },
          {
            title: 'Bài 2.2: Tree Shaking, Minification và Production Build',
            content: 'Loại bỏ code chết và nén mã nguồn.',
          },
        ],
      },
    ],
  },
  // --- Nhóm Ứng dụng Server-side (Node.js/Express/NestJS) ---
  {
    title: 'Xây Dựng Backend API Chuyên Nghiệp với NestJS và PostgreSQL',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Văn Khải',
    level: 'Nâng Cao',
    duration: 3600 * 40,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ NestJS Framework, xây dựng các microservice hiệu suất cao, áp dụng các kiến trúc Microservices và Clean Architecture.',
    learnings: [
      'Thiết kế RESTful API và GraphQL API với NestJS',
      'Sử dụng TypeORM/Prisma để tương tác với PostgreSQL',
      'Triển khai Xác thực (JWT, Passport) và Authorization',
      'Viết Unit Test và E2E Test cho ứng dụng NestJS',
    ],
    requirements: ['Kinh nghiệm về TypeScript và Node.js cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Khái niệm và Kiến trúc NestJS',
        lessons: [
          {
            title: 'Bài 1.1: Modules, Providers và Controllers',
            content: 'Hiểu cấu trúc cơ bản của một ứng dụng NestJS.',
          },
          {
            title: 'Bài 1.2: Database Integration với TypeORM và Migration',
            content: 'Kết nối và quản lý schema database.',
          },
        ],
      },
      {
        title: 'Chương 2: Xác thực và Bảo mật',
        lessons: [
          {
            title: 'Bài 2.1: Triển khai Authentication (JWT Strategy)',
            content: 'Sử dụng PassportJS để xác thực người dùng.',
          },
          {
            title: 'Bài 2.2: Guards, Interceptors và Pipes',
            content: 'Xử lý các logic toàn cục và validation.',
          },
        ],
      },
    ],
  },
  {
    title: 'Node.js & Express: Xây Dựng Hệ Thống Blog Fullstack (MongoDB)',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Văn Khải',
    level: 'Trung Cấp',
    duration: 3600 * 35,
    price: 999000,
    originalPrice: 1500000,
    discount: 33,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng API và tích hợp Frontend đơn giản bằng Node.js, Express và MongoDB (Mongoose).',
    learnings: [
      'Cấu hình Node.js Server và Express Routing',
      'Quản lý cơ sở dữ liệu NoSQL với MongoDB và Mongoose',
      'Xử lý file upload và Session Management',
      'Thiết kế API theo chuẩn RESTful',
    ],
    requirements: ['Kiến thức về JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Setup MERN Stack và Express Routing',
        lessons: [
          {
            title: 'Bài 1.1: Cấu hình Express Server và Middleware',
            content: 'Khởi tạo project và sử dụng các middleware.',
          },
          {
            title: 'Bài 1.2: Kết nối MongoDB với Mongoose',
            content: 'Định nghĩa schema và models.',
          },
        ],
      },
      {
        title: 'Chương 2: Xử lý CRUD và Authentication',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng các Endpoint CRUD cho bài viết',
            content: 'Thực hiện các thao tác Create, Read, Update, Delete.',
          },
          {
            title: 'Bài 2.2: Triển khai Đăng nhập/Đăng ký cơ bản',
            content: 'Sử dụng JWT để xác thực.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình Microservices với Node.js, Kafka và Docker',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Thị Mai',
    level: 'Nâng Cao',
    duration: 3600 * 55,
    price: 2499000,
    originalPrice: 3500000,
    discount: 28,
    discountExpiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    description:
      'Nắm vững kiến trúc Microservices, sử dụng Node.js để xây dựng các dịch vụ độc lập và giao tiếp bất đồng bộ qua Kafka.',
    learnings: [
      'Thiết kế kiến trúc Microservices',
      'Sử dụng Docker và Docker Compose để container hóa',
      'Triển khai Message Queueing với Apache Kafka',
      'Service Discovery và Gateway API',
    ],
    requirements: ['Kinh nghiệm lập trình Backend với Node.js'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu Microservices và Docker',
        lessons: [
          {
            title: 'Bài 1.1: Dockerfile và Docker Compose cho Node.js',
            content: 'Đóng gói ứng dụng thành container.',
          },
          {
            title: 'Bài 1.2: Định nghĩa ranh giới dịch vụ',
            content: 'Cách chia ứng dụng lớn thành các dịch vụ nhỏ.',
          },
        ],
      },
      {
        title: 'Chương 2: Giao tiếp Bất đồng bộ với Kafka',
        lessons: [
          {
            title: 'Bài 2.1: Cài đặt và cấu hình Kafka Producer/Consumer',
            content: 'Gửi và nhận tin nhắn giữa các microservice.',
          },
          {
            title: 'Bài 2.2: Xử lý Idempotency và Dead Letter Queues',
            content: 'Đảm bảo tính nhất quán của dữ liệu.',
          },
        ],
      },
    ],
  },

  // --- Nhóm Lập trình Frontend Chuyên sâu (React/Angular/State Management) ---
  {
    title: 'Chuyên Sâu React Performance Optimization và Best Practices',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description:
      'Tối ưu hóa tốc độ và hiệu năng của ứng dụng React, áp dụng các kỹ thuật memoization, virtualized list và lazy loading.',
    learnings: [
      'Sử dụng useMemo, useCallback, React.memo đúng cách',
      'Phân tích hiệu suất với React Profiler và Lighthouse',
      'Kỹ thuật Code Splitting và Lazy Loading Component',
      'Sử dụng Virtualized List cho dữ liệu lớn',
    ],
    requirements: ['Kinh nghiệm vững về React Hooks'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Đo lường và Phân tích Render',
        lessons: [
          {
            title: 'Bài 1.1: Giới thiệu React Profiler',
            content: 'Tìm kiếm các Component bị re-render không cần thiết.',
          },
          {
            title: 'Bài 1.2: Khắc phục Prop Changes và Context Re-renders',
            content: 'Xử lý các nguyên nhân gây ra rendering thừa.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỹ thuật Tối ưu hóa Bộ nhớ và Tốc độ',
        lessons: [
          {
            title: 'Bài 2.1: Tối ưu hóa Custom Hooks và Dependency Array',
            content: 'Đảm bảo Hooks chỉ chạy khi cần.',
          },
          {
            title: 'Bài 2.2: Dynamic Import và React.lazy',
            content: 'Giảm kích thước bundle ban đầu.',
          },
        ],
      },
    ],
  },
  {
    title: 'Angular 17 Toàn Diện: Signals, Standalone Components và NgRx',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 45,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    description:
      'Học Angular mới nhất (v17+), tập trung vào kiến trúc hiện đại với Standalone Components, sử dụng Signals và quản lý State bằng NgRx.',
    learnings: [
      'Làm việc với Standalone Components và Component-based architecture',
      'Sử dụng Angular Signals để quản lý reactivity',
      'Quản lý State theo kiến trúc Redux với NgRx',
      'Form Handling (Reactive Forms) và Validation',
    ],
    requirements: ['Kiến thức cơ bản về TypeScript'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Angular Modern Architecture',
        lessons: [
          {
            title: 'Bài 1.1: Giới thiệu Standalone Components',
            content: 'Xây dựng ứng dụng không cần NgModule.',
          },
          {
            title: 'Bài 1.2: Angular Signals và State Reactivity',
            content: 'Thay thế Observable/Zone.js cho state đơn giản.',
          },
        ],
      },
      {
        title: 'Chương 2: State Management NgRx',
        lessons: [
          {
            title: 'Bài 2.1: NgRx Store, Reducers, Actions và Selectors',
            content: 'Cài đặt và hiểu luồng dữ liệu NgRx.',
          },
          {
            title: 'Bài 2.2: Xử lý Side Effects với NgRx Effects',
            content: 'Thực hiện các tác vụ bất đồng bộ.',
          },
        ],
      },
    ],
  },
  {
    title: 'Quản Lý State Cấp Độ Doanh Nghiệp: Zustand, Jotai và Recoil',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1199000,
    originalPrice: 1800000,
    discount: 33,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Nghiên cứu các thư viện State Management hiện đại, nhẹ và phân tán (decentralized), tối ưu cho hiệu suất và trải nghiệm nhà phát triển (DX).',
    learnings: [
      'Thiết kế State với Zustand (Custom Hooks pattern)',
      'Sử dụng Jotai và Recoil (Atomic State)',
      'So sánh hiệu suất và use case giữa các thư viện',
      'Tích hợp State Management với TypeScript',
    ],
    requirements: ['Thành thạo React và Custom Hooks'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Zustand: Hooks-based State Management',
        lessons: [
          {
            title: 'Bài 1.1: Tạo Store và Selectors trong Zustand',
            content: 'Thiết lập Zustand Store và truy cập state.',
          },
          {
            title: 'Bài 1.2: Middleware và Persistent State',
            content: 'Lưu trữ state vào Local Storage.',
          },
        ],
      },
      {
        title: 'Chương 2: Atomic State: Jotai và Recoil',
        lessons: [
          {
            title: 'Bài 2.1: Khái niệm Atoms và Selectors',
            content: 'Sử dụng các state nhỏ, độc lập (Atoms).',
          },
          {
            title: 'Bài 2.2: Tích hợp Async Data Fetching',
            content: 'Xử lý các tác vụ bất đồng bộ với atomic state.',
          },
        ],
      },
    ],
  },

  // --- Nhóm Công cụ và Kỹ thuật Chung (DevOps/Testing/Security) ---
  {
    title: 'Frontend Unit Testing Chuyên Sâu với Jest và React Testing Library',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 28,
    price: 1099000,
    originalPrice: 1500000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các kỹ thuật Unit Testing và Integration Testing cho các ứng dụng React, đảm bảo chất lượng code và giảm thiểu lỗi trong quá trình phát triển.',
    learnings: [
      'Thiết lập Jest và React Testing Library (RTL)',
      'Mô phỏng (Mocking) Hooks, Modules và API Calls',
      'Viết test hiệu quả theo hướng người dùng (User-centric testing)',
      'Tạo Code Coverage Report và CI/CD Integration',
    ],
    requirements: ['Kinh nghiệm về React và JavaScript'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Testing với Jest',
        lessons: [
          {
            title: 'Bài 1.1: Matchers, Setup và Teardown',
            content: 'Các hàm so sánh và quản lý môi trường test.',
          },
          {
            title: 'Bài 1.2: Mocking Functions và Modules',
            content: 'Tạo các hàm giả để kiểm tra.',
          },
        ],
      },
      {
        title: 'Chương 2: Testing React Components với RTL',
        lessons: [
          {
            title: 'Bài 2.1: Querying Elements và User Events',
            content: 'Tìm kiếm phần tử và mô phỏng tương tác người dùng.',
          },
          {
            title: 'Bài 2.2: Testing Custom Hooks và Context',
            content: 'Kiểm tra các logic phức tạp trong Hooks.',
          },
        ],
      },
    ],
  },
  {
    title: 'DevOps cho Web Developers: CI/CD với GitHub Actions và AWS/Vercel',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Thị Mai',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 1699000,
    originalPrice: 2300000,
    discount: 26,
    discountExpiresAt: null,
    description:
      'Tự động hóa quy trình phát triển và triển khai (CI/CD) cho cả Frontend và Backend, sử dụng GitHub Actions, Docker và các nền tảng Cloud (AWS, Vercel).',
    learnings: [
      'Cấu hình CI/CD Pipeline với GitHub Actions',
      'Triển khai ứng dụng Frontend lên Vercel/Netlify tự động',
      'Đóng gói Backend (Node/Python) bằng Docker và triển khai lên AWS EC2/ECS',
      'Quản lý môi trường (Staging/Production)',
    ],
    requirements: ['Kiến thức cơ bản về Linux và Git'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu và GitHub Actions',
        lessons: [
          {
            title: 'Bài 1.1: Jobs, Steps và Workflows',
            content: 'Cấu trúc file YAML cho GitHub Actions.',
          },
          {
            title: 'Bài 1.2: Tích hợp Testing và Linting vào CI',
            content: 'Tự động chạy kiểm tra chất lượng code.',
          },
        ],
      },
      {
        title: 'Chương 2: Triển khai liên tục (CD)',
        lessons: [
          {
            title: 'Bài 2.1: Triển khai Frontend lên Vercel/Netlify',
            content: 'Cấu hình biến môi trường và Domain.',
          },
          {
            title: 'Bài 2.2: Sử dụng Docker để triển khai lên AWS',
            content: 'Đẩy Image lên Docker Hub và kéo về server.',
          },
        ],
      },
    ],
  },
  {
    title: 'Bảo Mật Web Toàn Diện: OWASP Top 10 và Phòng Chống Tấn Công',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Văn Khải',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1599000,
    originalPrice: 2000000,
    discount: 20,
    discountExpiresAt: null,
    description:
      'Học cách xác định, ngăn chặn và khắc phục các lỗ hổng bảo mật phổ biến nhất theo danh sách OWASP Top 10 trong các ứng dụng web.',
    learnings: [
      'Ngăn chặn XSS (Cross-Site Scripting) và CSRF (Cross-Site Request Forgery)',
      'Phòng chống SQL Injection và NoSQL Injection',
      'Xử lý Authentication và Session Management an toàn',
      'Cấu hình HTTP Headers và Content Security Policy (CSP)',
    ],
    requirements: ['Kinh nghiệm lập trình Backend (Node.js/PHP/Java)'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Lỗ hổng Injection và Data Exposure',
        lessons: [
          {
            title: 'Bài 1.1: Phòng chống SQL Injection và Parameterization',
            content: 'Sử dụng Prepared Statements.',
          },
          {
            title: 'Bài 1.2: Bảo mật Data At Rest và Data In Transit',
            content: 'Mã hóa dữ liệu và sử dụng HTTPS.',
          },
        ],
      },
      {
        title: 'Chương 2: Lỗ hổng Client-side và Authentication',
        lessons: [
          {
            title: 'Bài 2.1: Ngăn chặn XSS và CSRF',
            content: 'Sử dụng các thư viện bảo mật và tokens.',
          },
          {
            title: 'Bài 2.2: Best Practices cho Password Hashing và JWT',
            content: 'Lưu trữ mật khẩu và quản lý tokens an toàn.',
          },
        ],
      },
    ],
  },

  // --- Nhóm Lập trình Khác (GrapthQL/WebAssembly) ---
  {
    title:
      'Mastering GraphQL: Xây Dựng API Hiệu Quả với Apollo Server và Client',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 32,
    price: 1699000,
    originalPrice: 2500000,
    discount: 32,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Chuyển từ RESTful API sang kiến trúc GraphQL, sử dụng Apollo Server (Node.js) và Apollo Client (React) để xây dựng API linh hoạt và tối ưu.',
    learnings: [
      'Thiết kế Schema GraphQL (Types, Queries, Mutations)',
      'Xây dựng Resolvers và Data Loaders để tối ưu hóa truy vấn DB (N+1 problem)',
      'Tích hợp Apollo Client vào React và State Management',
      'Xử lý Authentication và Bảo mật trong GraphQL',
    ],
    requirements: ['Kinh nghiệm lập trình Backend và Frontend'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: GraphQL Core Concepts',
        lessons: [
          {
            title: 'Bài 1.1: So sánh GraphQL vs REST và ưu điểm',
            content: 'Khi nào nên sử dụng GraphQL.',
          },
          {
            title: 'Bài 1.2: Thiết kế Schema (Type Definitions)',
            content: 'Định nghĩa các kiểu dữ liệu và quan hệ.',
          },
        ],
      },
      {
        title: 'Chương 2: Apollo Server và Data Flow',
        lessons: [
          {
            title: 'Bài 2.1: Viết Resolvers và Data Sources',
            content: 'Logic lấy dữ liệu từ cơ sở dữ liệu.',
          },
          {
            title: 'Bài 2.2: Tích hợp Apollo Client vào Frontend',
            content: 'Thực hiện Queries và Mutations từ React.',
          },
        ],
      },
    ],
  },

  // --- 10 Khóa học bổ sung khác ---
  {
    title: 'Lập Trình Web Cơ Bản: Thiết Kế Responsive với Tailwind CSS',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Cơ Bản',
    duration: 3600 * 20,
    price: 699000,
    originalPrice: 1000000,
    discount: 30,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng giao diện người dùng hiện đại, đẹp mắt và responsive nhanh chóng với framework CSS Utility-first phổ biến nhất: Tailwind CSS.',
    learnings: [
      'Cơ bản về Utility-first CSS và Tailwind setup',
      'Thiết kế Responsive và Mobile-first',
      'Sử dụng các class layout (Flexbox, Grid) của Tailwind',
      'Tối ưu hóa Production Build (Purge CSS)',
    ],
    requirements: ['Kiến thức cơ bản về HTML và CSS'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Tailwind CSS Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: Cài đặt và Cấu hình Tailwind',
            content: 'Thiết lập môi trường cho dự án.',
          },
          {
            title: 'Bài 1.2: Layout và Styling cơ bản',
            content: 'Sử dụng các class phổ biến (margin, padding, color).',
          },
        ],
      },
      {
        title: 'Chương 2: Responsive và Component-based Design',
        lessons: [
          {
            title: 'Bài 2.1: Responsive Design và Breakpoints',
            content: 'Thiết kế cho các kích thước màn hình khác nhau.',
          },
          {
            title: 'Bài 2.2: Xây dựng Custom Utility và Components',
            content: 'Tạo các thành phần tái sử dụng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Giao Diện (UI/UX) cho Web Developers: Figma và Nguyên lý',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học dành cho lập trình viên muốn tự mình thiết kế giao diện thân thiện, tuân thủ các nguyên tắc UI/UX cơ bản bằng công cụ Figma.',
    learnings: [
      'Nguyên lý cơ bản của UI/UX (Hierarchy, Alignment, Color Theory)',
      'Sử dụng Figma để tạo Mockup và Prototype',
      'Thiết kế Design System và Component Library',
      'Chuyển từ Design sang Code (Design Handoff)',
    ],
    requirements: ['Không yêu cầu kinh nghiệm thiết kế'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nguyên lý Thiết kế Cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Typography và Color Theory',
            content: 'Lựa chọn font chữ và bảng màu phù hợp.',
          },
          {
            title: 'Bài 1.2: Sử dụng Figma cơ bản',
            content: 'Các công cụ vẽ và tạo khung.',
          },
        ],
      },
      {
        title: 'Chương 2: Thiết kế Hệ thống và Prototype',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng Components và Variants',
            content: 'Tạo các thành phần UI có thể tái sử dụng.',
          },
          {
            title: 'Bài 2.2: Tạo Prototype (Flow) và Handoff',
            content: 'Thiết kế luồng tương tác và chuẩn bị cho lập trình.',
          },
        ],
      },
    ],
  },
  {
    title: 'Next.js API Routes và Serverless Functions Chuyên sâu',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 22,
    price: 1399000,
    originalPrice: 1999000,
    discount: 30,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Đi sâu vào khả năng Backend của Next.js (hoặc các nền tảng Serverless khác), học cách tạo API endpoints, xử lý database và tích hợp bên thứ ba.',
    learnings: [
      'Sử dụng Next.js API Routes (hoặc Serverless Functions) hiệu quả',
      'Xử lý Authentication và Authorization trong Serverless',
      'Kết nối và truy vấn các cơ sở dữ liệu NoSQL/SQL',
      'Tối ưu hóa Cold Start và Performance',
    ],
    requirements: ['Kinh nghiệm cơ bản với Next.js'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: API Routes Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: Định nghĩa API Routes và Middleware',
            content: 'Xây dựng các endpoint cơ bản.',
          },
          {
            title: 'Bài 1.2: Xử lý Request, Response và Body Parsing',
            content: 'Lấy dữ liệu từ client.',
          },
        ],
      },
      {
        title: 'Chương 2: Tích hợp Database và Bảo mật',
        lessons: [
          {
            title: 'Bài 2.1: Kết nối và truy vấn MongoDB/Prisma',
            content: 'Thực hiện thao tác database trong Serverless.',
          },
          {
            title: 'Bài 2.2: Quản lý Secrets và Environment Variables',
            content: 'Bảo mật các thông tin nhạy cảm.',
          },
        ],
      },
    ],
  },
  {
    title: 'Vue 3 Ecosystem: NuxtJS 3 và SSR/SSG',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 38,
    price: 1899000,
    originalPrice: 2600000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ NuxtJS 3 (framework dựa trên Vue 3), xây dựng các ứng dụng đa chế độ (SSR, SSG, SPA) tối ưu cho SEO và hiệu suất.',
    learnings: [
      'Cấu hình Nuxt 3 và Folder Structure',
      'Triển khai Server-Side Rendering (SSR) và Static Site Generation (SSG)',
      'Sử dụng Nuxt Hooks và Modules',
      'Tích hợp Pinia và VueUse',
    ],
    requirements: ['Kinh nghiệm về Vue.js 3'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nuxt 3 Fundamentals và Rendering Modes',
        lessons: [
          {
            title: 'Bài 1.1: SSR, SSG, SPA trong Nuxt 3',
            content: 'Phân biệt các chế độ render và khi nào sử dụng.',
          },
          {
            title: 'Bài 1.2: Data Fetching và useFetch/useAsyncData',
            content: 'Lấy dữ liệu trong Nuxt Components.',
          },
        ],
      },
      {
        title: 'Chương 2: Routing, Middleware và Plugins',
        lessons: [
          {
            title: 'Bài 2.1: Tự động hóa Routing và Route Middleware',
            content: 'Quản lý đường dẫn và bảo vệ route.',
          },
          {
            title: 'Bài 2.2: Tích hợp thư viện bên ngoài qua Nuxt Plugins',
            content: 'Thêm các thư viện như Pinia hoặc VueUse.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Website Đơn Giản với Webflow và No-Code/Low-Code',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 10,
    price: 599000,
    originalPrice: 800000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng các landing page, portfolio hoặc website doanh nghiệp nhỏ nhanh chóng mà không cần viết code bằng nền tảng Webflow.',
    learnings: [
      'Cơ bản về Webflow Editor và Visual Coding',
      'Xây dựng Layout Responsive và Animations',
      'Quản lý nội dung động (CMS) của Webflow',
      'Xuất bản và Hosting Website',
    ],
    requirements: ['Không yêu cầu kinh nghiệm lập trình'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu Webflow Editor',
        lessons: [
          {
            title: 'Bài 1.1: Box Model và Flex/Grid trong Webflow',
            content: 'Hiểu cách các khối được sắp xếp.',
          },
          {
            title: 'Bài 1.2: Tạo Component và Styles',
            content: 'Thiết lập các phần tử tái sử dụng.',
          },
        ],
      },
      {
        title: 'Chương 2: Tương tác và Xuất bản',
        lessons: [
          {
            title: 'Bài 2.1: Webflow Interactions (Animations)',
            content: 'Thêm các hiệu ứng động.',
          },
          {
            title: 'Bài 2.2: Xây dựng Blog với Webflow CMS',
            content: 'Quản lý dữ liệu động.',
          },
        ],
      },
    ],
  },
  {
    title: 'Advanced CSS: SASS, LESS, BEM và CSS Modules',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Văn Khải',
    level: 'Trung Cấp',
    duration: 3600 * 18,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học tập trung vào việc quản lý CSS trong các dự án lớn, sử dụng các công cụ tiền xử lý (SASS, LESS) và các quy tắc đặt tên (BEM) để code dễ bảo trì hơn.',
    learnings: [
      'Sử dụng SASS/LESS (Variables, Mixins, Nesting)',
      'Áp dụng quy tắc đặt tên BEM (Block, Element, Modifier)',
      'Sử dụng CSS Modules và Styled Components trong React',
      'Thiết kế CSS Architecture (ITCSS, 7-1 pattern)',
    ],
    requirements: ['Kiến thức vững về CSS3'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Pre-processors và BEM',
        lessons: [
          {
            title: 'Bài 1.1: SASS/LESS Features',
            content: 'Cú pháp và cách compile SASS/LESS.',
          },
          {
            title: 'Bài 1.2: Áp dụng BEM vào dự án thực tế',
            content: 'Quy tắc đặt tên để tránh xung đột.',
          },
        ],
      },
      {
        title: 'Chương 2: CSS trong Component-based Architecture',
        lessons: [
          {
            title: 'Bài 2.1: CSS Modules và Scoped Styles',
            content: 'Cách CSS được đóng gói cho từng component.',
          },
          {
            title: 'Bài 2.2: Giới thiệu CSS-in-JS (Styled Components)',
            content: 'Viết CSS trực tiếp trong file JavaScript.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình Tương Tác: Canvas, WebGL và Three.js',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2299000,
    originalPrice: 3000000,
    discount: 23,
    discountExpiresAt: null,
    description:
      'Học cách tạo đồ họa 2D/3D và các hiệu ứng tương tác cao cấp trực tiếp trên trình duyệt, sử dụng Canvas API, WebGL và thư viện Three.js.',
    learnings: [
      'Cơ bản về Canvas 2D API (vẽ, hình ảnh, animation)',
      'Giới thiệu WebGL và Graphics Pipeline',
      'Sử dụng Three.js để tạo các cảnh 3D',
      'Tích hợp WebGL với React (React Three Fiber)',
    ],
    requirements: ['Thành thạo JavaScript và Toán học cơ bản (Vector, Matrix)'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Canvas 2D và Animation',
        lessons: [
          {
            title: 'Bài 1.1: Vẽ primitives và Images',
            content: 'Sử dụng các hàm cơ bản của Canvas.',
          },
          {
            title: 'Bài 1.2: Animation Loop và Tương tác',
            content: 'Tạo các chuyển động mượt mà.',
          },
        ],
      },
      {
        title: 'Chương 2: Three.js và 3D Graphics',
        lessons: [
          {
            title: 'Bài 2.1: Scene, Camera và Renderer',
            content: 'Các thành phần cốt lõi của cảnh 3D.',
          },
          {
            title: 'Bài 2.2: Tạo vật thể, vật liệu và ánh sáng',
            content: 'Thiết kế đối tượng 3D.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế API-First với OpenAPI (Swagger) và Tự động sinh Code',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Thị Mai',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 2000000,
    discount: 30,
    discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description:
      'Học cách thiết kế API từ đầu (API-First), sử dụng tiêu chuẩn OpenAPI (Swagger) để định nghĩa API, từ đó tự động sinh ra documentation, client và server stubs.',
    learnings: [
      'Nguyên tắc của API-First Design',
      'Viết tài liệu API bằng OpenAPI/Swagger YAML/JSON',
      'Sử dụng Swagger UI và Swagger Editor',
      'Tự động sinh Client Code (JS/TS) từ OpenAPI Spec',
    ],
    requirements: ['Kinh nghiệm thiết kế RESTful API'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: OpenAPI/Swagger Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: Cấu trúc OpenAPI Document',
            content: 'Info, Servers, Paths và Components.',
          },
          {
            title: 'Bài 1.2: Định nghĩa Schema và Response',
            content: 'Xác định kiểu dữ liệu và đầu ra API.',
          },
        ],
      },
      {
        title: 'Chương 2: Code Generation và Workflow',
        lessons: [
          {
            title: 'Bài 2.1: Sử dụng Swagger UI và Editor',
            content: 'Trực quan hóa tài liệu API.',
          },
          {
            title: 'Bài 2.2: Tự động sinh Client và Server Stubs',
            content: 'Giảm thiểu công việc viết code thủ công.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tối Ưu Hóa SEO cho Ứng Dụng Web (Next.js/Nuxt.js)',
    categoryName: 'Lập Trình Web',
    instructorName: 'Phan Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Học các kỹ thuật On-page và Off-page SEO dành cho lập trình viên, đặc biệt cho các ứng dụng sử dụng Server-Side Rendering (SSR) như Next.js hoặc Nuxt.js.',
    learnings: [
      'Nguyên tắc hoạt động của Search Engine Crawlers',
      'Tối ưu hóa Meta Tags (Title, Description) và Social Sharing (Open Graph)',
      'Sử dụng Structured Data (Schema.org)',
      'Tối ưu hóa Tốc độ Tải trang (Core Web Vitals)',
    ],
    requirements: ['Kinh nghiệm cơ bản về Frontend Development'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cơ bản về Technical SEO',
        lessons: [
          {
            title: 'Bài 1.1: SEO cho SPA vs SSR',
            content: 'Lý do SSR cần thiết cho SEO.',
          },
          {
            title: 'Bài 1.2: Tối ưu hóa Meta Tags và Canonical URL',
            content: 'Đảm bảo nội dung được lập chỉ mục đúng.',
          },
        ],
      },
      {
        title: 'Chương 2: Cải thiện Trải nghiệm Người Dùng và Indexing',
        lessons: [
          {
            title: 'Bài 2.1: Sử dụng Schema Markup (Structured Data)',
            content: 'Giúp Search Engine hiểu nội dung tốt hơn.',
          },
          {
            title:
              'Bài 2.2: Tối ưu hóa Tốc độ bằng Lazy Loading và Code Splitting',
            content: 'Cải thiện Core Web Vitals.',
          },
        ],
      },
    ],
  },
  {
    title: 'Web Components: Xây Dựng Thư Viện UI Độc Lập cho Mọi Framework',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 1900000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ công nghệ Web Components gốc (Custom Elements, Shadow DOM, HTML Templates) để tạo ra các thành phần UI hoạt động trên bất kỳ Framework nào (React, Vue, Angular).',
    learnings: [
      'Cơ bản về Custom Elements và Shadow DOM',
      'Xử lý State và Events trong Web Components',
      'Sử dụng Lit Element hoặc StencilJS để tăng tốc phát triển',
      'Tích hợp Web Components vào các dự án React/Vue',
    ],
    requirements: ['Thành thạo JavaScript ES6+'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Native Web Components',
        lessons: [
          {
            title: 'Bài 1.1: Shadow DOM và Style Scoping',
            content: 'Đảm bảo CSS không bị rò rỉ.',
          },
          {
            title: 'Bài 1.2: Custom Elements và Lifecycle Callbacks',
            content: 'Định nghĩa thẻ HTML tùy chỉnh.',
          },
        ],
      },
      {
        title: 'Chương 2: Công cụ hỗ trợ và Tích hợp',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng với Lit Element (Hoặc StencilJS)',
            content: 'Sử dụng thư viện để đơn giản hóa quá trình.',
          },
          {
            title: 'Bài 2.2: Sử dụng Web Components trong React và Vue',
            content: 'Đảm bảo tương thích giữa các hệ sinh thái.',
          },
        ],
      },
    ],
  },
  {
    title: 'Micro Frontends: Kiến Trúc Ứng Dụng Web Lớn và Mở Rộng',
    categoryName: 'Lập Trình Web',
    instructorName: 'Lê Văn Khải',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 1799000,
    originalPrice: 2500000,
    discount: 28,
    discountExpiresAt: null,
    description:
      'Học cách chia ứng dụng Frontend lớn thành các ứng dụng nhỏ độc lập, sử dụng các kỹ thuật như Module Federation (Webpack) hoặc Single-SPA để quản lý phức tạp và cho phép nhóm phát triển tự chủ.',
    learnings: [
      'Nguyên tắc và lợi ích của Micro Frontends',
      'Các chiến lược phân chia (Route, Composition, Widget)',
      'Sử dụng Webpack Module Federation',
      'Giao tiếp và Quản lý State giữa các Micro Frontend',
    ],
    requirements: ['Kinh nghiệm phát triển Frontend với ít nhất một Framework'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu Kiến trúc Micro Frontends',
        lessons: [
          {
            title: 'Bài 1.1: Micro Frontends vs Monolith Frontend',
            content: 'So sánh ưu và nhược điểm.',
          },
          {
            title:
              'Bài 1.2: Các kỹ thuật tích hợp (Iframe, Web Components, Module Federation)',
            content: 'Các phương pháp kết hợp các ứng dụng nhỏ.',
          },
        ],
      },
      {
        title: 'Chương 2: Triển khai với Module Federation',
        lessons: [
          {
            title: 'Bài 2.1: Cấu hình Webpack Module Federation',
            content: 'Chia sẻ code và components giữa các ứng dụng.',
          },
          {
            title: 'Bài 2.2: Vấn đề Styling và State Sharing',
            content: 'Giải quyết các thách thức chung.',
          },
        ],
      },
    ],
  },
  {
    title: 'Advanced Git Workflow: Gitflow, Monorepo và Tái cấu trúc lịch sử',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 12,
    price: 799000,
    originalPrice: 1000000,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các quy trình làm việc nâng cao với Git, bao gồm Gitflow, Monorepo (Nx, Turborepo) và các lệnh Git mạnh mẽ (rebase, cherry-pick, reflog).',
    learnings: [
      'Áp dụng mô hình Gitflow và GitHub Flow',
      'Tái cấu trúc lịch sử Git bằng rebase và amend',
      'Sử dụng Monorepo Tools (Nx/Turborepo) cho dự án lớn',
      'Giải quyết các xung đột phức tạp và khôi phục code',
    ],
    requirements: ['Kinh nghiệm cơ bản về Git và GitHub'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Các Mô hình Workflow',
        lessons: [
          {
            title: 'Bài 1.1: Gitflow vs Trunk-based Development',
            content: 'Lựa chọn mô hình phù hợp cho dự án.',
          },
          {
            title: 'Bài 1.2: Git Rebase, Squashing và Interactive Mode',
            content: 'Làm sạch lịch sử commit.',
          },
        ],
      },
      {
        title: 'Chương 2: Monorepo và Quản lý Dự án Lớn',
        lessons: [
          {
            title: 'Bài 2.1: Giới thiệu Monorepo và Nx/Turborepo',
            content: 'Lợi ích của việc đặt nhiều dự án trong một repo.',
          },
          {
            title: 'Bài 2.2: Tích hợp CI/CD trong Monorepo',
            content: 'Xây dựng và kiểm tra chỉ những gì thay đổi.',
          },
        ],
      },
    ],
  },
  {
    title: 'Next.js & Supabase: Xây Dựng Ứng Dụng Realtime Fullstack',
    categoryName: 'Lập Trình Web',
    instructorName: 'Nguyễn Văn An',
    level: 'Trung Cấp',
    duration: 3600 * 30,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Kết hợp Next.js (App Router) với Supabase (hậu duệ mã nguồn mở của Firebase) để xây dựng ứng dụng Fullstack hoàn chỉnh với Realtime Database và Authentication.',
    learnings: [
      'Cấu hình Supabase (PostgreSQL, Authentication, Storage)',
      'Sử dụng Next.js App Router với Supabase Client',
      'Triển khai Realtime Subscriptions và RLS (Row Level Security)',
      'Xây dựng các chức năng CRUD và File Storage',
    ],
    requirements: ['Kinh nghiệm cơ bản với Next.js và React'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Supabase Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: Setup Supabase Project và Database Schema',
            content: 'Thiết lập cơ sở dữ liệu PostgreSQL.',
          },
          {
            title: 'Bài 1.2: Triển khai Supabase Auth và Policies (RLS)',
            content: 'Quản lý quyền truy cập an toàn.',
          },
        ],
      },
      {
        title: 'Chương 2: Realtime và Next.js Integration',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng CRUD API trong Next.js (Server Actions)',
            content: 'Thực hiện thao tác dữ liệu.',
          },
          {
            title: 'Bài 2.2: Realtime Subscriptions cho dữ liệu',
            content: 'Cập nhật giao diện người dùng theo thời gian thực.',
          },
        ],
      },
    ],
  },
  {
    title: 'Cơ Bản về Web Accessibility (A11Y) cho Frontend Developers',
    categoryName: 'Lập Trình Web',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 12,
    price: 799000,
    originalPrice: 1000000,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học tập trung vào việc làm cho các ứng dụng web có thể truy cập được đối với người khuyết tật, tuân thủ các nguyên tắc WCAG và sử dụng ARIA Roles.',
    learnings: [
      'Nguyên tắc WCAG và luật pháp liên quan (A11Y)',
      'Sử dụng Semantic HTML và ARIA Roles',
      'Tối ưu hóa Keyboard Navigation và Focus Management',
      'Kiểm tra Accessibility bằng Lighthouse và Screen Readers',
    ],
    requirements: ['Kiến thức cơ bản về HTML và CSS'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu và Semantic HTML',
        lessons: [
          {
            title: 'Bài 1.1: Tầm quan trọng của Web Accessibility',
            content: 'Tại sao cần quan tâm đến A11Y.',
          },
          {
            title: 'Bài 1.2: Sử dụng các thẻ HTML có ý nghĩa (Semantic)',
            content: 'Cải thiện cấu trúc trang.',
          },
        ],
      },
      {
        title: 'Chương 2: ARIA và Tương tác',
        lessons: [
          {
            title: 'Bài 2.1: ARIA Roles, States và Properties',
            content: 'Cung cấp ngữ cảnh cho Screen Readers.',
          },
          {
            title: 'Bài 2.2: Keyboard Navigation và Focus Trap',
            content: 'Đảm bảo người dùng có thể điều hướng bằng bàn phím.',
          },
        ],
      },
    ],
  },
  // -----------------------2-------------------------------
  {
    title: 'Masterclass Lập Trình Backend với Node.js & Express',
    categoryName: 'Lập Trình Web',
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
    chapters: [
      {
        title: 'Chương 1: Nền tảng Node.js và Express',
        lessons: [
          {
            title: 'Bài 1.1: Giới thiệu Node.js, V8 Engine và Non-blocking I/O',
            content: 'Tìm hiểu về cơ chế hoạt động bất đồng bộ của Node.js.',
          },
          {
            title: 'Bài 1.2: Thiết lập Express Server và Routing cơ bản',
            content:
              'Cấu hình dự án và định nghĩa các tuyến đường (routes) API.',
          },
          {
            title: 'Bài 1.3: Sử dụng Express Middleware và Error Handling',
            content:
              'Áp dụng các hàm middleware (như body-parser, morgan) và cách quản lý lỗi tập trung.',
          },
        ],
      },
      {
        title: 'Chương 2: Quản lý Dữ liệu với MongoDB và Mongoose',
        lessons: [
          {
            title: 'Bài 2.1: Kết nối MongoDB và Thiết kế Mongoose Schema/Model',
            content:
              'Làm quen với cơ sở dữ liệu NoSQL và cách định nghĩa cấu trúc dữ liệu.',
          },
          {
            title:
              'Bài 2.2: Triển khai các Thao tác CRUD (Create, Read, Update, Delete)',
            content: 'Xây dựng các controller để tương tác với cơ sở dữ liệu.',
          },
          {
            title: 'Bài 2.3: Validation, Querying và Aggregation Nâng cao',
            content:
              'Áp dụng các kỹ thuật truy vấn dữ liệu phức tạp và xác thực dữ liệu đầu vào.',
          },
        ],
      },
      {
        title: 'Chương 3: Xác thực (Authentication) và Bảo mật',
        lessons: [
          {
            title:
              'Bài 3.1: Triển khai Đăng ký và Đăng nhập với JWT (JSON Web Tokens)',
            content: 'Sử dụng JWT để quản lý phiên và xác thực người dùng.',
          },
          {
            title: 'Bài 3.2: Bảo mật Mật khẩu với Hashing (Bcrypt)',
            content: 'Các biện pháp bảo vệ mật khẩu người dùng.',
          },
          {
            title:
              'Bài 3.3: Phân quyền (Authorization) và Middleware bảo vệ Route',
            content:
              'Tạo các logic để giới hạn quyền truy cập dựa trên vai trò (Roles).',
          },
        ],
      },
    ],
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
    chapters: [
      {
        title: 'Chương 1: Nền tảng Ngôn ngữ Python (Foundation)',
        lessons: [
          {
            title: 'Bài 1.1: Cài đặt Môi trường và Giới thiệu Jupyter Notebook',
            content:
              'Thiết lập môi trường làm việc và làm quen với công cụ tương tác.',
          },
          {
            title:
              'Bài 1.2: Cấu trúc Dữ liệu Cơ bản (List, Tuple, Dictionary, Set)',
            content: 'Làm chủ các kiểu dữ liệu cốt lõi của Python.',
          },
          {
            title: 'Bài 1.3: Vòng lặp, Hàm và Module trong Python',
            content: 'Xây dựng các khối lệnh và hàm có thể tái sử dụng.',
          },
        ],
      },
      {
        title: 'Chương 2: Xử lý và Thao tác Dữ liệu với Pandas',
        lessons: [
          {
            title: 'Bài 2.1: Giới thiệu DataFrame và Series ',
            content:
              'Hiểu cấu trúc dữ liệu chính trong Pandas và cách đọc file CSV/Excel.',
          },
          {
            title:
              'Bài 2.2: Làm sạch Dữ liệu (Data Cleaning) và Xử lý Missing Values',
            content: 'Thực hiện lọc, sắp xếp và điền/xóa các giá trị bị thiếu.',
          },
          {
            title: 'Bài 2.3: Nhóm, Tổng hợp và Pivot Dữ liệu',
            content:
              'Sử dụng `groupby` và `pivot_table` để phân tích dữ liệu chuyên sâu.',
          },
        ],
      },
      {
        title: 'Chương 3: Trực quan hóa Dữ liệu với Matplotlib và Seaborn',
        lessons: [
          {
            title: 'Bài 3.1: Cơ bản về Matplotlib (Line, Scatter, Bar Plots)',
            content: 'Tạo các biểu đồ cơ bản để minh họa dữ liệu.',
          },
          {
            title: 'Bài 3.2: Biểu đồ Thống kê nâng cao với Seaborn ',
            content:
              'Sử dụng Seaborn để tạo Histograms, Box Plots và Heatmaps.',
          },
          {
            title: 'Bài 3.3: Tùy chỉnh và Xuất bản Biểu đồ',
            content:
              'Cá nhân hóa màu sắc, nhãn và lưu biểu đồ với chất lượng cao.',
          },
        ],
      },
      {
        title: 'Chương 4: Giới thiệu về Học máy (Machine Learning)',
        lessons: [
          {
            title: 'Bài 4.1: Giới thiệu về Scikit-learn và Quy trình ML cơ bản',
            content: 'Các bước chuẩn bị dữ liệu, chọn mô hình và huấn luyện.',
          },
          {
            title:
              'Bài 4.2: Thực hành Mô hình Hồi quy Tuyến tính (Linear Regression)',
            content: 'Áp dụng thuật toán học máy giám sát đơn giản.',
          },
        ],
      },
    ],
  },
  // ------------------------KHDL------------------------

  {
    title: 'Deep Learning cho Thị Giác Máy Tính (Computer Vision) với PyTorch',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 45,
    price: 2899000,
    originalPrice: 4000000,
    discount: 28,
    discountExpiresAt: null,
    description:
      'Làm chủ các mô hình Deep Learning trong Computer Vision (CV), bao gồm Phân loại, Phát hiện Đối tượng (Object Detection) và Phân đoạn Ảnh (Segmentation) bằng PyTorch.',
    learnings: [
      'Cơ bản về PyTorch và Tensors',
      'Mạng Nơ-ron Tích chập (CNN) và các kiến trúc (ResNet, VGG)',
      'Xây dựng các mô hình Phát hiện và Phân đoạn Đối tượng',
      'Kỹ thuật Data Augmentation và Transfer Learning',
    ],
    requirements: ['Kiến thức vững về Python và ML cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Mạng Nơ-ron Tích chập (CNN)',
        lessons: [
          {
            title: 'Bài 1.1: Convolution, Pooling và Activation Layers',
            content: 'Các thành phần cơ bản của CNN.',
          },
          {
            title: 'Bài 1.2: Các kiến trúc CNN kinh điển (VGG, ResNet)',
            content: 'Phân tích cấu trúc các mô hình hiệu suất cao.',
          },
        ],
      },
      {
        title: 'Chương 2: Phát hiện Đối tượng và PyTorch',
        lessons: [
          {
            title: 'Bài 2.1: DataLoaders và Dataset trong PyTorch',
            content: 'Quản lý dữ liệu hình ảnh.',
          },
          {
            title:
              'Bài 2.2: Giới thiệu Mô hình Phát hiện Đối tượng (YOLO/Faster R-CNN)',
            content: 'Thực hành huấn luyện mô hình.',
          },
        ],
      },
    ],
  },
  {
    title: 'Xử lý Ngôn ngữ Tự nhiên (NLP) với Transformers và Hugging Face',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2299000,
    originalPrice: 3000000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học cách sử dụng các mô hình Transformers (BERT, GPT) và thư viện Hugging Face để giải quyết các bài toán NLP hiện đại: Phân loại văn bản, Tóm tắt, Dịch máy.',
    learnings: [
      'Cơ bản về Xử lý Ngôn ngữ Tự nhiên (Tokenization, Embeddings)',
      'Kiến trúc Transformers và Attention Mechanism',
      'Sử dụng thư viện Hugging Face Transformers',
      'Fine-tuning mô hình BERT cho bài toán cụ thể',
    ],
    requirements: ['Kiến thức Python và Deep Learning cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng NLP và Embeddings',
        lessons: [
          {
            title: 'Bài 1.1: Tokenization và Vector hóa Văn bản',
            content: 'Chuyển văn bản thành dữ liệu số.',
          },
          {
            title: 'Bài 1.2: Word Embeddings (Word2Vec, GloVe) và Hạn chế',
            content: 'Tìm hiểu cách biểu diễn ngữ nghĩa từ.',
          },
        ],
      },
      {
        title: 'Chương 2: Transformers và Hugging Face',
        lessons: [
          {
            title: 'Bài 2.1: Kiến trúc BERT và ứng dụng ',
            content: 'Hiểu cơ chế hoạt động của mô hình Transformer.',
          },
          {
            title: 'Bài 2.2: Fine-tuning mô hình với Trainer API',
            content:
              'Thực hành tinh chỉnh mô hình cho bài toán phân loại cảm xúc.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Dữ Liệu Kinh Doanh với Power BI và Excel',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Cơ Bản',
    duration: 3600 * 25,
    price: 1199000,
    originalPrice: 1800000,
    discount: 33,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Thành thạo công cụ Power BI của Microsoft và Excel để thu thập, làm sạch, mô hình hóa và trực quan hóa dữ liệu kinh doanh (Business Intelligence).',
    learnings: [
      'Sử dụng Power Query để kết nối và biến đổi dữ liệu',
      'Viết các công thức DAX để tính toán KPI',
      'Tạo các Báo cáo (Dashboard) và Biểu đồ tương tác trong Power BI',
      'Phân tích dữ liệu trong Excel (Pivot Table, VLOOKUP, Power Query)',
    ],
    requirements: ['Kiến thức cơ bản về Excel'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Làm sạch dữ liệu với Power Query',
        lessons: [
          {
            title: 'Bài 1.1: Kết nối các nguồn dữ liệu khác nhau',
            content: 'Nhập dữ liệu từ CSV, Database và Web.',
          },
          {
            title: 'Bài 1.2: Biến đổi dữ liệu (Transform) trong Power Query',
            content: 'Xử lý các vấn đề về định dạng và missing data.',
          },
        ],
      },
      {
        title: 'Chương 2: Mô hình hóa và Báo cáo Power BI',
        lessons: [
          {
            title: 'Bài 2.1: Mô hình hóa dữ liệu (Relationships) và DAX',
            content:
              'Xây dựng mối quan hệ giữa các bảng và viết công thức tính toán.',
          },
          {
            title: 'Bài 2.2: Thiết kế Dashboard tương tác',
            content: 'Tạo các báo cáo trực quan, dễ hiểu.',
          },
        ],
      },
    ],
  },
  {
    title: 'SQL Toàn Diện cho Phân Tích Dữ Liệu (PostgreSQL & MySQL)',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Cơ Bản',
    duration: 3600 * 20,
    price: 999000,
    originalPrice: 1500000,
    discount: 33,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ ngôn ngữ truy vấn cấu trúc SQL để trích xuất, làm sạch và phân tích dữ liệu từ các hệ thống quản lý cơ sở dữ liệu quan hệ (RDBMS).',
    learnings: [
      'Các lệnh DDL (CREATE, ALTER) và DML (SELECT, INSERT, UPDATE)',
      'Thao tác JOINs (INNER, LEFT, RIGHT) phức tạp',
      'Sử dụng Window Functions và CTEs (Common Table Expressions)',
      'Tối ưu hóa tốc độ truy vấn (Query Optimization)',
    ],
    requirements: ['Kiến thức cơ bản về Database'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Truy vấn Dữ liệu Cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Lệnh SELECT, WHERE, GROUP BY và HAVING',
            content: 'Các lệnh cơ bản để lọc và tổng hợp dữ liệu.',
          },
          {
            title: 'Bài 1.2: Thực hành JOINs (Inner, Outer)',
            content: 'Kết hợp dữ liệu từ nhiều bảng.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỹ thuật Truy vấn Nâng cao',
        lessons: [
          {
            title: 'Bài 2.1: Window Functions (ROW_NUMBER, LEAD, LAG)',
            content: 'Thực hiện tính toán trên tập hợp cửa sổ.',
          },
          {
            title: 'Bài 2.2: CTEs (WITH Clause) và Stored Procedures',
            content: 'Viết các truy vấn phức tạp, dễ đọc.',
          },
        ],
      },
    ],
  },
  {
    title: 'Dashboard Tương Tác với Tableau và Visual Analytics',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 28,
    price: 1599000,
    originalPrice: 2200000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học cách sử dụng Tableau để biến dữ liệu thô thành các Dashboard trực quan, truyền tải thông điệp kinh doanh rõ ràng.',
    learnings: [
      'Kết nối, tiền xử lý dữ liệu và tạo Calculated Fields',
      'Sử dụng LOD Expressions (Level of Detail)',
      'Thiết kế các loại biểu đồ nâng cao (Treemaps, Maps, Funnels)',
      'Xuất bản và Chia sẻ Dashboard trên Tableau Server/Online',
    ],
    requirements: ['Kinh nghiệm cơ bản về Phân tích Dữ liệu'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Tableau và Calculated Fields',
        lessons: [
          {
            title: 'Bài 1.1: Tableau Interface và Data Connection',
            content: 'Làm quen với giao diện và nhập dữ liệu.',
          },
          {
            title: 'Bài 1.2: Tạo Calculated Fields và Parameters',
            content: 'Thực hiện các phép tính tùy chỉnh.',
          },
        ],
      },
      {
        title: 'Chương 2: Dashboard Design và LOD Expressions',
        lessons: [
          {
            title: 'Bài 2.1: Thiết kế Dashboard Hiệu quả',
            content: 'Nguyên tắc thiết kế dashboard và câu chuyện dữ liệu.',
          },
          {
            title: 'Bài 2.2: Sử dụng LOD Expressions Nâng cao',
            content: 'Thực hiện các phép tính tổng hợp phức tạp.',
          },
        ],
      },
    ],
  },

  {
    title: 'Big Data Fundamentals: Apache Spark và Databricks',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 40,
    price: 2499000,
    originalPrice: 3200000,
    discount: 22,
    discountExpiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ khung công tác xử lý dữ liệu lớn Apache Spark, sử dụng Databricks để phân tích và xử lý dữ liệu hàng terabyte một cách hiệu quả.',
    learnings: [
      'Kiến trúc Big Data và Hệ sinh thái Hadoop/Spark',
      'Lập trình với PySpark (RDDs và DataFrames)',
      'Sử dụng Databricks/Jupyter Notebook cho Spark',
      'Xử lý Dữ liệu Streaming với Spark Structured Streaming',
    ],
    requirements: ['Kinh nghiệm Python và SQL'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Giới thiệu Apache Spark và PySpark',
        lessons: [
          {
            title: 'Bài 1.1: Kiến trúc Spark Cluster ',
            content:
              'Hiểu các thành phần (Driver, Executor) và cơ chế làm việc.',
          },
          {
            title: 'Bài 1.2: Tạo và Thao tác Spark DataFrames',
            content: 'Sử dụng PySpark để làm sạch và chuyển đổi dữ liệu lớn.',
          },
        ],
      },
      {
        title: 'Chương 2: Databricks và Ứng dụng',
        lessons: [
          {
            title: 'Bài 2.1: Môi trường Databricks và Tối ưu hóa',
            content:
              'Sử dụng Databricks Notebooks và tối ưu hóa hiệu suất Spark.',
          },
          {
            title: 'Bài 2.2: Spark SQL và Streaming cơ bản',
            content: 'Thực hiện các truy vấn SQL trên DataFrames.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Engineering trên AWS: S3, Glue và Redshift',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2199000,
    originalPrice: 2800000,
    discount: 21,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Xây dựng các quy trình ETL/ELT trên nền tảng Amazon Web Services (AWS), sử dụng các dịch vụ như S3, Glue (Serverless ETL) và Redshift (Data Warehouse).',
    learnings: [
      'Thiết kế Data Lake trên S3',
      'Sử dụng AWS Glue để tạo và chạy các Job ETL',
      'Quản lý Data Warehouse với Amazon Redshift',
      'Tích hợp Amazon Quicksight cho Business Intelligence',
    ],
    requirements: ['Kinh nghiệm Python/SQL và AWS cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Data Lake và AWS S3',
        lessons: [
          {
            title: 'Bài 1.1: Thiết kế S3 Data Lake và Phân vùng (Partitioning)',
            content: 'Lưu trữ dữ liệu lớn một cách hiệu quả.',
          },
          {
            title: 'Bài 1.2: Sử dụng AWS Glue Crawler và Catalog',
            content: 'Khám phá và định nghĩa Schema cho dữ liệu.',
          },
        ],
      },
      {
        title: 'Chương 2: Quy trình ETL Serverless với Glue và Redshift',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng Glue ETL Jobs (PySpark)',
            content: 'Thực hiện các bước chuyển đổi dữ liệu.',
          },
          {
            title: 'Bài 2.2: Tải dữ liệu vào Amazon Redshift',
            content: 'Quản lý và truy vấn Data Warehouse.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Visualization Nâng Cao với D3.js và JavaScript',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: null,
    description:
      'Tạo các biểu đồ tùy chỉnh, tương tác cao và đẹp mắt cho Web bằng thư viện D3.js (Data-Driven Documents) và JavaScript thuần.',
    learnings: [
      'Cơ bản về SVG và HTML Canvas',
      'Sử dụng D3.js để Binding dữ liệu với DOM',
      'Tạo các biểu đồ tùy chỉnh (Choropleth Maps, Sunbursts)',
      'Xử lý Tương tác (Interactions) và Animations',
    ],
    requirements: ['Thành thạo JavaScript và HTML/CSS'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng D3.js và SVG',
        lessons: [
          {
            title: 'Bài 1.1: Data-Driven Documents và Data Binding',
            content: 'Lý thuyết về cách D3.js liên kết dữ liệu với hình ảnh.',
          },
          {
            title: 'Bài 1.2: Thao tác với SVG Primitives',
            content: 'Vẽ các hình cơ bản bằng SVG.',
          },
        ],
      },
      {
        title: 'Chương 2: Biểu đồ Tùy chỉnh và Tương tác',
        lessons: [
          {
            title: 'Bài 2.1: Tạo Bar Chart và Scatter Plot cơ bản',
            content: 'Áp dụng Scales và Axes.',
          },
          {
            title: 'Bài 2.2: Xử lý Interactions (Hover, Click) và Animations',
            content: 'Làm cho biểu đồ trở nên sống động.',
          },
        ],
      },
    ],
  },
  {
    title: 'Time Series Analysis và Forecasting với Python',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 1999000,
    originalPrice: 2700000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các mô hình và kỹ thuật phân tích dữ liệu chuỗi thời gian (Time Series), bao gồm ARIMA, Prophet và các mô hình dựa trên Deep Learning.',
    learnings: [
      'Tiền xử lý dữ liệu chuỗi thời gian (Detrending, Stationarity)',
      'Sử dụng mô hình ARIMA và SARIMA',
      'Mô hình Dự báo của Facebook: Prophet',
      'Đánh giá và Tinh chỉnh mô hình dự báo',
    ],
    requirements: ['Kiến thức Python, Pandas, và Thống kê cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Tiền xử lý Chuỗi thời gian',
        lessons: [
          {
            title: 'Bài 1.1: Stationarity và Kiểm tra Dickey-Fuller',
            content: 'Phân tích tính ổn định của chuỗi.',
          },
          {
            title: 'Bài 1.2: Decomposition và Lọc nhiễu',
            content: 'Tách biệt xu hướng, tính mùa và phần dư.',
          },
        ],
      },
      {
        title: 'Chương 2: Mô hình Dự báo',
        lessons: [
          {
            title: 'Bài 2.1: Mô hình ARIMA/SARIMA',
            content:
              'Thiết lập và huấn luyện mô hình dựa trên Auto-correlation.',
          },
          {
            title: 'Bài 2.2: Sử dụng Prophet để dự báo',
            content: 'Ứng dụng mô hình Prophet cho dữ liệu kinh doanh.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Mining và Khám phá Dữ liệu (Clustering & Association)',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Trung Cấp',
    duration: 3600 * 22,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các kỹ thuật học máy không giám sát (Unsupervised Learning) để khám phá các mẫu ẩn trong dữ liệu lớn, bao gồm phân cụm (Clustering) và luật kết hợp.',
    learnings: [
      'Các thuật toán Phân cụm (K-Means, DBSCAN)',
      'Kỹ thuật Giảm chiều dữ liệu (PCA, t-SNE)',
      'Luật Kết hợp (Association Rules) và thuật toán Apriori',
      'Đánh giá chất lượng của các mô hình không giám sát',
    ],
    requirements: ['Kiến thức Python và Thống kê cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Phân cụm (Clustering)',
        lessons: [
          {
            title: 'Bài 1.1: Thuật toán K-Means và chọn K tối ưu',
            content: 'Phân nhóm dữ liệu và phương pháp Elbow.',
          },
          {
            title: 'Bài 1.2: Phân cụm dựa trên mật độ (DBSCAN)',
            content: 'Phân cụm các hình dạng phức tạp.',
          },
        ],
      },
      {
        title: 'Chương 2: Giảm chiều và Luật Kết hợp',
        lessons: [
          {
            title: 'Bài 2.1: Phân tích Thành phần Chính (PCA) ',
            content: 'Giảm số lượng biến mà vẫn giữ được thông tin.',
          },
          {
            title: 'Bài 2.2: Luật Kết hợp (Apriori Algorithm)',
            content: 'Phân tích giỏ hàng và mối quan hệ giữa các sản phẩm.',
          },
        ],
      },
    ],
  },
  {
    title: 'A/B Testing và Thử nghiệm Thống kê trong Kinh doanh',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 18,
    price: 1099000,
    originalPrice: 1500000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Học các nguyên tắc thống kê để thiết kế, triển khai và phân tích các thử nghiệm A/B Testing, đưa ra quyết định dựa trên dữ liệu cho sản phẩm và marketing.',
    learnings: [
      'Nguyên tắc thiết kế thử nghiệm A/B Testing (Sample Size, Power)',
      'Kiểm định giả thuyết (Hypothesis Testing) và P-value',
      'Sử dụng Python/Statsmodels để phân tích kết quả',
      'Xử lý Multiple Testing và Novelty Effects',
    ],
    requirements: ['Kiến thức Thống kê Cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thiết kế Thử nghiệm A/B',
        lessons: [
          {
            title: 'Bài 1.1: Xác định Hypotheses và Metrics',
            content: 'Thiết lập các giả thuyết cần kiểm chứng.',
          },
          {
            title: 'Bài 1.2: Tính Sample Size và Duration',
            content: 'Xác định kích thước mẫu cần thiết cho thử nghiệm.',
          },
        ],
      },
      {
        title: 'Chương 2: Phân tích Thống kê',
        lessons: [
          {
            title: 'Bài 2.1: Kiểm định Z-test và T-test',
            content: 'Áp dụng các kiểm định thống kê để so sánh nhóm A và B.',
          },
          {
            title: 'Bài 2.2: Xử lý các vấn đề A/B Testing thực tế',
            content: 'Phân tích các thử nghiệm không hợp lệ.',
          },
        ],
      },
    ],
  },
  {
    title: 'Python cho Tài chính và Định lượng (Quantitative Finance)',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2399000,
    originalPrice: 3200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description:
      'Sử dụng Python và các thư viện chuyên biệt (Numpy, Pandas, Yfinance) để phân tích thị trường chứng khoán, quản lý rủi ro và xây dựng chiến lược giao dịch định lượng.',
    learnings: [
      'Sử dụng thư viện Yfinance để lấy dữ liệu chứng khoán',
      'Tính toán các chỉ số rủi ro và lợi nhuận (Sharpe Ratio, Alpha)',
      'Mô hình hóa Giá tài sản bằng Monte Carlo Simulation',
      'Xây dựng Backtesting cho chiến lược giao dịch',
    ],
    requirements: ['Kiến thức Python và Tài chính cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thao tác Dữ liệu Tài chính',
        lessons: [
          {
            title: 'Bài 1.1: Lấy dữ liệu chứng khoán với Yfinance',
            content: 'Thu thập dữ liệu giá lịch sử.',
          },
          {
            title:
              'Bài 1.2: Tính toán các Chỉ báo Kỹ thuật (Moving Averages, RSI)',
            content: 'Áp dụng các công thức phân tích.',
          },
        ],
      },
      {
        title: 'Chương 2: Quản lý Rủi ro và Định lượng',
        lessons: [
          {
            title: 'Bài 2.1: Phân tích Portfolio và Tối ưu hóa',
            content: 'Sử dụng Mô hình Markowitz.',
          },
          {
            title: 'Bài 2.2: Backtesting và Đánh giá Chiến lược',
            content:
              'Kiểm tra hiệu quả chiến lược giao dịch trên dữ liệu quá khứ.',
          },
        ],
      },
    ],
  },
  {
    title: 'Xây Dựng Data Pipeline với Apache Airflow',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2099000,
    originalPrice: 2800000,
    discount: 25,
    discountExpiresAt: null,
    description:
      'Làm chủ công cụ điều phối (Orchestration) Data Pipeline hàng đầu: Apache Airflow, sử dụng Python để tạo và quản lý các luồng công việc phức tạp (DAGs).',
    learnings: [
      'Kiến trúc và các thành phần của Airflow (Scheduler, Worker, Webserver)',
      'Viết DAGs (Directed Acyclic Graphs) bằng Python',
      'Sử dụng Operators và Sensors phổ biến',
      'Quản lý Connections, Variables và Xử lý lỗi',
    ],
    requirements: ['Kinh nghiệm Python và SQL'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Airflow Core Concepts và Setup',
        lessons: [
          {
            title: 'Bài 1.1: Cài đặt Airflow (Docker Compose) và Giao diện Web',
            content: 'Thiết lập môi trường phát triển.',
          },
          {
            title: 'Bài 1.2: Tạo DAGs cơ bản và Scheduling',
            content: 'Định nghĩa luồng công việc và lịch chạy.',
          },
        ],
      },
      {
        title: 'Chương 2: Operators và Quản lý State',
        lessons: [
          {
            title: 'Bài 2.1: Sử dụng Bash Operator, Python Operator và Hooks',
            content: 'Thực hiện các tác vụ khác nhau.',
          },
          {
            title: 'Bài 2.2: Xử lý lỗi, Retries và XComs',
            content: 'Đảm bảo luồng công việc chạy ổn định.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Dữ Liệu Vị Trí (Geospatial) với Python',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 1900000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Học cách làm việc với dữ liệu vị trí (Geospatial Data) bằng Python, sử dụng các thư viện như GeoPandas, Folium và Shapely để trực quan hóa và phân tích bản đồ.',
    learnings: [
      'Cơ bản về Hệ thống Tọa độ (CRS)',
      'Sử dụng GeoPandas để quản lý dữ liệu không gian',
      'Trực quan hóa Bản đồ tương tác với Folium/Leaflet',
      'Phân tích Vùng đệm (Buffering) và Intersection',
    ],
    requirements: ['Kiến thức Python và Pandas'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Dữ liệu Vị trí',
        lessons: [
          {
            title: 'Bài 1.1: Khái niệm Geometry và CRS',
            content: 'Điểm, Đường, Đa giác và Hệ thống tham chiếu.',
          },
          {
            title: 'Bài 1.2: Sử dụng GeoPandas DataFrames',
            content: 'Đọc và thao tác với các Shapefile/GeoJSON.',
          },
        ],
      },
      {
        title: 'Chương 2: Phân tích và Trực quan hóa Bản đồ',
        lessons: [
          {
            title: 'Bài 2.1: Xử lý Spatial Joins và Buffering',
            content: 'Thực hiện các phép toán không gian.',
          },
          {
            title: 'Bài 2.2: Tạo Bản đồ tương tác với Folium',
            content: 'Thiết kế các lớp bản đồ (Layers).',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Wrangling Nâng Cao: Cleaning và Feature Engineering',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1299000,
    originalPrice: 1800000,
    discount: 28,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Đi sâu vào các kỹ thuật làm sạch dữ liệu, xử lý nhiễu, chuẩn hóa và tạo các biến mới (Feature Engineering) để cải thiện hiệu suất mô hình Machine Learning.',
    learnings: [
      'Xử lý Dữ liệu Ngoại lai (Outliers) và Giá trị Thiếu (Missing Data)',
      'Kỹ thuật Mã hóa Biến Phân loại (One-Hot Encoding, Target Encoding)',
      'Chuẩn hóa và Thay đổi tỷ lệ (Scaling) Dữ liệu',
      'Tạo Features mới từ Dữ liệu Thô',
    ],
    requirements: ['Thành thạo Python và Pandas'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Làm sạch Dữ liệu Chuyên sâu',
        lessons: [
          {
            title: 'Bài 1.1: Phát hiện và Xử lý Outliers',
            content: 'Sử dụng IQR và Z-Score.',
          },
          {
            title: 'Bài 1.2: Các phương pháp Imputation (Điền giá trị thiếu)',
            content: 'Sử dụng Mean, Median hoặc Mô hình ML.',
          },
        ],
      },
      {
        title: 'Chương 2: Feature Engineering',
        lessons: [
          {
            title: 'Bài 2.1: Kỹ thuật Mã hóa Biến Phân loại',
            content: 'Chuyển đổi biến Category thành dạng số.',
          },
          {
            title: 'Bài 2.2: Tạo Features từ Dữ liệu Thời gian và Chuỗi',
            content: 'Trích xuất thông tin hữu ích từ Date/Text.',
          },
        ],
      },
    ],
  },
  {
    title: 'Xây Dựng Hệ Thống Gợi Ý (Recommender Systems)',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học cách thiết kế và triển khai các hệ thống gợi ý sản phẩm/nội dung (Netflix, Amazon style) bằng các thuật toán: Gợi ý Dựa trên Nội dung (Content-Based) và Lọc Cộng tác (Collaborative Filtering).',
    learnings: [
      'Cơ bản về các loại Recommender Systems',
      'Thuật toán Lọc Cộng tác (Matrix Factorization, SVD)',
      'Gợi ý Dựa trên Nội dung và Khoảng cách Cosine',
      'Đánh giá hiệu suất Hệ thống Gợi ý (Precision, Recall)',
    ],
    requirements: ['Kiến thức Python, ML và Đại số Tuyến tính'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thuật toán Gợi ý',
        lessons: [
          {
            title: 'Bài 1.1: Gợi ý Dựa trên Nội dung và Item-Item Similarity',
            content: 'Sử dụng các đặc trưng của sản phẩm.',
          },
          {
            title: 'Bài 1.2: Collaborative Filtering (User-User và Item-Item)',
            content: 'Tìm kiếm người dùng/sản phẩm tương tự.',
          },
        ],
      },
      {
        title: 'Chương 2: Triển khai và Đánh giá',
        lessons: [
          {
            title: 'Bài 2.1: Matrix Factorization và SVD',
            content: 'Kỹ thuật giảm chiều để lọc cộng tác.',
          },
          {
            title: 'Bài 2.2: Đánh giá và A/B Testing cho Recommender',
            content: 'Đo lường hiệu quả trong môi trường thực tế.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thống kê Ứng dụng cho Khoa Học Dữ Liệu',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Cơ Bản',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Cung cấp nền tảng vững chắc về thống kê suy luận và mô tả, cần thiết để hiểu các thuật toán Machine Learning và đưa ra quyết định dựa trên dữ liệu.',
    learnings: [
      'Thống kê Mô tả (Mean, Median, Standard Deviation)',
      'Phân phối Xác suất (Normal, Binomial)',
      'Kiểm định Giả thuyết và Khoảng tin cậy',
      'Hồi quy Tuyến tính Đa biến (Multivariate Linear Regression)',
    ],
    requirements: ['Không yêu cầu kinh nghiệm lập trình'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thống kê Mô tả và Xác suất',
        lessons: [
          {
            title: 'Bài 1.1: Đo lường Xu hướng Trung tâm và Độ phân tán',
            content: 'Phân tích tổng quan về tập dữ liệu.',
          },
          {
            title: 'Bài 1.2: Các Phân phối Xác suất quan trọng',
            content: 'Hiểu các loại phân phối thường gặp.',
          },
        ],
      },
      {
        title: 'Chương 2: Thống kê Suy luận và Hồi quy',
        lessons: [
          {
            title: 'Bài 2.1: Kiểm định T và ANOVA',
            content: 'So sánh các nhóm dữ liệu.',
          },
          {
            title: 'Bài 2.2: Hồi quy Tuyến tính (Linear Regression)',
            content: 'Mô hình hóa mối quan hệ giữa các biến.',
          },
        ],
      },
    ],
  },
  {
    title: 'Google Cloud Platform (GCP) cho Data Engineers',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2399000,
    originalPrice: 3200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các dịch vụ đám mây của Google (GCP) như BigQuery, Dataflow (Apache Beam) và Cloud Composer (Airflow) để xây dựng Data Pipeline hiện đại.',
    learnings: [
      'Sử dụng BigQuery để phân tích dữ liệu Terabyte',
      'Xây dựng Data Pipeline với Cloud Dataflow',
      'Tổ chức công việc với Cloud Composer',
      'Làm việc với Cloud Storage và Pub/Sub',
    ],
    requirements: ['Kinh nghiệm Python/SQL và khái niệm Cloud'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: BigQuery và Data Storage',
        lessons: [
          {
            title: 'Bài 1.1: BigQuery Architecture và Querying',
            content: 'Truy vấn dữ liệu lớn và tối ưu hóa chi phí.',
          },
          {
            title: 'Bài 1.2: Cloud Storage (GCS) và Data Lake',
            content: 'Lưu trữ và quản lý dữ liệu.',
          },
        ],
      },
      {
        title: 'Chương 2: ETL và Điều phối',
        lessons: [
          {
            title: 'Bài 2.1: Cloud Dataflow (Apache Beam) cho ETL',
            content: 'Xây dựng các Job xử lý dữ liệu Batch/Streaming.',
          },
          {
            title: 'Bài 2.2: Cloud Composer (Airflow) và DAGs',
            content: 'Tự động hóa luồng công việc ETL.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Modeling và Thiết kế Data Warehouse (Kimball/Inmon)',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Trần Lệ Quyên',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1599000,
    originalPrice: 2000000,
    discount: 20,
    discountExpiresAt: null,
    description:
      'Học cách thiết kế các mô hình dữ liệu tối ưu cho Data Warehouse và Data Marts, áp dụng các kỹ thuật như Star Schema, Snowflake Schema và Data Vault.',
    learnings: [
      'Phân biệt Data Warehouse (DW) và Operational Data Store (ODS)',
      'Thiết kế Star Schema (Fact and Dimension Tables)',
      'Sử dụng Kỹ thuật Kimball (Dimensional Modeling)',
      'Xử lý Slowly Changing Dimensions (SCD)',
    ],
    requirements: ['Kinh nghiệm SQL và Khái niệm Database'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Data Warehouse',
        lessons: [
          {
            title: 'Bài 1.1: Kiến trúc DW và Khái niệm OLAP/OLTP',
            content: 'Mục đích và sự khác biệt giữa các hệ thống.',
          },
          {
            title: 'Bài 1.2: Thiết kế Star Schema ',
            content: 'Cấu trúc Fact và Dimension Tables.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỹ thuật Mô hình hóa Nâng cao',
        lessons: [
          {
            title:
              'Bài 2.1: Xử lý Slowly Changing Dimensions (SCD Types 1, 2, 3)',
            content: 'Quản lý sự thay đổi của các Dimension theo thời gian.',
          },
          {
            title: 'Bài 2.2: Dimension Hierarchy và Aggregation',
            content: 'Tạo các cấp độ phân tích và bảng tổng hợp.',
          },
        ],
      },
    ],
  },
  {
    title: 'Giới thiệu về Mạng Nơ-ron và Deep Learning với NumPy',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1299000,
    originalPrice: 1700000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Xây dựng Mạng Nơ-ron cơ bản từ đầu bằng thư viện NumPy, không sử dụng framework (TensorFlow/PyTorch), giúp hiểu rõ cơ chế toán học (Backpropagation).',
    learnings: [
      'Thành thạo NumPy cho Tính toán Khoa học',
      'Xây dựng Forward Propagation và Activation Functions',
      'Triển khai Backpropagation và Gradient Descent',
      'Xây dựng một Fully Connected Neural Network từ đầu',
    ],
    requirements: ['Kiến thức Python và Đại số Tuyến tính'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: NumPy và Mạng Nơ-ron cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Thao tác Ma trận (Matrix Operations) với NumPy',
            content: 'Các phép tính cần thiết cho Deep Learning.',
          },
          {
            title: 'Bài 1.2: Xây dựng Lớp và Hàm Kích hoạt (Sigmoid, ReLU)',
            content: 'Các thành phần của mạng nơ-ron.',
          },
        ],
      },
      {
        title: 'Chương 2: Huấn luyện và Tối ưu hóa',
        lessons: [
          {
            title:
              'Bài 2.1: Triển khai Backpropagation (Thuật toán Lan truyền ngược)',
            content: 'Tính toán Gradient để cập nhật trọng số.',
          },
          {
            title: 'Bài 2.2: Gradient Descent và Learning Rate',
            content: 'Quá trình tối ưu hóa mô hình.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Dữ Liệu Lớn với kỹ thuật Mẫu (Sampling) và Ước tính',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Học các kỹ thuật lấy mẫu dữ liệu lớn (Sampling) và các phương pháp ước tính thống kê để phân tích hiệu quả hơn khi tài nguyên tính toán bị giới hạn.',
    learnings: [
      'Các phương pháp Lấy mẫu (Random, Stratified, Cluster Sampling)',
      'Sử dụng Thống kê Suy luận từ Mẫu nhỏ',
      'Kỹ thuật Bootstrap và Jackknife để ước tính sai số',
      'Ứng dụng Python để thực hiện Sampling',
    ],
    requirements: ['Kiến thức Thống kê Cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Kỹ thuật Lấy mẫu Dữ liệu',
        lessons: [
          {
            title: 'Bài 1.1: Lấy mẫu Ngẫu nhiên Đơn giản và Phân tầng',
            content: 'Chọn mẫu đại diện từ tổng thể.',
          },
          {
            title: 'Bài 1.2: Ước tính từ Mẫu và Sai số Chuẩn',
            content: 'Đánh giá độ chính xác của ước tính.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỹ thuật Bootstrap và Jackknife',
        lessons: [
          {
            title: 'Bài 2.1: Bootstrap để ước tính Khoảng tin cậy',
            content: 'Sử dụng resampling để suy luận thống kê.',
          },
          {
            title: 'Bài 2.2: Lấy mẫu và Phân tích trong Python',
            content: 'Thực hành các kỹ thuật với thư viện NumPy.',
          },
        ],
      },
    ],
  },
  {
    title: 'Reinforcement Learning Cơ bản với OpenAI Gym',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2199000,
    originalPrice: 3000000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu về Học tăng cường (Reinforcement Learning - RL), học cách huấn luyện các tác nhân (Agents) để đưa ra quyết định trong môi trường tương tác bằng các thuật toán Q-Learning và Deep Q-Networks.',
    learnings: [
      'Cơ bản về Markov Decision Process (MDP) và Agent-Environment',
      'Thuật toán Q-Learning và SARSA',
      'Sử dụng OpenAI Gym để mô phỏng môi trường',
      'Giới thiệu Deep Q-Networks (DQN)',
    ],
    requirements: ['Kiến thức Python và Machine Learning cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Reinforcement Learning',
        lessons: [
          {
            title: 'Bài 1.1: Agent, Environment, Rewards và Actions',
            content: 'Các thành phần cốt lõi của RL.',
          },
          {
            title: 'Bài 1.2: Markov Decision Process (MDP)',
            content: 'Khung lý thuyết của RL.',
          },
        ],
      },
      {
        title: 'Chương 2: Thuật toán Học giá trị',
        lessons: [
          {
            title: 'Bài 2.1: Thuật toán Q-Learning (Off-Policy)',
            content: 'Học hàm giá trị hành động.',
          },
          {
            title: 'Bài 2.2: Deep Q-Networks (DQN) cơ bản ',
            content: 'Kết hợp Deep Learning với Q-Learning.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Dữ Liệu Không Cấu Trúc (Text, Images) với Python',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1599000,
    originalPrice: 2000000,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Học cách thu thập, tiền xử lý và phân tích các loại dữ liệu không cấu trúc phổ biến như văn bản (Text) và hình ảnh (Images) bằng Python và các thư viện chuyên ngành.',
    learnings: [
      'Tiền xử lý Văn bản (Tokenization, Stemming, Lemmatization)',
      'Phân tích Cảm xúc (Sentiment Analysis) và Chủ đề (Topic Modeling)',
      'Thao tác Hình ảnh với OpenCV và PIL',
      'Trích xuất Features từ Dữ liệu Không cấu trúc',
    ],
    requirements: ['Kiến thức Python và Pandas'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Phân tích Dữ liệu Văn bản (Text Analytics)',
        lessons: [
          {
            title: 'Bài 1.1: Tiền xử lý Văn bản với NLTK/SpaCy',
            content: 'Làm sạch và chuẩn hóa văn bản.',
          },
          {
            title: 'Bài 1.2: Phân tích Cảm xúc (Sentiment Analysis)',
            content: 'Xác định thái độ của văn bản (tích cực/tiêu cực).',
          },
        ],
      },
      {
        title: 'Chương 2: Xử lý và Phân tích Hình ảnh',
        lessons: [
          {
            title: 'Bài 2.1: Thao tác Hình ảnh với OpenCV và NumPy',
            content: 'Đọc, hiển thị và chuyển đổi hình ảnh.',
          },
          {
            title: 'Bài 2.2: Trích xuất Features cơ bản (Edges, Histograms)',
            content: 'Chuẩn bị dữ liệu hình ảnh cho ML.',
          },
        ],
      },
    ],
  },
  {
    title: 'Xử lý Dữ liệu Streaming với Kafka và Spark Streaming',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2499000,
    originalPrice: 3200000,
    discount: 22,
    discountExpiresAt: null,
    description:
      'Học cách thiết kế và triển khai các hệ thống xử lý dữ liệu theo thời gian thực (Real-time Streaming) bằng nền tảng Apache Kafka và Spark Streaming.',
    learnings: [
      'Kiến trúc Data Streaming và Apache Kafka (Producer, Consumer, Topic)',
      'Sử dụng Spark Structured Streaming để phân tích dữ liệu liên tục',
      'Xử lý Watermarks và State Management trong Streaming',
      'Triển khai các ứng dụng Real-time Analytics',
    ],
    requirements: ['Kinh nghiệm Python, Scala/Java và Spark cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Apache Kafka Fundamentals',
        lessons: [
          {
            title: 'Bài 1.1: Cấu trúc Topic, Partition và Broker',
            content: 'Thiết lập môi trường Kafka và các khái niệm cốt lõi.',
          },
          {
            title: 'Bài 1.2: Viết Producer và Consumer đơn giản',
            content: 'Gửi và nhận tin nhắn.',
          },
        ],
      },
      {
        title: 'Chương 2: Spark Structured Streaming',
        lessons: [
          {
            title: 'Bài 2.1: Streaming DataFrames và Cơ chế Micro-batch',
            content: 'Xử lý dữ liệu liên tục như Batch.',
          },
          {
            title: 'Bài 2.2: Xử lý State và Watermarks cho Dữ liệu Trễ',
            content: 'Đảm bảo tính toán chính xác cho dữ liệu có độ trễ.',
          },
        ],
      },
    ],
  },
  {
    title: 'Model Deployment và MLOps với Docker và Kubeflow',
    categoryName: 'Khoa Học Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2199000,
    originalPrice: 2800000,
    discount: 21,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ quy trình MLOps (Machine Learning Operations), học cách triển khai các mô hình ML (Model Deployment) vào môi trường sản xuất bằng Docker, Kubernetes và Kubeflow.',
    learnings: [
      'Container hóa Mô hình ML với Docker',
      'Sử dụng Framework Flask/FastAPI để tạo API phục vụ Mô hình',
      'Triển khai lên Kubernetes và Kubeflow Pipelines',
      'Giám sát và Cập nhật Mô hình (Model Monitoring)',
    ],
    requirements: ['Kinh nghiệm Python, ML và Docker cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Triển khai Mô hình với Docker và API',
        lessons: [
          {
            title: 'Bài 1.1: Xây dựng REST API cho Mô hình ML (Flask/FastAPI)',
            content: 'Tạo dịch vụ để gọi mô hình qua API.',
          },
          {
            title: 'Bài 1.2: Dockerize Ứng dụng ML',
            content: 'Đóng gói mô hình và các thư viện phụ thuộc.',
          },
        ],
      },
      {
        title: 'Chương 2: MLOps và Kubeflow Pipelines',
        lessons: [
          {
            title: 'Bài 2.1: Giới thiệu Kubernetes và Kubeflow',
            content: 'Quản lý các container mô hình trong môi trường lớn.',
          },
          {
            title: 'Bài 2.2: Xây dựng Kubeflow Pipelines',
            content:
              'Tự động hóa toàn bộ quy trình từ huấn luyện đến triển khai.',
          },
        ],
      },
    ],
  },
  // -------------------------------TTNT--------------------

  {
    title: 'Nền Tảng Trí Tuệ Nhân Tạo: Từ Lý Thuyết đến Ứng Dụng',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Lê Hoàng Minh',
    level: 'Cơ Bản',
    duration: 3600 * 30,
    price: 1599000,
    originalPrice: 2200000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Tổng quan toàn diện về các lĩnh vực của AI, bao gồm tìm kiếm, logic, machine learning, và các thuật toán giải quyết vấn đề.',
    learnings: [
      'Hiểu các khái niệm cốt lõi của AI và các nhánh chính',
      'Thuật toán Tìm kiếm (BFS, DFS, A*)',
      'Lập trình Logic và Lập luận',
      'Giới thiệu về Learning Agents và Reinforcement Learning',
    ],
    requirements: ['Kiến thức lập trình Python cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Các Khái niệm Cơ bản về AI',
        lessons: [
          {
            title: 'Bài 1.1: Định nghĩa AI và Lịch sử phát triển',
            content:
              'Phân loại AI (Strong vs Weak AI) và các cột mốc quan trọng.',
          },
          {
            title: 'Bài 1.2: Rational Agents và Môi trường PEAS',
            content:
              'Tìm hiểu về các tác nhân thông minh và cách chúng tương tác.',
          },
        ],
      },
      {
        title: 'Chương 2: Giải quyết Vấn đề và Tìm kiếm',
        lessons: [
          {
            title: 'Bài 2.1: Thuật toán Tìm kiếm Mù (Blind Search)',
            content: 'BFS, DFS và các ứng dụng.',
          },
          {
            title: 'Bài 2.2: Thuật toán Tìm kiếm Heuristic (A*)',
            content: 'Sử dụng hàm Heuristic để tối ưu hóa tìm kiếm.',
          },
        ],
      },
    ],
  },
  {
    title: 'Deep Learning Nâng Cao: Các Kiến Trúc Hiện Đại',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 45,
    price: 2799000,
    originalPrice: 3800000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Nghiên cứu sâu về các kiến trúc Deep Learning tiên tiến: Mạng Generative Adversarial Networks (GANs), Autoencoders, và Deep Reinforcement Learning.',
    learnings: [
      'Làm chủ kiến trúc GANs và các ứng dụng tạo sinh',
      'Hiểu cơ chế hoạt động của Autoencoders và Biến thể (VAE)',
      'Triển khai các mô hình Deep Reinforcement Learning (DQN, PPO)',
      'Tối ưu hóa và Debug các mô hình Deep Learning phức tạp',
    ],
    requirements: [
      'Kinh nghiệm vững về Python, PyTorch/TensorFlow và Deep Learning cơ bản',
    ],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Mạng Generative (GANs và VAEs)',
        lessons: [
          {
            title:
              'Bài 1.1: Cơ chế hoạt động của GANs (Generator vs Discriminator)',
            content: 'Xây dựng mô hình để tạo dữ liệu mới.',
          },
          {
            title: 'Bài 1.2: Autoencoders và Biến thể (VAE)',
            content: 'Học cách nén và tái tạo dữ liệu.',
          },
        ],
      },
      {
        title: 'Chương 2: Deep Reinforcement Learning',
        lessons: [
          {
            title: 'Bài 2.1: Deep Q-Networks (DQN) và Replay Buffer',
            content: 'Áp dụng Deep Learning cho Học Tăng cường.',
          },
          {
            title:
              'Bài 2.2: Policy Gradient và PPO (Proximal Policy Optimization)',
            content: 'Các thuật toán tiên tiến dựa trên Policy.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Xử Lý Ngôn Ngữ Tự Nhiên (NLP) Chuyên Sâu: Mô hình LLM và Generative AI',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 40,
    price: 2499000,
    originalPrice: 3500000,
    discount: 28,
    discountExpiresAt: null,
    description:
      'Tập trung vào các Mô hình Ngôn ngữ Lớn (LLMs), kỹ thuật Prompt Engineering, Fine-tuning, và ứng dụng AI tạo sinh trong xử lý ngôn ngữ.',
    learnings: [
      'Kiến trúc và các biến thể của LLMs (GPT, Llama, Gemini)',
      'Thành thạo kỹ thuật Prompt Engineering (Zero/Few-shot, Chain-of-Thought)',
      'Fine-tuning LLMs bằng LoRA/QLoRA',
      'Xây dựng ứng dụng RAG (Retrieval-Augmented Generation)',
    ],
    requirements: ['Kinh nghiệm vững về Python và NLP cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: LLMs và Prompt Engineering',
        lessons: [
          {
            title: 'Bài 1.1: Kiến trúc Transformer và Scalability của LLMs',
            content: 'Tìm hiểu tại sao LLMs hoạt động hiệu quả.',
          },
          {
            title: 'Bài 1.2: Kỹ thuật Prompt Engineering nâng cao',
            content: 'Thiết kế các prompts hiệu quả để điều khiển mô hình.',
          },
        ],
      },
      {
        title: 'Chương 2: Tùy chỉnh và Ứng dụng LLMs',
        lessons: [
          {
            title:
              'Bài 2.1: Fine-tuning LLMs (LoRA, QLoRA) cho tác vụ chuyên biệt',
            content: 'Tinh chỉnh mô hình với tập dữ liệu nhỏ của riêng bạn.',
          },
          {
            title: 'Bài 2.2: Xây dựng RAG Pipeline với LangChain/LlamaIndex',
            content: 'Kết hợp LLMs với cơ sở tri thức bên ngoài.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thị Giác Máy Tính (Computer Vision): Nhận dạng và Theo dõi',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2399000,
    originalPrice: 3200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Phát triển các hệ thống Computer Vision tiên tiến, tập trung vào Phát hiện Đối tượng (Object Detection), Phân đoạn Ảnh (Segmentation) và Theo dõi Đối tượng (Object Tracking) bằng OpenCV và Deep Learning.',
    learnings: [
      'Mô hình Phát hiện Đối tượng (YOLO, SSD) và Fine-tuning',
      'Phân đoạn Ảnh (Semantic và Instance Segmentation)',
      'Thuật toán Theo dõi Đối tượng (Tracking) và Kalman Filters',
      'Ứng dụng CV trong Robot và Giám sát An ninh',
    ],
    requirements: ['Kinh nghiệm vững về Python và CNNs'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Phát hiện và Phân đoạn Đối tượng',
        lessons: [
          {
            title: 'Bài 1.1: Kiến trúc YOLO và Đánh giá Performance',
            content: 'Xây dựng hệ thống phát hiện theo thời gian thực.',
          },
          {
            title: 'Bài 1.2: Mô hình U-Net và Segmentation',
            content: 'Phân loại từng pixel trong ảnh.',
          },
        ],
      },
      {
        title: 'Chương 2: Theo dõi và Ứng dụng',
        lessons: [
          {
            title: 'Bài 2.1: Thuật toán Theo dõi (SORT, Deep SORT)',
            content: 'Theo dõi nhiều đối tượng qua các Frame.',
          },
          {
            title: 'Bài 2.2: Calibration và Stereo Vision cơ bản',
            content: 'Giới thiệu về cách hệ thống CV nhìn trong không gian 3D.',
          },
        ],
      },
    ],
  },
  {
    title: 'AI cho Tài chính Định lượng và Giao dịch Thuật toán',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2599000,
    originalPrice: 3500000,
    discount: 25,
    discountExpiresAt: null,
    description:
      'Áp dụng các mô hình AI/ML để phân tích dữ liệu tài chính (Time Series), dự báo giá cổ phiếu, quản lý danh mục đầu tư và xây dựng các Bots giao dịch tự động.',
    learnings: [
      'Sử dụng mô hình LSTM và GRU cho Dự báo Chuỗi thời gian',
      'Tạo chiến lược Giao dịch Thuật toán bằng RL (Deep Reinforcement Learning)',
      'Phân tích Rủi ro và Tối ưu hóa Danh mục đầu tư',
      'Backtesting và Triển khai Trading Bots',
    ],
    requirements: ['Kinh nghiệm Python, Time Series và Kiến thức Tài chính'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Deep Learning cho Dự báo Tài chính',
        lessons: [
          {
            title: 'Bài 1.1: Mô hình LSTM/GRU cho Dự báo Giá',
            content: 'Sử dụng mạng nơ-ron hồi quy cho dữ liệu chuỗi thời gian.',
          },
          {
            title: 'Bài 1.2: Phân tích Sentiment từ Tin tức để dự báo',
            content: 'Kết hợp NLP để đưa ra quyết định giao dịch.',
          },
        ],
      },
      {
        title: 'Chương 2: Reinforcement Learning trong Giao dịch',
        lessons: [
          {
            title: 'Bài 2.1: Agent Giao dịch bằng Q-Learning',
            content: 'Huấn luyện Agent để tối đa hóa lợi nhuận.',
          },
          {
            title: 'Bài 2.2: Xây dựng và Backtesting Chiến lược Thuật toán',
            content: 'Kiểm tra và đánh giá hiệu quả.',
          },
        ],
      },
    ],
  },
  {
    title: 'AI và Robotics: Lập Kế Hoạch và Điều Khiển Chuyển Động',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 2699000,
    originalPrice: 3500000,
    discount: 22,
    discountExpiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào việc áp dụng AI/ML vào hệ thống Robotics, bao gồm Lập kế hoạch Đường đi (Path Planning), Điều khiển Tác nhân (Manipulation) và Tích hợp Vision/Sensor.',
    learnings: [
      'Cơ bản về Kinematics và Điều khiển Robot',
      'Thuật toán Lập kế hoạch Đường đi (RRT, A*)',
      'Xử lý Dữ liệu Sensor (Lidar, Camera) và SLAM cơ bản',
      'Ứng dụng Reinforcement Learning trong Điều khiển Robot',
    ],
    requirements: ['Kinh nghiệm Python, Đại số Tuyến tính và Thống kê'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Lập Kế hoạch Chuyển động (Motion Planning)',
        lessons: [
          {
            title: 'Bài 1.1: Tìm kiếm Đường đi trong không gian Trạng thái',
            content: 'Sử dụng A* và Dijkstra cho Planning.',
          },
          {
            title: 'Bài 1.2: Thuật toán RRT (Rapidly-exploring Random Tree)',
            content: 'Lập kế hoạch cho không gian phức tạp.',
          },
        ],
      },
      {
        title: 'Chương 2: Tích hợp Sensor và Điều khiển',
        lessons: [
          {
            title:
              'Bài 2.1: Xử lý Sensor và SLAM (Simultaneous Localization and Mapping)',
            content: 'Robot nhận biết và lập bản đồ môi trường.',
          },
          {
            title: 'Bài 2.2: Tích hợp Deep RL cho Điều khiển Robot',
            content: 'Huấn luyện Robot thực hiện các tác vụ phức tạp.',
          },
        ],
      },
    ],
  },
  {
    title: 'AI Đạo Đức, Giải Thích (Explainable AI - XAI) và Độ Tin Cậy',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 1900000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Khám phá các khía cạnh đạo đức, công bằng và tính minh bạch của các mô hình AI/ML, học cách sử dụng các công cụ XAI để giải thích các quyết định của "hộp đen".',
    learnings: [
      'Nguyên tắc Đạo đức AI, Công bằng (Fairness) và Thiếu thiên vị (Bias)',
      'Các phương pháp XAI (LIME, SHAP) để giải thích mô hình',
      'Đo lường và Giảm thiểu Bias trong Tập dữ liệu và Mô hình',
      'Xây dựng các hệ thống AI có trách nhiệm (Responsible AI)',
    ],
    requirements: ['Kiến thức Machine Learning cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Đạo đức và Bias trong AI',
        lessons: [
          {
            title:
              'Bài 1.1: Các Vấn đề Đạo đức (Công bằng, Minh bạch, Trách nhiệm)',
            content: 'Phân tích các rủi ro xã hội của AI.',
          },
          {
            title:
              'Bài 1.2: Phân loại và Đo lường Bias (Thiên vị) trong Dữ liệu',
            content: 'Tìm hiểu nguồn gốc của sự thiếu công bằng.',
          },
        ],
      },
      {
        title: 'Chương 2: Giải thích AI (XAI)',
        lessons: [
          {
            title: 'Bài 2.1: Phương pháp Local Explainability (LIME, SHAP)',
            content: 'Giải thích lý do mô hình đưa ra quyết định cụ thể.',
          },
          {
            title: 'Bài 2.2: Global Explainability và Feature Importance',
            content: 'Hiểu tổng quan về cách mô hình học.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Dữ Liệu Âm Thanh và Xử Lý Giọng Nói',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Học các kỹ thuật xử lý tín hiệu và Deep Learning để phân tích âm thanh, nhận dạng giọng nói (ASR), nhận dạng cảm xúc và phân loại âm thanh.',
    learnings: [
      'Cơ bản về Tín hiệu Âm thanh (Spectrograms, Mel-Frequency Cepstral Coefficients)',
      'Sử dụng Mạng Nơ-ron Hồi quy (RNNs) và Tích chập (CNNs) cho Âm thanh',
      'Xây dựng Hệ thống Nhận dạng Giọng nói (ASR) cơ bản',
      'Nhận dạng Cảm xúc từ Giọng nói',
    ],
    requirements: ['Kiến thức Python, Thống kê và Deep Learning cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Xử lý Tín hiệu Âm thanh',
        lessons: [
          {
            title: 'Bài 1.1: Tín hiệu số và Feature Extraction (MFCCs)',
            content: 'Chuyển đổi âm thanh thô thành dữ liệu số.',
          },
          {
            title: 'Bài 1.2: Trực quan hóa Spectrograms',
            content: 'Hiển thị dữ liệu âm thanh dưới dạng hình ảnh.',
          },
        ],
      },
      {
        title: 'Chương 2: Deep Learning cho Âm thanh',
        lessons: [
          {
            title:
              'Bài 2.1: Mô hình ASR (Connectionist Temporal Classification - CTC)',
            content: 'Xây dựng hệ thống nhận dạng giọng nói.',
          },
          {
            title: 'Bài 2.2: Phân loại Cảm xúc từ Giọng nói',
            content: 'Sử dụng CNNs để phân loại cảm xúc.',
          },
        ],
      },
    ],
  },
  {
    title: 'Học Máy Liên Bang (Federated Learning) và AI Phân Tán',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Nguyễn Thanh Tùng',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1999000,
    originalPrice: 2800000,
    discount: 28,
    discountExpiresAt: null,
    description:
      'Học cách huấn luyện các mô hình AI trên dữ liệu phân tán (như thiết bị di động) mà không cần thu thập dữ liệu về máy chủ trung tâm, bảo vệ quyền riêng tư người dùng.',
    learnings: [
      'Nguyên tắc của Federated Learning và Ưu/Nhược điểm',
      'Thuật toán Federated Averaging (FedAvg)',
      'Các thách thức về Non-IID Data và Communication Efficiency',
      'Sử dụng Framework (như PySyft hoặc TensorFlow Federated)',
    ],
    requirements: ['Kinh nghiệm Python và Deep Learning'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Khái niệm Federated Learning',
        lessons: [
          {
            title: 'Bài 1.1: Lý do và Lợi ích về Quyền riêng tư',
            content: 'Tại sao cần học tập trên dữ liệu phân tán.',
          },
          {
            title: 'Bài 1.2: Cơ chế Federated Averaging (FedAvg)',
            content: 'Cách các Clients và Server trao đổi thông tin.',
          },
        ],
      },
      {
        title: 'Chương 2: Thách thức và Triển khai',
        lessons: [
          {
            title: 'Bài 2.1: Xử lý dữ liệu Non-IID và Data Heterogeneity',
            content: 'Giải quyết vấn đề dữ liệu không đồng nhất.',
          },
          {
            title: 'Bài 2.2: Triển khai với Framework (PySyft/TFF)',
            content: 'Thực hành huấn luyện mô hình phân tán.',
          },
        ],
      },
    ],
  },
  {
    title: 'Xây dựng Hệ thống Trợ lý Ảo (Conversational AI)',
    categoryName: 'Trí Tuệ Nhân Tạo',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1699000,
    originalPrice: 2300000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Thiết kế và phát triển các Chatbots và Trợ lý ảo thông minh (Alexa, Siri style) bằng cách sử dụng các framework NLP (Rasa, Dialogflow) và tích hợp LLMs.',
    learnings: [
      'Thiết kế Luồng hội thoại (Conversation Flow) và User Intent',
      'Sử dụng Framework Rasa để xây dựng mô hình NLU (NLG)',
      'Tích hợp Chatbot vào các kênh (Web, Messenger)',
      'Sử dụng LLMs để tăng cường khả năng đối thoại (Generative Responses)',
    ],
    requirements: ['Kinh nghiệm Python và NLP cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thiết kế và Xử lý Ngôn ngữ',
        lessons: [
          {
            title: 'Bài 1.1: Intent Recognition và Entity Extraction',
            content: 'Xác định mục đích và thông tin quan trọng trong câu nói.',
          },
          {
            title: 'Bài 1.2: Rasa NLU/Core Architecture',
            content: 'Cấu trúc và cách hoạt động của framework Rasa.',
          },
        ],
      },
      {
        title: 'Chương 2: Tích hợp và Triển khai',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng các Stories và Custom Actions',
            content: 'Định nghĩa luồng hội thoại và các hành động của Bot.',
          },
          {
            title: 'Bài 2.2: Tích hợp và Deploy Chatbot (Cloud/Container)',
            content: 'Đưa Bot vào môi trường sản xuất.',
          },
        ],
      },
    ],
  },

  // ------------------------Marketing----------------

  {
    title: 'Masterclass Digital Marketing Toàn Diện 2024',
    categoryName: 'Marketing',
    instructorName: 'Phạm Thị Hương',
    level: 'Cơ Bản',
    duration: 3600 * 30,
    price: 1399000,
    originalPrice: 2100000,
    discount: 33,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Tổng quan và thực hành các kênh Digital Marketing cốt lõi: SEO, SEM, Content Marketing, Email Marketing và Social Media.',
    learnings: [
      'Xây dựng chiến lược Digital Marketing tổng thể (Omni-channel)',
      'Thành thạo công cụ Google Analytics 4 (GA4)',
      'Quản lý và tối ưu hóa các chiến dịch quảng cáo cơ bản',
      'Đo lường hiệu suất và tính toán ROI Marketing',
    ],
    requirements: ['Không yêu cầu kinh nghiệm Marketing'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Chiến lược và Nền tảng',
        lessons: [
          {
            title:
              'Bài 1.1: Khái niệm Digital Marketing và Hành trình Khách hàng',
            content: 'Hiểu các giai đoạn tương tác của khách hàng.',
          },
          {
            title: 'Bài 1.2: Thiết lập Google Analytics 4 và Tracking cơ bản',
            content: 'Thiết lập các mục tiêu và sự kiện đo lường.',
          },
        ],
      },
      {
        title: 'Chương 2: Các Kênh Chính',
        lessons: [
          {
            title: 'Bài 2.1: Giới thiệu SEO và Search Marketing',
            content: 'Cách thức hoạt động của công cụ tìm kiếm.',
          },
          {
            title: 'Bài 2.2: Email Marketing và Automation cơ bản',
            content: 'Xây dựng danh sách và thiết lập chuỗi email tự động.',
          },
        ],
      },
    ],
  },
  {
    title: 'Content Marketing: Sáng Tạo Nội Dung Bán Hàng Đa Kênh',
    categoryName: 'Marketing',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1199000,
    originalPrice: 1700000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Học cách nghiên cứu, lập kế hoạch, sản xuất và tối ưu hóa nội dung cho Blog, Video, Social Media và Website để thu hút khách hàng tiềm năng.',
    learnings: [
      'Nghiên cứu đối tượng và lập Content Pillars',
      'Kỹ thuật viết Copywriting chuyển đổi cao (AIDA, PAS)',
      'Xây dựng Content Calendar và quy trình sản xuất hiệu quả',
      'Đo lường hiệu suất nội dung (Engagement, Conversion Rate)',
    ],
    requirements: ['Hiểu biết cơ bản về Marketing'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nghiên cứu và Chiến lược Nội dung',
        lessons: [
          {
            title: 'Bài 1.1: Buyer Persona và Content Mapping',
            content:
              'Thiết kế nội dung phù hợp với từng giai đoạn của khách hàng.',
          },
          {
            title: 'Bài 1.2: Kỹ thuật Copywriting và Headline hấp dẫn',
            content: 'Viết nội dung thu hút sự chú ý.',
          },
        ],
      },
      {
        title: 'Chương 2: Phân phối và Đo lường',
        lessons: [
          {
            title: 'Bài 2.1: Tối ưu hóa Content cho SEO và Social',
            content: 'Phân phối nội dung trên các kênh khác nhau.',
          },
          {
            title:
              'Bài 2.2: Phân tích các Metrics về Content (Views, Shares, Leads)',
            content: 'Đánh giá mức độ thành công của nội dung.',
          },
        ],
      },
    ],
  },
  {
    title:
      'SEO Chuyên Sâu: Tối Ưu Hóa Kỹ Thuật (Technical SEO) và Xây Dựng Backlink',
    categoryName: 'Marketing',
    instructorName: 'Trần Lệ Quyên',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học tập trung vào các yếu tố SEO phức tạp: Tối ưu tốc độ, Mobile-First, Structured Data, và các chiến lược Link Building nâng cao.',
    learnings: [
      'Thành thạo kiểm tra và sửa lỗi Technical SEO (Crawlability, Indexing)',
      'Sử dụng Schema Markup và Structured Data',
      'Phân tích đối thủ và xây dựng chiến lược Backlink chất lượng (Outreach)',
      'Tối ưu Core Web Vitals và trải nghiệm người dùng (UX/SEO)',
    ],
    requirements: ['Kiến thức cơ bản về SEO và HTML/CSS'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Technical SEO và Tốc độ',
        lessons: [
          {
            title:
              'Bài 1.1: Sơ đồ Website (Sitemap), Robots.txt và Crawl Budget',
            content: 'Quản lý cách Google thu thập dữ liệu.',
          },
          {
            title: 'Bài 1.2: Phân tích Core Web Vitals (LCP, FID, CLS)',
            content: 'Tối ưu hóa các chỉ số trải nghiệm người dùng.',
          },
        ],
      },
      {
        title: 'Chương 2: Link Building và Nâng cao',
        lessons: [
          {
            title: 'Bài 2.1: Chiến lược Guest Posting và Broken Link Building',
            content: 'Các phương pháp xây dựng liên kết hiệu quả.',
          },
          {
            title: 'Bài 2.2: Local SEO và Google My Business',
            content: 'Tối ưu hóa cho tìm kiếm địa phương.',
          },
        ],
      },
    ],
  },
  {
    title: 'Google Ads (PPC) Chuyên Sâu: Tối Ưu Chuyển Đổi',
    categoryName: 'Marketing',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 30,
    price: 1699000,
    originalPrice: 2200000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Từ thiết lập chiến dịch Tìm kiếm, Hiển thị, Mua sắm (Shopping) đến các chiến lược đặt giá thầu (Bidding) tự động và tối ưu hóa Quality Score.',
    learnings: [
      'Xây dựng cấu trúc tài khoản Google Ads tối ưu (SKAG, STAG)',
      'Sử dụng các chiến lược đặt giá thầu tự động (Smart Bidding)',
      'Tối ưu Hạng chất lượng (Quality Score) và Ad Copywriting',
      'Thiết lập Chiến dịch Mua sắm và P-Max',
    ],
    requirements: ['Kiến thức cơ bản về Quảng cáo trực tuyến'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cấu trúc Chiến dịch và Keywords',
        lessons: [
          {
            title: 'Bài 1.1: Nghiên cứu Keywords và Match Types',
            content:
              'Tìm kiếm từ khóa phù hợp và cách sử dụng các loại đối sánh.',
          },
          {
            title: 'Bài 1.2: Tối ưu Quality Score và Ad Group Structure',
            content: 'Cải thiện điểm chất lượng để giảm chi phí.',
          },
        ],
      },
      {
        title: 'Chương 2: Bidding, Automation và Shopping Ads',
        lessons: [
          {
            title: 'Bài 2.1: Thử nghiệm các chiến lược Smart Bidding',
            content: 'Sử dụng AI của Google để tối ưu hóa giá thầu.',
          },
          {
            title: 'Bài 2.2: Thiết lập Google Merchant Center và Shopping Ads',
            content: 'Chạy quảng cáo sản phẩm hiệu quả.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Facebook Ads và TikTok Ads: Thu Hút Khách Hàng Tiềm Năng (Lead Generation)',
    categoryName: 'Marketing',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 28,
    price: 1599000,
    originalPrice: 2100000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các thuật toán quảng cáo trên Facebook và TikTok, tập trung vào việc nhắm mục tiêu sâu, tối ưu hóa Creative và thu thập Leads.',
    learnings: [
      'Nghiên cứu và tạo các Audience tùy chỉnh (Custom, Lookalike)',
      'Tối ưu hóa Creative (Hình ảnh/Video) cho từng nền tảng',
      'Sử dụng Campaign Budget Optimization (CBO) và A/B Testing',
      'Thiết lập Lead Ads, Conversion API và Đo lường LTV',
    ],
    requirements: ['Kinh nghiệm cơ bản sử dụng các nền tảng Social Media'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Facebook Ads và Nhắm mục tiêu',
        lessons: [
          {
            title: 'Bài 1.1: Cấu trúc Chiến dịch Facebook và Pixel Tracking',
            content: 'Thiết lập trình quản lý quảng cáo và Pixel.',
          },
          {
            title:
              'Bài 1.2: Tạo Custom Audience và Lookalike Audience hiệu quả',
            content: 'Nhắm mục tiêu sâu và mở rộng tệp khách hàng.',
          },
        ],
      },
      {
        title: 'Chương 2: TikTok Ads và Creative Strategy',
        lessons: [
          {
            title: 'Bài 2.1: Đặc điểm Quảng cáo TikTok và Content Creator',
            content: 'Xây dựng video quảng cáo phù hợp với xu hướng TikTok.',
          },
          {
            title: 'Bài 2.2: Tối ưu hóa cho Lead Generation và Conversions',
            content: 'Thiết lập các mục tiêu chuyển đổi.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Phân Tích Dữ Liệu Marketing (Marketing Analytics) với GA4 và BigQuery',
    categoryName: 'Marketing',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1999000,
    originalPrice: 2800000,
    discount: 28,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ việc thu thập, làm sạch và phân tích sâu dữ liệu Marketing bằng Google Analytics 4, kết hợp với BigQuery và công cụ Trực quan hóa (Looker Studio/Tableau).',
    learnings: [
      'Thiết lập Event-based Model trong GA4 và GTM',
      'Xuất dữ liệu GA4 sang BigQuery và truy vấn bằng SQL',
      'Tính toán các Metrics quan trọng (CAC, LTV, ROI) [Formula for Customer Lifetime Value (LTV): $LTV = \text{Average Purchase Value} \times \text{Average Purchase Frequency} \times \text{Average Customer Lifespan}$]',
      'Xây dựng các Dashboard Phân tích Hiệu suất Chiến dịch',
    ],
    requirements: ['Kinh nghiệm sử dụng GA cơ bản và SQL cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: GA4 và Mô hình Dữ liệu Sự kiện',
        lessons: [
          {
            title: 'Bài 1.1: Chuyển đổi từ Universal Analytics sang GA4',
            content: 'Hiểu sự khác biệt giữa Session-based và Event-based.',
          },
          {
            title:
              'Bài 1.2: Google Tag Manager (GTM) và Thiết lập Sự kiện tùy chỉnh',
            content: 'Thực hành đo lường các hành vi người dùng.',
          },
        ],
      },
      {
        title: 'Chương 2: Phân tích Nâng cao với BigQuery',
        lessons: [
          {
            title: 'Bài 2.1: Kết nối GA4 và BigQuery (Exporting Data)',
            content: 'Làm việc với dữ liệu thô (Raw Data) của GA4.',
          },
          {
            title: 'Bài 2.2: Tính toán LTV và Phân tích Cohort bằng SQL',
            content: 'Phân tích giá trị lâu dài và hành vi theo nhóm.',
          },
        ],
      },
    ],
  },
  {
    title: 'Chiến Lược Thương Hiệu (Branding) và Định Vị Thị Trường',
    categoryName: 'Marketing',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 20,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Xây dựng một Thương hiệu mạnh mẽ từ cốt lõi, từ việc xác định giá trị, định vị trong tâm trí khách hàng đến phát triển Brand Identity (Nhận diện Thương hiệu).',
    learnings: [
      'Xác định Brand Core (Tầm nhìn, Sứ mệnh, Giá trị cốt lõi)',
      'Kỹ thuật Định vị Thương hiệu (Positioning Statement) [Framework: For [Target Audience] who [Need], [Product] is the [Category] that [Benefit]]',
      'Phát triển Brand Voice và Tone',
      'Quản lý Brand Equity và Đo lường Sức khỏe Thương hiệu',
    ],
    requirements: ['Quan tâm đến xây dựng thương hiệu'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cốt lõi Thương hiệu',
        lessons: [
          {
            title: 'Bài 1.1: Phân biệt Brand, Marketing và Advertising',
            content: 'Vai trò của Thương hiệu trong chiến lược kinh doanh.',
          },
          {
            title: 'Bài 1.2: Xác định Brand Archetype và Brand Personality',
            content: 'Định hình tính cách cho thương hiệu.',
          },
        ],
      },
      {
        title: 'Chương 2: Định vị và Ứng dụng',
        lessons: [
          {
            title:
              'Bài 2.1: Viết Positioning Statement và USP (Unique Selling Proposition)',
            content: 'Xác định lợi thế cạnh tranh.',
          },
          {
            title: 'Bài 2.2: Tích hợp Brand Identity vào Marketing Mix (4Ps)',
            content: 'Đảm bảo sự đồng nhất trên mọi điểm chạm.',
          },
        ],
      },
    ],
  },
  {
    title: 'Email Marketing và Marketing Automation Nâng Cao',
    categoryName: 'Marketing',
    instructorName: 'Phạm Thị Hương',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Sử dụng các công cụ Marketing Automation (HubSpot, Mailchimp, ActiveCampaign) để cá nhân hóa, phân đoạn khách hàng và thiết lập các chiến dịch Drip/Nurturing phức tạp.',
    learnings: [
      'Phân đoạn khách hàng (Segmentation) dựa trên hành vi',
      'Thiết lập các Workflow Marketing Automation phức tạp (Lead Nurturing)',
      'Tối ưu Tỷ lệ Mở (Open Rate) và Tỷ lệ Nhấp (CTR)',
      'Kỹ thuật A/B Testing cho Subject Line, Content và Timing',
    ],
    requirements: ['Kinh nghiệm sử dụng Email Marketing cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Automation và Phân đoạn',
        lessons: [
          {
            title: 'Bài 1.1: CRM và Tích hợp Automation Tools',
            content: 'Kết nối dữ liệu khách hàng với công cụ tự động hóa.',
          },
          {
            title:
              'Bài 1.2: Kỹ thuật Phân đoạn dựa trên Điểm số (Lead Scoring)',
            content: 'Xác định khách hàng tiềm năng nóng.',
          },
        ],
      },
      {
        title: 'Chương 2: Xây dựng Workflow Nâng cao',
        lessons: [
          {
            title:
              'Bài 2.1: Thiết lập Abandoned Cart và Welcome Series Automation',
            content: 'Tạo các chuỗi email tự động dựa trên hành vi.',
          },
          {
            title:
              'Bài 2.2: Cá nhân hóa Nội dung (Dynamic Content) và Deliverability',
            content: 'Cải thiện khả năng email vào hộp thư đến.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thấu Hiểu Khách Hàng và Nghiên Cứu Thị Trường (Market Research)',
    categoryName: 'Marketing',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description:
      'Học các phương pháp nghiên cứu định lượng và định tính để khám phá nhu cầu, hành vi và động lực của khách hàng, làm cơ sở cho mọi quyết định Marketing.',
    learnings: [
      'Thiết kế và triển khai Khảo sát (Surveys) và Phỏng vấn (Interviews)',
      'Phân tích SWOT, PESTEL và Phân tích Cạnh tranh',
      'Phân khúc Thị trường (Segmentation) và Xác định Mục tiêu (Targeting)',
      'Đánh giá tính khả thi của Sản phẩm/Thị trường mới',
    ],
    requirements: ['Khả năng tư duy logic và phân tích'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Phương pháp Nghiên cứu',
        lessons: [
          {
            title:
              'Bài 1.1: Nghiên cứu Định tính (Focus Groups, Depth Interviews)',
            content: 'Thu thập insights sâu sắc về khách hàng.',
          },
          {
            title:
              'Bài 1.2: Nghiên cứu Định lượng (Survey Design và Data Analysis)',
            content: 'Sử dụng dữ liệu số để xác nhận giả thuyết.',
          },
        ],
      },
      {
        title: 'Chương 2: Phân tích Thị trường và Định vị',
        lessons: [
          {
            title: 'Bài 2.1: Phân tích Cạnh tranh và Ma trận Định vị',
            content: 'Xác định vị thế của doanh nghiệp so với đối thủ.',
          },
          {
            title: 'Bài 2.2: Xây dựng Customer Journey Map và Pain Points',
            content: 'Hiểu rõ hành trình và các điểm đau của khách hàng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Product Marketing: Ra Mắt và Tăng Trưởng Sản Phẩm (Go-to-Market)',
    categoryName: 'Marketing',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 28,
    price: 2099000,
    originalPrice: 2800000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Nắm vững vai trò của Product Marketing: kết nối Phát triển Sản phẩm, Sales và Marketing để đảm bảo sản phẩm được định vị đúng và ra mắt thành công.',
    learnings: [
      'Thiết kế chiến lược Go-to-Market (GTM) cho sản phẩm mới',
      'Xác định Product-Market Fit và Value Proposition',
      'Phát triển Messaging và Sales Enablement Content',
      'Quản lý Vòng đời Sản phẩm (Product Lifecycle)',
    ],
    requirements: ['Kinh nghiệm Marketing hoặc Product Management'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Định vị Sản phẩm và Giá trị',
        lessons: [
          {
            title: 'Bài 1.1: Value Proposition Design và Target Persona',
            content: 'Thiết kế đề xuất giá trị độc đáo.',
          },
          {
            title:
              'Bài 1.2: Phân tích Cạnh tranh cho Sản phẩm (Feature/Benefit Matrix)',
            content: 'So sánh tính năng và lợi ích.',
          },
        ],
      },
      {
        title: 'Chương 2: Chiến lược GTM và Tăng trưởng',
        lessons: [
          {
            title:
              'Bài 2.1: Quy trình Launch Sản phẩm (Alpha, Beta, General Availability)',
            content: 'Các bước ra mắt sản phẩm chính thức.',
          },
          {
            title: 'Bài 2.2: Product Adoption, Churn Analysis và Tăng trưởng',
            content: 'Phân tích hành vi sử dụng sản phẩm của khách hàng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Inbound Marketing và Xây dựng Phễu Chuyển Đổi (Funnel)',
    categoryName: 'Marketing',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1299000,
    originalPrice: 1700000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào triết lý Inbound Marketing: thu hút, chuyển đổi, chốt bán và làm hài lòng khách hàng bằng nội dung và giá trị hữu ích, không phải quảng cáo xâm lấn.',
    learnings: [
      'Thiết kế Marketing Funnel (TOFU, MOFU, BOFU)',
      'Sử dụng Lead Magnet và Content Gated để thu thập Lead',
      'Tích hợp SEO, Content và Email Marketing trong Funnel',
      'Tự động hóa Nurturing Lead để chuyển đổi',
    ],
    requirements: ['Kiến thức về Content Marketing'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thiết kế Phễu Inbound',
        lessons: [
          {
            title: 'Bài 1.1: Triết lý Inbound vs Outbound Marketing',
            content: 'Sự khác biệt cốt lõi trong tư duy thu hút khách hàng.',
          },
          {
            title: 'Bài 1.2: Thiết kế Lead Magnet (Ebook, Checklist) hiệu quả',
            content: 'Tạo tài nguyên có giá trị để đổi lấy thông tin.',
          },
        ],
      },
      {
        title: 'Chương 2: Tự động hóa và Nurturing',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng Nurturing Workflow dựa trên hành vi',
            content: 'Gửi nội dung phù hợp theo từng giai đoạn của khách hàng.',
          },
          {
            title: 'Bài 2.2: Tối ưu hóa Landing Page và Tỷ lệ Chuyển đổi (CRO)',
            content: 'Làm tăng khả năng chuyển đổi người truy cập.',
          },
        ],
      },
    ],
  },

  // ---------------Lap Trinh Di Dong----------------------

  {
    title: 'Flutter Toàn Diện: Xây Dựng Ứng Dụng Đa Nền Tảng với Dart',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Trần Thị Mai',
    level: 'Cơ Bản',
    duration: 3600 * 45,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng các ứng dụng đẹp mắt, hiệu suất cao cho iOS, Android, Web và Desktop từ một codebase duy nhất bằng Flutter và ngôn ngữ Dart.',
    learnings: [
      'Nắm vững ngôn ngữ Dart và các khái niệm cơ bản của Flutter',
      'Xây dựng giao diện người dùng bằng Stateless và Stateful Widgets',
      'Quản lý trạng thái (State Management) với Provider/Riverpod',
      'Tích hợp API RESTful và Firebase',
    ],
    requirements: ['Kiến thức lập trình cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Dart và Widgets',
        lessons: [
          {
            title: 'Bài 1.1: Giới thiệu Dart và Lập trình Hướng đối tượng',
            content: 'Làm quen với cú pháp và các tính năng của Dart.',
          },
          {
            title: 'Bài 1.2: Xây dựng UI với Widgets (Layouts, Themes)',
            content: 'Thực hành các Widgets cơ bản và cách tổ chức bố cục.',
          },
        ],
      },
      {
        title: 'Chương 2: State Management và Data',
        lessons: [
          {
            title: 'Bài 2.1: Quản lý Trạng thái cơ bản với Provider',
            content: 'Hiểu cách cập nhật dữ liệu UI hiệu quả.',
          },
          {
            title: 'Bài 2.2: Tích hợp API và Xử lý JSON',
            content: 'Thực hiện các cuộc gọi mạng và xử lý dữ liệu.',
          },
        ],
      },
    ],
  },
  {
    title: 'React Native Expert: Xây Dựng Ứng Dụng Thực Tế và Performance',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 40,
    price: 2199000,
    originalPrice: 3000000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các kỹ thuật nâng cao trong React Native, từ State Management phức tạp (Redux/Zustand), Native Modules đến tối ưu hóa hiệu suất và CI/CD.',
    learnings: [
      'Làm chủ React Hooks và Context API',
      'Quản lý trạng thái phức tạp với Redux Toolkit/Zustand',
      'Viết Native Modules bằng Swift/Kotlin khi cần',
      'Tối ưu hóa bundle size và hiệu suất hiển thị (FlatList)',
    ],
    requirements: ['Thành thạo JavaScript và React.js'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: State Nâng Cao và Tối ưu',
        lessons: [
          {
            title: 'Bài 1.1: State Management với Redux Toolkit',
            content: 'Quản lý trạng thái ứng dụng lớn.',
          },
          {
            title: 'Bài 1.2: Tối ưu hóa Performance và Memory Leaks',
            content: 'Cải thiện tốc độ tải và giảm tiêu thụ bộ nhớ.',
          },
        ],
      },
      {
        title: 'Chương 2: Native Modules và Triển khai',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng Native Modules (Swift/Kotlin)',
            content: 'Tương tác với các tính năng Native không có trong JS.',
          },
          {
            title: 'Bài 2.2: CI/CD cho React Native (Fastlane)',
            content: 'Tự động hóa quá trình build và deploy.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình Android Hiện Đại với Kotlin và Jetpack Compose',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 40,
    price: 1999000,
    originalPrice: 2700000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng ứng dụng Android Native bằng ngôn ngữ Kotlin và sử dụng bộ công cụ UI khai báo hiện đại: Jetpack Compose.',
    learnings: [
      'Nắm vững Kotlin Coroutines cho lập trình bất đồng bộ',
      'Sử dụng Jetpack Compose để xây dựng UI hiện đại',
      'Áp dụng Architecture Components (ViewModel, LiveData/Flow, Room)',
      'Navigation Component và Dependency Injection (Hilt)',
    ],
    requirements: ['Kiến thức lập trình Hướng đối tượng (OOP) cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Kotlin và Coroutines',
        lessons: [
          {
            title:
              'Bài 1.1: Kotlin Fundamentals và Android Development Environment',
            content: 'Các tính năng hiện đại của Kotlin.',
          },
          {
            title: 'Bài 1.2: Xử lý Bất đồng bộ với Coroutines và Flow',
            content: 'Quản lý các tác vụ chạy nền hiệu quả.',
          },
        ],
      },
      {
        title: 'Chương 2: Jetpack Compose và Architecture',
        lessons: [
          {
            title: 'Bài 2.1: Composable Functions và State Management',
            content: 'Xây dựng UI khai báo với Compose.',
          },
          {
            title: 'Bài 2.2: MVVM Architecture và Hilt DI',
            content: 'Thiết kế ứng dụng Android theo chuẩn công nghiệp.',
          },
        ],
      },
    ],
  },
  {
    title: 'Android Nâng Cao: Tối Ưu Hiệu Suất và Xử Lý Background',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1699000,
    originalPrice: 2200000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Đi sâu vào các chủ đề Android phức tạp: Tối ưu pin, WorkManager cho Background Tasks, Custom Views và Unit Testing/Instrumentation Testing.',
    learnings: [
      'Quản lý các tác vụ nền hiệu quả với WorkManager',
      'Tối ưu hóa việc sử dụng Pin và Data',
      'Xây dựng Custom Views và View Animations',
      'Viết Unit Test và Instrumentation Test (Espresso)',
    ],
    requirements: ['Kinh nghiệm lập trình Android Native'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Background Processing',
        lessons: [
          {
            title: 'Bài 1.1: WorkManager và Constraints (Network, Battery)',
            content: 'Lên lịch các tác vụ đảm bảo chạy.',
          },
          {
            title: 'Bài 1.2: Tối ưu hóa Pin và Power Management APIs',
            content: 'Phát triển ứng dụng thân thiện với pin.',
          },
        ],
      },
      {
        title: 'Chương 2: Tùy chỉnh UI và Testing',
        lessons: [
          {
            title: 'Bài 2.1: Xây dựng Custom Composables và Custom Layouts',
            content: 'Thiết kế các thành phần UI độc đáo.',
          },
          {
            title: 'Bài 2.2: Unit Testing và Mocking Dependencies',
            content: 'Đảm bảo chất lượng mã nguồn.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình iOS Hiện Đại với Swift và SwiftUI',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 40,
    price: 1999000,
    originalPrice: 2700000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ ngôn ngữ Swift và sử dụng framework SwiftUI khai báo để xây dựng các ứng dụng iOS, iPadOS và macOS hiện đại.',
    learnings: [
      'Nắm vững ngôn ngữ Swift (Optional, Protocol, Generics)',
      'Xây dựng UI bằng SwiftUI (Views, Modifiers, Data Flow)',
      'Quản lý trạng thái với State, Binding và Observable Objects',
      'Tích hợp Core Data/Realm và Network Layer (Async/Await)',
    ],
    requirements: ['Kiến thức lập trình Hướng đối tượng (OOP) cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Swift Fundamentals và Xcode',
        lessons: [
          {
            title:
              'Bài 1.1: Swift Programming Language (Data Types, Control Flow)',
            content: 'Học các tính năng cốt lõi của Swift.',
          },
          {
            title: 'Bài 1.2: Xcode và Interface Builder (Tùy chọn)',
            content: 'Làm quen với môi trường phát triển của Apple.',
          },
        ],
      },
      {
        title: 'Chương 2: SwiftUI và Data Flow',
        lessons: [
          {
            title: 'Bài 2.1: Views, Modifiers và Layouts trong SwiftUI',
            content: 'Xây dựng giao diện bằng code khai báo.',
          },
          {
            title:
              'Bài 2.2: State Management (@State, @Binding, @ObservedObject)',
            content: 'Quản lý dữ liệu thay đổi trong UI.',
          },
        ],
      },
    ],
  },
  {
    title: 'iOS Nâng Cao: Design Patterns và Tối Ưu Hóa Memory',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các Design Patterns (MVVM, VIPER, Redux-like), quản lý Memory (ARC), Concurrency và các kỹ thuật Testing chuyên sâu trong iOS.',
    learnings: [
      'Áp dụng các Design Patterns (MVVM, VIPER)',
      'Quản lý Concurrency với Grand Central Dispatch (GCD) và Operation Queues',
      'Hiểu và giải quyết Memory Leaks (Strong Reference Cycles) bằng ARC',
      'Viết Unit Test và UI Test chuyên nghiệp',
    ],
    requirements: ['Kinh nghiệm lập trình iOS Native'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Architecture và Memory Management',
        lessons: [
          {
            title: 'Bài 1.1: Design Patterns (MVVM) trong SwiftUI',
            content: 'Thiết kế ứng dụng dễ bảo trì và kiểm thử.',
          },
          {
            title:
              'Bài 1.2: Automatic Reference Counting (ARC) và Giải quyết Retain Cycles',
            content: 'Quản lý bộ nhớ hiệu quả.',
          },
        ],
      },
      {
        title: 'Chương 2: Concurrency và Testing',
        lessons: [
          {
            title: 'Bài 2.1: Sử dụng Async/Await và Task Group',
            content: 'Thực hiện các tác vụ bất đồng bộ một cách an toàn.',
          },
          {
            title: 'Bài 2.2: Unit Test và UI Test với XCTest',
            content: 'Kiểm tra logic nghiệp vụ và giao diện.',
          },
        ],
      },
    ],
  },
  {
    title: 'Firebase Toàn Diện cho Phát Triển Ứng Dụng Di Động',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1199000,
    originalPrice: 1600000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Sử dụng Firebase (BaaS) cho Authentication, Realtime Database/Firestore, Cloud Functions và Analytics để xây dựng backend nhanh chóng cho ứng dụng di động.',
    learnings: [
      'Triển khai Xác thực (Authentication) bằng Email, Google và Social Logins',
      'Làm việc với Firestore (NoSQL Database) và Realtime Sync',
      'Sử dụng Cloud Functions để tạo Logic Backend Serverless',
      'Tích hợp Push Notifications và Crashlytics',
    ],
    requirements: ['Kiến thức lập trình Di động (Android/iOS/Flutter)'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Authentication và Database',
        lessons: [
          {
            title:
              'Bài 1.1: Firebase Authentication (Email/Password và Social)',
            content: 'Quản lý người dùng và phiên đăng nhập.',
          },
          {
            title: 'Bài 1.2: Thiết kế Database (Firestore) và Querying',
            content: 'Lưu trữ và truy vấn dữ liệu theo thời gian thực.',
          },
        ],
      },
      {
        title: 'Chương 2: Serverless và Tăng trưởng',
        lessons: [
          {
            title: 'Bài 2.1: Cloud Functions (Node.js) cho Logic Backend',
            content: 'Viết code chạy trên server mà không cần quản lý server.',
          },
          {
            title: 'Bài 2.2: Cloud Messaging (FCM) và Remote Config',
            content: 'Gửi thông báo và cập nhật cấu hình ứng dụng.',
          },
        ],
      },
    ],
  },
  {
    title: 'AR/VR Mobile Development với ARKit và ARCore',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2099000,
    originalPrice: 2800000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng các trải nghiệm Thực tế Tăng cường (Augmented Reality - AR) hấp dẫn trên thiết bị di động bằng ARKit (iOS) và ARCore (Android/Unity).',
    learnings: [
      'Cơ bản về AR (Tracking, Scene Understanding, Rendering)',
      'Sử dụng ARKit để phát hiện Mặt phẳng và Theo dõi Hình ảnh',
      'Triển khai ARCore cho Android (Java/Kotlin)',
      'Tích hợp 3D Models và Interactivity trong AR Scene',
    ],
    requirements: ['Kinh nghiệm lập trình Di động hoặc Unity cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng AR và Theo dõi',
        lessons: [
          {
            title: 'Bài 1.1: Khái niệm AR/VR và ARKit/ARCore',
            content: 'Sự khác biệt và cách công nghệ này hoạt động.',
          },
          {
            title: 'Bài 1.2: Phát hiện Mặt phẳng (Plane Detection) và Anchors',
            content: 'Neo các đối tượng 3D vào môi trường thực.',
          },
        ],
      },
      {
        title: 'Chương 2: 3D Rendering và Tương tác',
        lessons: [
          {
            title: 'Bài 2.1: Tải và Render 3D Models (USDZ/glTF)',
            content: 'Đưa mô hình vào ứng dụng AR.',
          },
          {
            title: 'Bài 2.2: Tương tác với Objects (Gestures) và Physics',
            content: 'Xây dựng các trò chơi hoặc ứng dụng AR tương tác.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tối Ưu Hóa App Store (ASO) và Chiến Lược Monetization',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các chiến lược Marketing và Tối ưu hóa để tăng khả năng hiển thị (Visibility) của ứng dụng trên App Store và Google Play, cùng với các mô hình kiếm tiền hiệu quả.',
    learnings: [
      'Nghiên cứu từ khóa (Keyword Research) cho ASO',
      'Tối ưu hóa Tiêu đề, Mô tả và Screenshots/Videos',
      'Phân tích Ratings và Reviews để cải thiện ASO',
      'Các mô hình Monetization (In-app Purchase, Subscription, Ads)',
    ],
    requirements: ['Quan tâm đến việc phát hành ứng dụng di động'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Các Yếu tố ASO',
        lessons: [
          {
            title: 'Bài 1.1: Tối ưu hóa Tiêu đề và Phụ đề/Mô tả ngắn',
            content: 'Sử dụng từ khóa hiệu quả nhất.',
          },
          {
            title: 'Bài 1.2: Screenshot, Icon và App Preview Video',
            content: 'Thiết kế để tăng tỷ lệ chuyển đổi.',
          },
        ],
      },
      {
        title: 'Chương 2: Monetization và Tăng trưởng',
        lessons: [
          {
            title: 'Bài 2.1: Các Mô hình Kiếm tiền (IAP vs Subscription)',
            content: 'Lựa chọn mô hình phù hợp cho ứng dụng.',
          },
          {
            title: 'Bài 2.2: Phân tích Ratings và Reviews',
            content: 'Quản lý danh tiếng và cải thiện thứ hạng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập trình Game Mobile Cơ bản với Unity và C#',
    categoryName: 'Lập Trình Di Động',
    instructorName: 'Phan Văn An',
    level: 'Cơ Bản',
    duration: 3600 * 35,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu về phát triển Game 2D/3D cho di động bằng Unity Engine và ngôn ngữ C#, bao gồm vật lý, animation và giao diện người dùng game.',
    learnings: [
      'Cơ bản về Unity Editor và ngôn ngữ C#',
      'Xây dựng các hệ thống Vật lý (Physics) và Colliders',
      'Tạo Animation và State Machine cơ bản',
      'Xuất bản Game lên App Store và Google Play',
    ],
    requirements: ['Kiến thức lập trình Hướng đối tượng (OOP) cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Unity Editor và C# Scripting',
        lessons: [
          {
            title: 'Bài 1.1: Giới thiệu Unity Interface và GameObjects',
            content: 'Làm quen với môi trường phát triển game.',
          },
          {
            title: 'Bài 1.2: C# Scripting cho Game Logic (Update, Start)',
            content: 'Viết mã để điều khiển đối tượng game.',
          },
        ],
      },
      {
        title: 'Chương 2: Vật lý, Animation và UI Game',
        lessons: [
          {
            title: 'Bài 2.1: Xử lý Vật lý 2D/3D và Xử lý va chạm',
            content: 'Tạo cảm giác chuyển động thực tế.',
          },
          {
            title: 'Bài 2.2: Hệ thống UI Canvas và Game Menus',
            content: 'Thiết kế giao diện cho người chơi.',
          },
        ],
      },
    ],
  },

  // ----------------------------Lap Trinh Game------------------
  {
    title: 'Unity 3D Toàn Diện: Lập Trình Game AAA với C#',
    categoryName: 'Lập Trình Game',
    instructorName: 'Phan Văn An',
    level: 'Cơ Bản',
    duration: 3600 * 50,
    price: 2299000,
    originalPrice: 3200000,
    discount: 28,
    discountExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description:
      'Học cách sử dụng Unity Editor và ngôn ngữ C# để phát triển các Game 3D chất lượng cao, bao gồm hệ thống vật lý, AI cơ bản và tối ưu đồ họa.',
    learnings: [
      'Nắm vững C# Scripting và Lập trình Hướng đối tượng trong Unity',
      'Xây dựng Hệ thống Vật lý (Physics) và Raycasting',
      'Tạo Animation, State Machine và Cinemachine',
      'Áp dụng Design Patterns (MVC/MVP) trong Game Development',
    ],
    requirements: ['Kiến thức lập trình C# hoặc OOP cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: C# và Cơ chế Unity',
        lessons: [
          {
            title: 'Bài 1.1: C# Scripting cho Game Logic (MonoBehaviour)',
            content: 'Hiểu vòng đời của các script trong Unity.',
          },
          {
            title: 'Bài 1.2: Xây dựng Nhân vật 3D và Hệ thống Input',
            content: 'Điều khiển chuyển động của nhân vật chính.',
          },
        ],
      },
      {
        title: 'Chương 2: Hệ thống Game Play',
        lessons: [
          {
            title: 'Bài 2.1: Quản lý Animation với Animator Component',
            content: 'Tạo chuyển động mượt mà cho nhân vật.',
          },
          {
            title: 'Bài 2.2: AI Cơ bản (Pathfinding và State Machine)',
            content: 'Lập trình hành vi cho kẻ địch hoặc NPC.',
          },
        ],
      },
    ],
  },
  {
    title: 'Unreal Engine 5: Blueprints và C++ cho Game Thế Giới Mở',
    categoryName: 'Lập Trình Game',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 55,
    price: 2499000,
    originalPrice: 3500000,
    discount: 28,
    discountExpiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ Unreal Engine 5, kết hợp lập trình trực quan bằng Blueprints và C++ để xây dựng các Game Thế Giới Mở (Open World) với đồ họa chất lượng điện ảnh (Cinematic Quality).',
    learnings: [
      'Nắm vững giao diện Unreal Editor và Blueprints Visual Scripting',
      'Lập trình Game Logic hiệu suất cao bằng C++',
      'Sử dụng Nanite và Lumen để tối ưu hóa đồ họa',
      'Xây dựng Hệ thống Nhân vật (Character) và Replicating Networking cơ bản',
    ],
    requirements: ['Kiến thức lập trình C++ cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Unreal và Blueprints',
        lessons: [
          {
            title: 'Bài 1.1: Kiến trúc Engine và Actors/Components',
            content: 'Hiểu cách Unreal tổ chức thế giới game.',
          },
          {
            title: 'Bài 1.2: Lập trình Game Logic bằng Blueprints',
            content: 'Xây dựng các tính năng mà không cần viết code.',
          },
        ],
      },
      {
        title: 'Chương 2: C++ và Đồ họa',
        lessons: [
          {
            title: 'Bài 2.1: Tích hợp C++ vào Blueprints và Game Framework',
            content: 'Viết các lớp cơ bản bằng C++.',
          },
          {
            title: 'Bài 2.2: Ánh sáng, Vật liệu (Materials) và Nanite/Lumen',
            content: 'Tối ưu hóa hình ảnh với công nghệ mới nhất.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình AI trong Game: Kẻ Thù Thông Minh và Hành Vi Phức Tạp',
    categoryName: 'Lập Trình Game',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các thuật toán AI quan trọng trong game: Decision Trees, Finite State Machines (FSM), Behavior Trees và Pathfinding (A*).',
    learnings: [
      'Thiết kế và triển khai Finite State Machines cho NPC',
      'Sử dụng Behavior Trees để tạo hành vi phức tạp và module hóa',
      'Triển khai thuật toán Pathfinding (A*) và Navigation Mesh',
      'Tạo Hệ thống Cảm nhận (Perception) cho đối thủ (Vision, Hearing)',
    ],
    requirements: ['Kinh nghiệm Unity/Unreal cơ bản và C#/C++'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: State Machine và Decision Making',
        lessons: [
          {
            title:
              'Bài 1.1: FSM cho các hành vi đơn giản (Idle, Patrol, Attack)',
            content: 'Lập trình các trạng thái cố định.',
          },
          {
            title: 'Bài 1.2: Decision Trees và Utility AI',
            content: 'Lập trình logic ra quyết định phức tạp hơn.',
          },
        ],
      },
      {
        title: 'Chương 2: Behavior Trees và Di chuyển',
        lessons: [
          {
            title:
              'Bài 2.1: Xây dựng Behavior Trees (Selector, Sequence, Leaf)',
            content: 'Tạo hành vi linh hoạt và mở rộng.',
          },
          {
            title: 'Bài 2.2: Thuật toán A* và Navigation Mesh Agents',
            content: 'Tìm kiếm đường đi hiệu quả trong môi trường 3D.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình Đa Người Chơi (Multiplayer) với Unity Netcode',
    categoryName: 'Lập Trình Game',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 2099000,
    originalPrice: 2800000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Học cách xây dựng các Game nhiều người chơi đồng bộ bằng Unity Netcode for GameObjects (Netcode) và giải quyết các vấn đề đồng bộ hóa (Synchronization) và Latency.',
    learnings: [
      'Kiến trúc Client-Server và Host-Client trong Unity Netcode',
      'Đồng bộ hóa Trạng thái (State Synchronization) và RPCs',
      'Xử lý Latency và Prediction cho trải nghiệm mượt mà',
      'Xây dựng Lobby, Matchmaking và quản lý Sessions',
    ],
    requirements: ['Thành thạo Unity và C#'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cơ bản về Networking và Netcode',
        lessons: [
          {
            title: 'Bài 1.1: Các mô hình Multiplayer và Netcode Concepts',
            content: 'Hiểu các vai trò Server/Client.',
          },
          {
            title: 'Bài 1.2: Networked Objects và Network Variables',
            content: 'Đồng bộ hóa dữ liệu giữa các người chơi.',
          },
        ],
      },
      {
        title: 'Chương 2: Đồng bộ hóa và Tối ưu',
        lessons: [
          {
            title: 'Bài 2.1: Remote Procedure Calls (RPCs) và Tương tác',
            content: 'Gọi hàm từ Client sang Server và ngược lại.',
          },
          {
            title: 'Bài 2.2: Xử lý Lag, Reconciliation và Tối ưu Bandwidth',
            content: 'Giảm thiểu độ trễ và giật lag.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Trình Vật Lý và Tương Tác Nâng Cao trong Game',
    categoryName: 'Lập Trình Game',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1699000,
    originalPrice: 2200000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Đi sâu vào các thuật toán vật lý (Collision Detection, Dynamics), giải quyết các ràng buộc (Constraints) và mô phỏng các hiệu ứng vật lý phức tạp (Ragdoll, Soft Body).',
    learnings: [
      'Cơ chế Collision Detection (Sweep, AABB) và Response',
      'Giải quyết các Ràng buộc (Constraints) và Joints',
      'Mô phỏng vật lý Ragdoll và Hệ thống phá hủy (Destruction)',
      'Sử dụng Fixed Timestep và Tối ưu hóa Physics Engine',
    ],
    requirements: ['Kiến thức Toán học (Vector, Đại số Tuyến tính) và C#/C++'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cơ chế Va chạm và Dynamics',
        lessons: [
          {
            title:
              'Bài 1.1: Collision Shapes và Broad-Phase/Narrow-Phase Detection',
            content: 'Xác định va chạm hiệu quả.',
          },
          {
            title: 'Bài 1.2: Lực (Force), Mô-men (Torque) và Ứng dụng',
            content: 'Điều khiển chuyển động vật lý.',
          },
        ],
      },
      {
        title: 'Chương 2: Ragdoll và Tối ưu Physics',
        lessons: [
          {
            title:
              'Bài 2.1: Xây dựng Hệ thống Ragdoll và Inverse Kinematics (IK) cơ bản',
            content: 'Mô phỏng cơ thể mềm dẻo.',
          },
          {
            title: 'Bài 2.2: Tối ưu hóa Physics Tick và Multithreading',
            content: 'Giảm tải cho CPU khi xử lý vật lý.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Game (Game Design) và Lập Trình Hệ Thống Cơ Bản',
    categoryName: 'Lập Trình Game',
    instructorName: 'Trần Thị Mai',
    level: 'Cơ Bản',
    duration: 3600 * 20,
    price: 1099000,
    originalPrice: 1500000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu các nguyên tắc Thiết kế Game (Core Loop, Motivation, Progression) và cách Lập trình các Hệ thống Game cơ bản (Inventory, Save/Load, XP/Leveling).',
    learnings: [
      'Hiểu quy trình Thiết kế Game (GDD - Game Design Document)',
      'Xây dựng Core Gameplay Loop (Vòng lặp Chơi game cốt lõi)',
      'Lập trình Hệ thống Inventory (Túi đồ) và Quản lý Item',
      'Triển khai cơ chế Lưu/Tải Game (Save/Load System)',
    ],
    requirements: ['Kiến thức lập trình cơ bản (bất kỳ ngôn ngữ nào)'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Thiết kế Cơ bản',
        lessons: [
          {
            title:
              'Bài 1.1: Định nghĩa Core Gameplay Loop và Player Motivation',
            content: 'Điều gì khiến người chơi quay lại.',
          },
          {
            title: 'Bài 1.2: Game Design Document (GDD) và Wireframing',
            content: 'Tài liệu hóa ý tưởng game.',
          },
        ],
      },
      {
        title: 'Chương 2: Lập trình Hệ thống Game',
        lessons: [
          {
            title: 'Bài 2.1: Lập trình Hệ thống Inventory và Item Data',
            content: 'Quản lý vật phẩm của người chơi.',
          },
          {
            title: 'Bài 2.2: Hệ thống Leveling, XP và Skill Tree cơ bản',
            content: 'Tạo cảm giác tiến bộ cho người chơi.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tối Ưu Hóa Hiệu Suất (Performance) Game Di Động',
    categoryName: 'Lập Trình Game',
    instructorName: 'Phan Văn An',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Các kỹ thuật tối ưu hóa CPU, GPU, Memory và Build Size để đảm bảo Game chạy mượt mà trên các thiết bị di động (cả Unity và Unreal).',
    learnings: [
      'Phân tích Performance bằng Unity/Unreal Profiler',
      'Tối ưu hóa Draw Calls bằng Batching và Instancing',
      'Sử dụng Object Pooling để giảm thiểu Alllocation và Garbage Collection',
      'Tối ưu hóa Memory và Asset Bundles',
    ],
    requirements: ['Kinh nghiệm lập trình Game Engine'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: CPU và Memory',
        lessons: [
          {
            title:
              'Bài 1.1: Sử dụng Profiler để xác định điểm nghẽn (Bottlenecks)',
            content: 'Tìm kiếm các hàm tốn hiệu suất.',
          },
          {
            title: 'Bài 1.2: Object Pooling và Garbage Collection Optimization',
            content: 'Giảm thiểu chi phí tạo/hủy đối tượng.',
          },
        ],
      },
      {
        title: 'Chương 2: GPU và Đồ họa',
        lessons: [
          {
            title: 'Bài 2.1: Tối ưu hóa Draw Calls (Static/Dynamic Batching)',
            content: 'Giảm tải cho GPU.',
          },
          {
            title:
              'Bài 2.2: Tối ưu hóa Shader, Texture và LODs (Level of Detail)',
            content: 'Quản lý chất lượng đồ họa.',
          },
        ],
      },
    ],
  },
  {
    title: 'Shader và VFX Nâng Cao cho Game (HLSL/ShaderLab)',
    categoryName: 'Lập Trình Game',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    description:
      'Học cách viết các Shader tùy chỉnh bằng HLSL/ShaderLab để tạo hiệu ứng đồ họa độc đáo, bao gồm Post-Processing, Cel Shading và các hiệu ứng Nước/Lửa.',
    learnings: [
      'Cơ bản về Pipeline Đồ họa (Rendering Pipeline)',
      'Viết Vertex và Fragment Shaders (Surface Shaders)',
      'Tạo hiệu ứng Post-Processing (Blur, Color Grading)',
      'Sử dụng Visual Effect Graph (Unity) hoặc Niagara (Unreal)',
    ],
    requirements: ['Kiến thức lập trình C#/C++ và Đại số Tuyến tính cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Kiến thức Shader cơ bản',
        lessons: [
          {
            title: 'Bài 1.1: Rendering Pipeline và Vai trò của Shader',
            content: 'Hiểu quá trình hình ảnh được tạo ra.',
          },
          {
            title: 'Bài 1.2: Viết Vertex và Fragment Shaders cơ bản',
            content: 'Lập trình cách ánh sáng tương tác với vật thể.',
          },
        ],
      },
      {
        title: 'Chương 2: VFX và Nâng cao',
        lessons: [
          {
            title: 'Bài 2.1: Hiệu ứng Post-Processing tùy chỉnh',
            content: 'Thay đổi hình ảnh cuối cùng của màn hình.',
          },
          {
            title:
              'Bài 2.2: Sử dụng Hệ thống hạt (Particle Systems) và VFX Graphs',
            content: 'Tạo hiệu ứng Lửa, Khói, Nước.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phát Triển Game 2D Nâng Cao với Godot Engine và GDScript',
    categoryName: 'Lập Trình Game',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 30,
    price: 1599000,
    originalPrice: 2100000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ Godot Engine (Open-source) và ngôn ngữ GDScript để xây dựng các Game 2D (Platformer, Top-down Shooter) chất lượng cao, tập trung vào thiết kế Node-based và Vật lý 2D.',
    learnings: [
      'Nắm vững kiến trúc Node và Scene của Godot',
      'Sử dụng GDScript (ngôn ngữ Python-like) cho Game Logic',
      'Lập trình Vật lý 2D (KinematicBody, RigidBody)',
      'Xây dựng Level bằng Tilemaps và Tối ưu hóa 2D',
    ],
    requirements: ['Kiến thức lập trình Python hoặc OOP cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Godot Engine và GDScript',
        lessons: [
          {
            title: 'Bài 1.1: Godot Interface, Nodes và Scenes',
            content: 'Hiểu cấu trúc game dựa trên Node.',
          },
          {
            title: 'Bài 1.2: Lập trình Game Logic bằng GDScript',
            content: 'Sử dụng ngôn ngữ tích hợp của Godot.',
          },
        ],
      },
      {
        title: 'Chương 2: Vật lý và Level Design',
        lessons: [
          {
            title: 'Bài 2.1: KinematicBody2D và Platformer Movement',
            content: 'Điều khiển nhân vật 2D.',
          },
          {
            title:
              'Bài 2.2: Xây dựng Level bằng Tilemaps và Parallax Backgrounds',
            content: 'Tạo môi trường game 2D đẹp mắt.',
          },
        ],
      },
    ],
  },
  {
    title: 'Testing và QA trong Phát Triển Game (Game Testing)',
    categoryName: 'Lập Trình Game',
    instructorName: 'Trần Thị Mai',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu các phương pháp Kiểm thử (Testing) chuyên nghiệp cho Game, bao gồm Functional Testing, Usability Testing và Performance Testing.',
    learnings: [
      'Quy trình Quality Assurance (QA) trong chu trình Game Development',
      'Thiết kế Test Cases cho Gameplay và UI',
      'Sử dụng Bug Tracking System và Quy trình Report Bug',
      'Thực hiện Playtesting và Thu thập Feedback người dùng',
    ],
    requirements: ['Quan tâm đến quy trình sản xuất Game'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Quy trình QA và Testing',
        lessons: [
          {
            title:
              'Bài 1.1: Các giai đoạn Testing (Alpha, Beta, Release Candidate)',
            content: 'Khi nào nên kiểm thử cái gì.',
          },
          {
            title: 'Bài 1.2: Functional Testing và Stress Testing',
            content: 'Kiểm tra tính năng và khả năng chịu tải.',
          },
        ],
      },
      {
        title: 'Chương 2: Usability và Feedback',
        lessons: [
          {
            title:
              'Bài 2.1: Usability Testing (UX) và Accessibility trong Game',
            content: 'Đảm bảo người chơi dễ dàng tương tác.',
          },
          {
            title:
              'Bài 2.2: Quản lý Bug Tracking (Jira/Trello) và Bug Report chất lượng',
            content: 'Giao tiếp lỗi hiệu quả.',
          },
        ],
      },
    ],
  },

  // ---------------------------------TKDH-------------------

  {
    title: 'Adobe InDesign: Thiết Kế Ấn Phẩm, Sách và Tạp Chí Chuyên Nghiệp',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Lê Hoàng Minh',
    level: 'Cơ Bản',
    duration: 3600 * 25,
    price: 1399000,
    originalPrice: 1900000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Học cách sử dụng Adobe InDesign để tạo ra các ấn phẩm nhiều trang như sách, tạp chí, brochures và catalogue với layout chuyên nghiệp.',
    learnings: [
      'Làm chủ công cụ Page Layout và Master Pages',
      'Quản lý Typography phức tạp (Paragraph Styles, Character Styles)',
      'Làm việc với Grid Systems và Layout cho ấn phẩm in',
      'Chuẩn bị file Prepress (Bleed, Slugs, Packaging files)',
    ],
    requirements: ['Kiến thức cơ bản về Adobe Creative Suite'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Layout và Styles',
        lessons: [
          {
            title: 'Bài 1.1: Master Pages và Numbering (Đánh số trang tự động)',
            content: 'Thiết lập cấu trúc cho tài liệu nhiều trang.',
          },
          {
            title: 'Bài 1.2: Sử dụng Paragraph Styles và Character Styles',
            content: 'Tạo và quản lý định dạng chữ viết nhất quán.',
          },
        ],
      },
      {
        title: 'Chương 2: In ấn và Xuất bản',
        lessons: [
          {
            title: 'Bài 2.1: Quản lý Hình ảnh (Links) và Wrapping Text',
            content: 'Cách hình ảnh tương tác với chữ viết.',
          },
          {
            title: 'Bài 2.2: Quy trình Prepress (Packaging) và Xuất PDF/X',
            content: 'Đảm bảo file sẵn sàng cho nhà in.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Thiết Kế Poster và Brochure: Nguyên Tắc Thị Giác và Ngôn Ngữ Hình Ảnh',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1199000,
    originalPrice: 1600000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các nguyên tắc thị giác (Visual Hierarchy, Gestalt) để thiết kế Poster và Brochure có khả năng truyền tải thông điệp nhanh chóng và hiệu quả.',
    learnings: [
      'Áp dụng Nguyên tắc Gestalt trong bố cục',
      'Xây dựng Visual Hierarchy (Thứ bậc thị giác) hiệu quả',
      'Sử dụng Tương phản (Contrast) và Khoảng trắng (Whitespace)',
      'Phân tích tâm lý và mục tiêu của từng loại ấn phẩm truyền thông',
    ],
    requirements: ['Kinh nghiệm cơ bản với Adobe InDesign/Illustrator'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Lý thuyết Thị giác',
        lessons: [
          {
            title: 'Bài 1.1: Nguyên tắc Gestalt và Ứng dụng trong Bố cục',
            content: 'Cách mắt người nhóm và xử lý thông tin.',
          },
          {
            title: 'Bài 1.2: Kỹ thuật xây dựng Tương phản và Cân bằng',
            content: 'Làm nổi bật các yếu tố quan trọng.',
          },
        ],
      },
      {
        title: 'Chương 2: Thiết kế thực tế',
        lessons: [
          {
            title: 'Bài 2.1: Bố cục một trang và Đa trang (Layout Flow)',
            content: 'Thiết kế Poster thu hút và Brochure dễ đọc.',
          },
          {
            title: 'Bài 2.2: Tối ưu hóa cho các loại in (Offset, Digital)',
            content: 'Đảm bảo màu sắc và độ sắc nét.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Logo Chuyên Sâu: Từ Concept đến Brand Guidelines',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Đi sâu vào quy trình thiết kế Logo: nghiên cứu thương hiệu, phác thảo, vector hóa, và xây dựng Brand Guidelines (hướng dẫn sử dụng thương hiệu) chi tiết.',
    learnings: [
      'Nghiên cứu thị trường và Định vị Thương hiệu cho Logo',
      'Kỹ thuật phác thảo và Vector hóa (Pen Tool, Geometry)',
      'Lựa chọn Typography và Color Palette phù hợp với thương hiệu',
      'Xây dựng Brand Guidelines (Logo Usage, Do and Don’t)',
    ],
    requirements: ['Thành thạo Adobe Illustrator'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nghiên cứu và Ý tưởng',
        lessons: [
          {
            title: 'Bài 1.1: Phân tích đối thủ và Brand Persona',
            content: 'Xác định câu chuyện và tính cách của thương hiệu.',
          },
          {
            title:
              'Bài 1.2: Kỹ thuật Phác thảo và Mind Mapping cho Logo Concept',
            content: 'Tạo ra các ý tưởng ban đầu sáng tạo.',
          },
        ],
      },
      {
        title: 'Chương 2: Hoàn thiện và Guidelines',
        lessons: [
          {
            title: 'Bài 2.1: Grid System và Golden Ratio trong Thiết kế Logo',
            content: 'Đảm bảo tính cân đối và hài hòa.',
          },
          {
            title: 'Bài 2.2: Xây dựng Logo Usage Guidelines và Font Hierarchy',
            content: 'Tài liệu hóa cách sử dụng Logo trên mọi nền tảng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Nhận Diện Thương Hiệu (Branding) Toàn Diện',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Phạm Thị Hương',
    level: 'Nâng Cao',
    duration: 3600 * 30,
    price: 1999000,
    originalPrice: 2700000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học tập trung vào việc mở rộng Logo thành một Hệ thống Nhận diện Thương hiệu (Corporate Identity) đầy đủ: Stationery, Merch, Website Mockups và Phong cách chụp ảnh.',
    learnings: [
      'Thiết kế Văn phòng phẩm (Stationery) và Danh thiếp',
      'Xây dựng Style Guide cho Hình ảnh, Biểu tượng và Hình họa',
      'Ứng dụng Brand Voice và Tone vào Thiết kế',
      'Thiết kế Template cho Social Media và Marketing Collaterals',
    ],
    requirements: ['Kinh nghiệm thiết kế Logo và sử dụng InDesign/Illustrator'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Mở rộng Hệ thống',
        lessons: [
          {
            title: 'Bài 1.1: Từ Logo đến Visual Language',
            content: 'Xây dựng các yếu tố đồ họa phụ trợ (Patterns, Textures).',
          },
          {
            title:
              'Bài 1.2: Thiết kế Stationery Set (Letterhead, Envelope, Card)',
            content: 'Đảm bảo sự nhất quán trong giao tiếp.',
          },
        ],
      },
      {
        title: 'Chương 2: Ứng dụng và Tài liệu hóa',
        lessons: [
          {
            title:
              'Bài 2.1: Mockup ứng dụng trên các môi trường (Web, Mobile, Môi trường 3D)',
            content: 'Trực quan hóa thương hiệu.',
          },
          {
            title:
              'Bài 2.2: Hoàn thiện Brand Identity Manual (Sách hướng dẫn thương hiệu)',
            content: 'Tài liệu tham khảo cuối cùng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Digital Painting và Concept Art: Kỹ Thuật Vẽ Kỹ Thuật Số',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 35,
    price: 1599000,
    originalPrice: 2200000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Học các kỹ thuật vẽ tranh kỹ thuật số (Digital Painting) bằng Photoshop hoặc Procreate, tập trung vào hình họa cơ bản, ánh sáng, màu sắc và tạo Concept Art.',
    learnings: [
      'Nắm vững Hình họa cơ bản (Anatomy, Perspective)',
      'Sử dụng Brushes, Blending Modes và Textures hiệu quả',
      'Lý thuyết Ánh sáng, Bóng đổ và Màu sắc trong Digital Painting',
      'Tạo Concept Art (Nhân vật, Môi trường) cho Game/Phim',
    ],
    requirements: [
      'Có bảng vẽ điện tử (Wacom/iPad) và phần mềm Digital Painting',
    ],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Công cụ và Nền tảng',
        lessons: [
          {
            title: 'Bài 1.1: Setup Bảng vẽ và Kỹ thuật Line Art',
            content: 'Vẽ nét sạch và chính xác.',
          },
          {
            title: 'Bài 1.2: Phác thảo Ánh sáng và Bóng đổ cơ bản',
            content: 'Tạo cảm giác chiều sâu và khối.',
          },
        ],
      },
      {
        title: 'Chương 2: Màu sắc và Concept',
        lessons: [
          {
            title: 'Bài 2.1: Color Palettes và Gam Màu (Color Theory)',
            content: 'Lựa chọn và sử dụng màu sắc hài hòa.',
          },
          {
            title:
              'Bài 2.2: Quy trình tạo Concept Art (Thumbnailing, Rendering)',
            content: 'Phát triển ý tưởng từ phác thảo đến hoàn thiện.',
          },
        ],
      },
    ],
  },
  {
    title: 'Illustration Vector Phong Cách Độc Đáo (Minimalism, Isometry)',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1299000,
    originalPrice: 1700000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Học các phong cách Illustration Vector thịnh hành, đặc biệt là Minimalism, Flat Design và Isometry (phối cảnh đẳng cự) bằng Adobe Illustrator.',
    learnings: [
      'Kỹ thuật vẽ Illustration theo phong cách Flat Design',
      'Áp dụng Bố cục và Góc nhìn (Isometry) cho Illustration',
      'Quản lý màu sắc và Gradient trong Illustration Vector',
      'Tạo Illustration cho Website, Ứng dụng và Marketing',
    ],
    requirements: ['Thành thạo Adobe Illustrator'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Flat và Minimalism',
        lessons: [
          {
            title:
              'Bài 1.1: Nguyên tắc của Flat Design (Shadows và Simplicity)',
            content: 'Thiết kế đơn giản và hiện đại.',
          },
          {
            title:
              'Bài 1.2: Kỹ thuật sử dụng Màu sắc Giới hạn (Limited Palettes)',
            content: 'Tạo sự nhất quán trong phong cách.',
          },
        ],
      },
      {
        title: 'Chương 2: Isometry và Độ sâu',
        lessons: [
          {
            title: 'Bài 2.1: Thiết lập Isometric Grid và Góc nhìn',
            content: 'Tạo cảm giác 3D trong môi trường 2D.',
          },
          {
            title:
              'Bài 2.2: Kỹ thuật Shading (Bóng đổ) cho Illustration Vector',
            content: 'Tăng cường độ chân thực của khối.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Chỉnh Màu (Color Grading) và Retouching Nâng Cao với Capture One/Lightroom',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào các kỹ thuật Chỉnh sửa ảnh RAW, Chỉnh màu (Color Grading) chuyên nghiệp và Retouching (chỉnh sửa chi tiết) bằng các công cụ chuyên dụng như Capture One và Lightroom.',
    learnings: [
      'Làm việc với file RAW và Dynamic Range',
      'Kỹ thuật Color Grading (Tone, Hue, Saturation) và Look Creation',
      'Retouching da nâng cao (Dodge & Burn, Local Adjustments)',
      'Workflow quản lý ảnh (Cataloging) và Batch Processing',
    ],
    requirements: ['Kinh nghiệm chụp ảnh RAW và Photoshop cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: RAW và Color Correction',
        lessons: [
          {
            title: 'Bài 1.1: Ưu điểm của file RAW và Quản lý ánh sáng/exposure',
            content: 'Khai thác tối đa dữ liệu hình ảnh.',
          },
          {
            title: 'Bài 1.2: Sử dụng Curves, Levels và HSL Panel',
            content: 'Điều chỉnh màu sắc chính xác.',
          },
        ],
      },
      {
        title: 'Chương 2: Grading và Retouching',
        lessons: [
          {
            title: 'Bài 2.1: Kỹ thuật Color Grading (Cinematic Looks, Vintage)',
            content: 'Tạo phong cách màu sắc độc đáo.',
          },
          {
            title:
              'Bài 2.2: Retouching (Tách tần số và Hiệu chỉnh cục bộ) trong Capture One',
            content: 'Xử lý các khuyết điểm nhỏ trên ảnh.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Đồ Họa cho Social Media và Quảng Cáo Hiệu Suất Cao',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 999000,
    originalPrice: 1300000,
    discount: 23,
    discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description:
      'Thiết kế các Creative (hình ảnh/video) cho quảng cáo Facebook, Instagram, TikTok với mục tiêu tối ưu hóa Tỷ lệ Nhấp (CTR) và Chuyển đổi.',
    learnings: [
      'Nguyên tắc thiết kế Creative thu hút sự chú ý trong 3 giây đầu tiên',
      'Kỹ thuật A/B Testing cho Visual Ads',
      'Thiết kế Storytelling (kể chuyện) qua chuỗi ảnh/video ngắn',
      'Tuân thủ các Quy định Quảng cáo và Kích thước Chuẩn',
    ],
    requirements: ['Kinh nghiệm Photoshop/Illustrator cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nguyên tắc Ads Creative',
        lessons: [
          {
            title: 'Bài 1.1: Thiết kế cho Nền tảng (Mobile-First Design)',
            content: 'Tối ưu hóa hiển thị trên màn hình nhỏ.',
          },
          {
            title: 'Bài 1.2: Visual Hooks và Tương phản để thu hút sự chú ý',
            content: 'Làm người dùng dừng lại khi cuộn.',
          },
        ],
      },
      {
        title: 'Chương 2: Video và Testing',
        lessons: [
          {
            title:
              'Bài 2.1: Thiết kế Video Ads ngắn (6-15 giây) và Call-to-Action',
            content: 'Tạo thông điệp rõ ràng và hành động cụ thể.',
          },
          {
            title: 'Bài 2.2: Phân tích Dữ liệu (CTR, CVR) để cải tiến Creative',
            content: 'Thiết kế dựa trên hiệu suất thực tế.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Typography (Chữ) Chuyên Sâu và Nghệ Thuật Chữ',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Trần Lệ Quyên',
    level: 'Nâng Cao',
    duration: 3600 * 15,
    price: 1199000,
    originalPrice: 1600000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào Typography: Anatomy của Font, các cặp Font (Font Pairing), tạo Hệ thống Phân cấp Chữ và các kỹ thuật Hand Lettering/Calligraphy số.',
    learnings: [
      'Hiểu sâu về Phân loại Font và Tâm lý học Typography',
      'Kỹ thuật Font Pairing (Ghép đôi Font) và Thiết kế Hệ thống Chữ',
      'Sử dụng các công cụ Typographic Controls (Kerning, Tracking, Leading)',
      'Giới thiệu Lettering và Calligraphy kỹ thuật số',
    ],
    requirements: ['Kiến thức thiết kế đồ họa cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Typography Cơ bản và Nâng cao',
        lessons: [
          {
            title: 'Bài 1.1: Anatomy của Chữ và Terminology Typography',
            content: 'Các thành phần cấu tạo nên một typeface.',
          },
          {
            title:
              'Bài 1.2: Thiết kế Grid Layout và Visual Hierarchy bằng Typography',
            content: 'Sử dụng chữ để tạo cấu trúc và dòng chảy.',
          },
        ],
      },
      {
        title: 'Chương 2: Lettering và Ứng dụng',
        lessons: [
          {
            title: 'Bài 2.1: Nguyên tắc của Font Pairing hiệu quả',
            content: 'Làm thế nào để các font chữ kết hợp hài hòa.',
          },
          {
            title:
              'Bài 2.2: Giới thiệu Hand Lettering Kỹ thuật số (Procreate/Illustrator)',
            content: 'Vẽ chữ theo phong cách cá nhân.',
          },
        ],
      },
    ],
  },
  {
    title: 'Portfolio Review và Branding Cá Nhân cho Designer',
    categoryName: 'Thiết Kế Đồ Họa',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 10,
    price: 799000,
    originalPrice: 1000000,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description:
      'Hướng dẫn xây dựng một Portfolio ấn tượng (trên Behance, Dribbble hoặc Website cá nhân) và thiết lập Branding cá nhân để thu hút nhà tuyển dụng/khách hàng.',
    learnings: [
      'Lựa chọn và trình bày các Case Study (dự án) một cách hiệu quả',
      'Thiết kế giao diện Portfolio Website/PDF chuyên nghiệp',
      'Xây dựng câu chuyện cá nhân (Designer Persona)',
      'Tối ưu hóa Portfolio cho mục tiêu công việc cụ thể',
    ],
    requirements: ['Đã có ít nhất 3-5 dự án thiết kế hoàn chỉnh'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cấu trúc Portfolio',
        lessons: [
          {
            title: 'Bài 1.1: Mục đích của Portfolio và Lựa chọn Dự án',
            content: 'Trưng bày những gì phù hợp nhất với mục tiêu.',
          },
          {
            title:
              'Bài 1.2: Trình bày Case Study (Challenge, Solution, Outcome)',
            content: 'Kể câu chuyện về quá trình thiết kế.',
          },
        ],
      },
      {
        title: 'Chương 2: Branding Cá nhân',
        lessons: [
          {
            title:
              'Bài 2.1: Thiết kế giao diện Portfolio (Tối giản và Chuyên nghiệp)',
            content: 'Làm nổi bật tác phẩm của bạn.',
          },
          {
            title: 'Bài 2.2: Cách tiếp cận Nhà tuyển dụng và Giá trị Cá nhân',
            content: 'Bán mình với tư cách là một thương hiệu.',
          },
        ],
      },
    ],
  },
  // -------------------------------DauTu---------------------

  {
    title: 'Đầu Tư Chứng Khoán Cơ Bản: Làm Chủ Phân Tích Cơ Bản (FA)',
    categoryName: 'Đầu Tư',
    instructorName: 'Lê Hoàng Minh',
    level: 'Cơ Bản',
    duration: 3600 * 30,
    price: 1599000,
    originalPrice: 2100000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Làm quen với thị trường chứng khoán, đọc hiểu Báo cáo Tài chính (BCTC) và áp dụng các chỉ số quan trọng để định giá cổ phiếu theo trường phái giá trị.',
    learnings: [
      'Đọc hiểu và phân tích 3 loại Báo cáo Tài chính cơ bản',
      'Tính toán và áp dụng các chỉ số: P/E, P/B, ROE, ROA',
      'Xác định Sức khỏe Tài chính và Mô hình Kinh doanh của doanh nghiệp',
      'Áp dụng phương pháp Định giá Cổ phiếu (Discounted Cash Flow - DCF) cơ bản',
    ],
    requirements: ['Không yêu cầu kinh nghiệm tài chính'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng và BCTC',
        lessons: [
          {
            title: 'Bài 1.1: Thị trường Chứng khoán và Cơ cấu Công ty',
            content: 'Hiểu các thành phần chính của thị trường.',
          },
          {
            title:
              'Bài 1.2: Phân tích Bảng Cân đối Kế toán và Báo cáo Kết quả Kinh doanh',
            content: 'Các chỉ tiêu quan trọng cần theo dõi.',
          },
        ],
      },
      {
        title: 'Chương 2: Định giá và Lựa chọn Cổ phiếu',
        lessons: [
          {
            title:
              'Bài 2.1: Các chỉ số Tăng trưởng (EPS Growth, Revenue Growth)',
            content: 'Đánh giá tiềm năng phát triển của công ty.',
          },
          {
            title:
              'Bài 2.2: Lựa chọn Cổ phiếu theo phương pháp CAN SLIM cơ bản',
            content: 'Chiến lược đầu tư theo tăng trưởng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Kỹ Thuật (TA) Chuyên Sâu: Đọc Biểu Đồ và Mô Hình Nến',
    categoryName: 'Đầu Tư',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1299000,
    originalPrice: 1700000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Học cách đọc biểu đồ nến Nhật, sử dụng các chỉ báo (Indicators) và xác định các mô hình giá để dự đoán biến động thị trường ngắn và trung hạn.',
    learnings: [
      'Làm chủ các mô hình Nến (Candlestick Patterns) đảo chiều và tiếp diễn',
      'Sử dụng các chỉ báo phổ biến: RSI, MACD, Bollinger Bands, Stochastic',
      'Xác định Vùng Hỗ trợ (Support) và Kháng cự (Resistance)',
      'Áp dụng Quản lý Vốn (Money Management) và Rủi ro (Stop Loss)',
    ],
    requirements: ['Hiểu biết cơ bản về giao dịch chứng khoán'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Biểu đồ và Nến',
        lessons: [
          {
            title:
              'Bài 1.1: Các loại Biểu đồ (Line, Bar, Candlestick) và Volume',
            content: 'Ý nghĩa của khối lượng giao dịch.',
          },
          {
            title:
              'Bài 1.2: Mô hình Nến đơn và Nến đôi (Doji, Engulfing, Hammer)',
            content: 'Dấu hiệu của sự đảo chiều.',
          },
        ],
      },
      {
        title: 'Chương 2: Chỉ báo và Quản lý Rủi ro',
        lessons: [
          {
            title: 'Bài 2.1: Áp dụng Đường trung bình động (MA) và RSI',
            content: 'Xác định xu hướng và tình trạng quá mua/quá bán.',
          },
          {
            title:
              'Bài 2.2: Kỹ thuật Stop Loss, Take Profit và Tính toán R:R (Risk:Reward Ratio)',
            content: 'Bảo vệ lợi nhuận và vốn.',
          },
        ],
      },
    ],
  },
  {
    title: 'Đầu Tư Giá Trị (Value Investing) Theo Trường Phái Warren Buffett',
    categoryName: 'Đầu Tư',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1899000,
    originalPrice: 2500000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Nắm vững triết lý và các công cụ của Warren Buffett: Lựa chọn doanh nghiệp có lợi thế cạnh tranh bền vững (Moat) và định giá nội tại (Intrinsic Value).',
    learnings: [
      'Xác định Lợi thế Cạnh tranh Bền vững (Economic Moat)',
      'Phân tích chất lượng Ban Lãnh đạo và Quản trị Công ty',
      'Sử dụng biên độ an toàn (Margin of Safety) khi mua cổ phiếu',
      'Tính toán Giá trị Nội tại (Intrinsic Value) theo các phương pháp nâng cao',
    ],
    requirements: ['Kinh nghiệm phân tích BCTC cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Triết lý Đầu tư Giá trị',
        lessons: [
          {
            title: 'Bài 1.1: Moat và Tầm quan trọng của Lợi thế Cạnh tranh',
            content: 'Các loại Moat (Cost, Network Effect, Brand).',
          },
          {
            title:
              'Bài 1.2: Phân tích Qualitative (Phi Tài chính) về doanh nghiệp',
            content: 'Đánh giá văn hóa và chiến lược.',
          },
        ],
      },
      {
        title: 'Chương 2: Định giá Nội tại',
        lessons: [
          {
            title: 'Bài 2.1: Tính toán Intrinsic Value và Margin of Safety',
            content: 'Tìm kiếm cổ phiếu bị định giá thấp.',
          },
          {
            title: 'Bài 2.2: Phân tích Case Study từ Berkshire Hathaway',
            content: 'Học hỏi từ các thương vụ thành công.',
          },
        ],
      },
    ],
  },
  // --- Nhóm Tài sản Khác (BĐS, ETF) ---
  {
    title: 'Đầu Tư Bất Động Sản Cơ Bản: Phân Tích Thị Trường và Pháp Lý',
    categoryName: 'Đầu Tư',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 25,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Hướng dẫn các nguyên tắc cơ bản của đầu tư bất động sản, từ phân tích vị trí (Location), yếu tố pháp lý, đến các mô hình tạo dòng tiền.',
    learnings: [
      'Phân tích Vị trí (Location) và Yếu tố Cơ sở Hạ tầng',
      'Hiểu các loại Giấy tờ Pháp lý và Quy hoạch Đô thị',
      'Tính toán Dòng tiền (Cash Flow) và Tỷ suất Sinh lời (Cap Rate)',
      'Chiến lược Đầu tư cho thuê và Lật kèo (Flipping)',
    ],
    requirements: ['Quan tâm đến đầu tư Bất động sản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nền tảng Bất động sản',
        lessons: [
          {
            title:
              'Bài 1.1: 4 Loại Bất động sản chính và Vai trò của Đòn bẩy Tài chính',
            content: 'Cách sử dụng vốn vay hiệu quả.',
          },
          {
            title:
              'Bài 1.2: Phân tích Quy hoạch (Sử dụng đất) và Rủi ro Pháp lý',
            content: 'Đảm bảo tính hợp pháp của tài sản.',
          },
        ],
      },
      {
        title: 'Chương 2: Định giá và Chiến lược',
        lessons: [
          {
            title: 'Bài 2.1: Tính toán Net Operating Income (NOI) và Cap Rate',
            content: 'Đánh giá khả năng sinh lời.',
          },
          {
            title:
              'Bài 2.2: Chiến lược Đầu tư Bất động sản vùng ven và Giá trị gia tăng',
            content: 'Tìm kiếm cơ hội tăng trưởng.',
          },
        ],
      },
    ],
  },
  {
    title: 'Đầu Tư Quỹ ETF và Tài Sản Thụ Động (Passive Investing)',
    categoryName: 'Đầu Tư',
    instructorName: 'Phạm Thị Hương',
    level: 'Cơ Bản',
    duration: 3600 * 15,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Học chiến lược đầu tư thụ động (Passive Investing) thông qua Quỹ Hoán đổi Danh mục (ETF) và Quỹ Chỉ số để đạt lợi nhuận dài hạn, giảm thiểu rủi ro.',
    learnings: [
      'Phân biệt Quỹ ETF, Quỹ Mở và Cổ phiếu',
      'Lựa chọn các Quỹ ETF (Index Funds) phù hợp với mục tiêu',
      'Kỹ thuật Trung bình Giá (Dollar-Cost Averaging - DCA)',
      'Xây dựng Danh mục Đầu tư Đa dạng hóa (Asset Allocation)',
    ],
    requirements: ['Quan tâm đến đầu tư dài hạn'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Khái niệm ETF',
        lessons: [
          {
            title: 'Bài 1.1: ETF là gì và Cơ chế hoạt động của Quỹ Chỉ số',
            content: 'Cách ETF mô phỏng thị trường.',
          },
          {
            title: 'Bài 1.2: Lựa chọn ETF Nội địa và Quốc tế (S&P 500, VN30)',
            content: 'Phạm vi đầu tư phù hợp.',
          },
        ],
      },
      {
        title: 'Chương 2: Chiến lược Thụ động',
        lessons: [
          {
            title:
              'Bài 2.1: Trung bình Giá (DCA) và Tầm quan trọng của Lãi suất Kép',
            content: 'Tối đa hóa lợi nhuận dài hạn.',
          },
          {
            title: 'Bài 2.2: Tái cân bằng Danh mục (Rebalancing) theo định kỳ',
            content: 'Duy trì mức độ rủi ro mong muốn.',
          },
        ],
      },
    ],
  },
  // --- Nhóm Chiến lược và Quản lý Rủi ro ---
  {
    title: 'Quản Lý Danh Mục Đầu Tư (Portfolio Management) Chuyên Nghiệp',
    categoryName: 'Đầu Tư',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Áp dụng các mô hình tài chính để tối ưu hóa danh mục đầu tư: Mô hình Markowitz (MPT), CAPM và tính toán Beta để đo lường rủi ro hệ thống.',
    learnings: [
      'Tính toán Rủi ro và Lợi nhuận của Danh mục Đầu tư',
      'Áp dụng Mô hình Định giá Tài sản Vốn (CAPM) [Formula: $E(R_i) = R_f + \beta_i (E(R_m) - R_f)$]',
      'Xác định Beta và Tối ưu hóa Tỷ suất Sharpe',
      'Chiến lược Phân bổ Tài sản (Asset Allocation) theo các giai đoạn kinh tế',
    ],
    requirements: ['Kiến thức Toán học và Tài chính cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Lý thuyết Danh mục',
        lessons: [
          {
            title:
              'Bài 1.1: Đa dạng hóa (Diversification) và Mô hình Markowitz',
            content: 'Giảm thiểu rủi ro phi hệ thống.',
          },
          {
            title:
              'Bài 1.2: Tính toán Standard Deviation (Độ lệch chuẩn) và Covariance',
            content: 'Đo lường sự biến động của tài sản.',
          },
        ],
      },
      {
        title: 'Chương 2: Định giá Rủi ro',
        lessons: [
          {
            title: 'Bài 2.1: Tính toán Tỷ suất Sharpe (Sharpe Ratio)',
            content: 'Đánh giá lợi nhuận trên mỗi đơn vị rủi ro.',
          },
          {
            title:
              'Bài 2.2: Phân bổ Tài sản theo mục tiêu (Thời gian, Độ tuổi, Mức chấp nhận rủi ro)',
            content: 'Xây dựng danh mục cá nhân hóa.',
          },
        ],
      },
    ],
  },
  {
    title: 'Đầu Tư Trái Phiếu, Vàng và Hàng Hóa (Alternative Assets)',
    categoryName: 'Đầu Tư',
    instructorName: 'Trần Lệ Quyên',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 1099000,
    originalPrice: 1500000,
    discount: 27,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Khám phá các loại tài sản thay thế (Alternative Assets) như Trái phiếu, Vàng, Tiền tệ và Hàng hóa để đa dạng hóa danh mục và bảo vệ vốn trong bối cảnh lạm phát.',
    learnings: [
      'Phân loại và Định giá Trái phiếu (Yield, Duration)',
      'Chiến lược Đầu tư Vàng và Bạc (Hedge Lạm phát)',
      'Hiểu Tương quan (Correlation) giữa các loại tài sản',
      'Sử dụng Hàng hóa (Dầu, Nông sản) để phòng ngừa rủi ro',
    ],
    requirements: ['Hiểu biết về kinh tế vĩ mô'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Trái phiếu và Định giá',
        lessons: [
          {
            title: 'Bài 1.1: Trái phiếu Chính phủ và Trái phiếu Doanh nghiệp',
            content: 'Mức độ rủi ro và lợi nhuận khác nhau.',
          },
          {
            title: 'Bài 1.2: Tính toán Yield to Maturity (YTM) và Duration',
            content: 'Đo lường thời gian hoàn vốn.',
          },
        ],
      },
      {
        title: 'Chương 2: Vàng và Hàng hóa',
        lessons: [
          {
            title: 'Bài 2.1: Vai trò của Vàng trong Danh mục (Safe Haven)',
            content: 'Cách vàng hoạt động trong khủng hoảng.',
          },
          {
            title:
              'Bài 2.2: Giao dịch Hàng hóa (Commodities) thông qua ETF/Futures cơ bản',
            content: 'Đầu tư vào nguồn nguyên liệu thô.',
          },
        ],
      },
    ],
  },
  {
    title: 'Phân Tích Kinh Tế Vĩ Mô (Macroeconomics) cho Nhà Đầu Tư',
    categoryName: 'Đầu Tư',
    instructorName: 'Phạm Thị Hương',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 1800000,
    discount: 22,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Học cách phân tích các chỉ số vĩ mô (GDP, CPI, Lãi suất, Tỷ giá) để xác định xu hướng thị trường chung và điều chỉnh chiến lược đầu tư phù hợp.',
    learnings: [
      'Đọc hiểu và phân tích Lãi suất (Interest Rates) và Chính sách Tiền tệ',
      'Đánh giá Ảnh hưởng của Lạm phát (Inflation) và CPI',
      'Phân tích Chu kỳ Kinh tế (Economic Cycles) và Tác động đến các ngành',
      'Sử dụng Dữ liệu Vĩ mô để dự đoán xu hướng Thị trường Chứng khoán/BĐS',
    ],
    requirements: ['Kiến thức kinh tế cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Các Chỉ số Vĩ mô',
        lessons: [
          {
            title:
              'Bài 1.1: Tổng sản phẩm quốc nội (GDP) và Vai trò của Chính phủ',
            content: 'Đo lường sức khỏe tổng thể của nền kinh tế.',
          },
          {
            title:
              'Bài 1.2: Lãi suất, Tỷ giá Hối đoái và Tác động lên Doanh nghiệp',
            content: 'Hiểu các công cụ điều hành của Ngân hàng Trung ương.',
          },
        ],
      },
      {
        title: 'Chương 2: Chu kỳ và Dự báo',
        lessons: [
          {
            title: 'Bài 2.1: Đặc điểm của các Giai đoạn trong Chu kỳ Kinh tế',
            content: 'Phân tích Rủi ro và Cơ hội trong mỗi giai đoạn.',
          },
          {
            title:
              'Bài 2.2: Ứng dụng Phân tích Vĩ mô vào Lựa chọn Ngành đầu tư',
            content: 'Xác định các ngành dẫn dắt thị trường.',
          },
        ],
      },
    ],
  },
  {
    title: 'Đầu Tư Thu Nhập Thụ Động Từ Cổ Tức và Cho Thuê',
    categoryName: 'Đầu Tư',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 15,
    price: 899000,
    originalPrice: 1200000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description:
      'Khóa học tập trung vào việc tạo ra các nguồn thu nhập thụ động bền vững thông qua cổ tức (Dividend Investing) và bất động sản cho thuê (Rental Income).',
    learnings: [
      'Lựa chọn Cổ phiếu Cổ tức (Dividend Stocks) và Phân tích Lịch sử Chia cổ tức',
      'Tính toán Tỷ suất Cổ tức (Dividend Yield) và Payout Ratio',
      'Quản lý và Tối ưu hóa Bất động sản Cho thuê (Tenant Management)',
      'Xây dựng Kế hoạch Tái đầu tư Cổ tức (DRIP)',
    ],
    requirements: ['Quan tâm đến dòng tiền ổn định'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Cổ tức và Dòng tiền',
        lessons: [
          {
            title: 'Bài 1.1: Khái niệm Cổ tức và Tỷ suất Cổ tức',
            content: 'Làm thế nào để kiếm tiền từ cổ tức.',
          },
          {
            title: 'Bài 1.2: Phân tích Payout Ratio và Độ bền vững của Cổ tức',
            content: 'Đánh giá khả năng chi trả của công ty.',
          },
        ],
      },
      {
        title: 'Chương 2: Bất động sản Cho thuê',
        lessons: [
          {
            title:
              'Bài 2.1: Tính toán Dòng tiền Thuần (Net Cash Flow) từ việc cho thuê',
            content: 'Xác định lợi nhuận thực tế.',
          },
          {
            title:
              'Bài 2.2: Quản lý Rủi ro (Bảo hiểm, Bảo trì) và Tối ưu hóa Tỷ lệ Lấp đầy',
            content: 'Đảm bảo hoạt động kinh doanh ổn định.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tâm Lý Học Giao Dịch (Trading Psychology) và Kỷ Luật Đầu Tư',
    categoryName: 'Đầu Tư',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 10,
    price: 799000,
    originalPrice: 1000000,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description:
      'Tập trung vào khía cạnh tâm lý của việc ra quyết định đầu tư, vượt qua các thiên kiến (Biases) và xây dựng kỷ luật giao dịch để tránh các quyết định cảm tính.',
    learnings: [
      'Nhận diện các Thiên kiến Đầu tư (Loss Aversion, Confirmation Bias)',
      'Xây dựng Kỷ luật và Nhật ký Giao dịch (Trading Journal)',
      'Quản lý Cảm xúc (Tham lam, Sợ hãi) trong thị trường biến động',
      'Chiến lược Thoát khỏi Cổ phiếu thua lỗ và Cổ phiếu tăng trưởng',
    ],
    requirements: ['Đã có kinh nghiệm giao dịch thực tế'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Nhận diện Thiên kiến',
        lessons: [
          {
            title:
              'Bài 1.1: Loss Aversion (Sợ mất mát) và Ảnh hưởng đến Quyết định',
            content: 'Lý giải việc giữ mãi cổ phiếu thua lỗ.',
          },
          {
            title: 'Bài 1.2: Herd Mentality (Tâm lý Đám đông) và FOMO',
            content: 'Làm thế nào để đứng ngoài những cơn sốt.',
          },
        ],
      },
      {
        title: 'Chương 2: Kỷ luật và Thực hành',
        lessons: [
          {
            title:
              'Bài 2.1: Thiết lập Hệ thống giao dịch và Quy tắc Khó (Hard Rules)',
            content: 'Không giao dịch theo cảm xúc.',
          },
          {
            title:
              'Bài 2.2: Thực hành Viết Nhật ký Giao dịch và Phân tích Lỗi Sai',
            content: 'Cải thiện chiến lược dựa trên dữ liệu cá nhân.',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập Kế Hoạch Hưu Trí và Tự Do Tài Chính (FIRE)',
    categoryName: 'Đầu Tư',
    instructorName: 'Trần Lệ Quyên',
    level: 'Cơ Bản',
    duration: 3600 * 10,
    price: 699000,
    originalPrice: 900000,
    discount: 22,
    discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description:
      'Hướng dẫn lập kế hoạch tài chính cá nhân để đạt được Tự do Tài chính (Financial Independence) và Hưu trí sớm (Retire Early - FIRE), bao gồm tính toán Chi tiêu và Tiết kiệm.',
    learnings: [
      'Tính toán Số tiền Cần thiết để đạt Tự do Tài chính (The 4% Rule)',
      'Lập Kế hoạch Chi tiêu (Budgeting) và Quản lý Nợ (Debt Management)',
      'Chiến lược Đầu tư FIRE (Thụ động, Chi phí thấp)',
      'Tối ưu hóa Thuế và Tiết kiệm Hưu trí (Pension/IRA/401k - Tương đương)',
    ],
    requirements: ['Mong muốn cải thiện tài chính cá nhân'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Tính toán Mục tiêu',
        lessons: [
          {
            title: 'Bài 1.1: Định nghĩa Tự do Tài chính và Số tiền Cần thiết',
            content: 'Sử dụng Tỷ lệ Rút vốn 4% (4% Withdrawal Rate).',
          },
          {
            title:
              'Bài 1.2: Theo dõi Chi tiêu và Tỷ lệ Tiết kiệm (Savings Rate)',
            content: 'Phân bổ thu nhập hợp lý.',
          },
        ],
      },
      {
        title: 'Chương 2: Chiến lược Hưu trí',
        lessons: [
          {
            title: 'Bài 2.1: Lựa chọn Tài khoản Hưu trí và Ưu đãi Thuế',
            content: 'Sử dụng các công cụ tiết kiệm thuế.',
          },
          {
            title: 'Bài 2.2: Xây dựng Danh mục Đầu tư cho Mục tiêu Hưu trí',
            content: 'Đầu tư an toàn và tăng trưởng bền vững.',
          },
        ],
      },
    ],
  },
  // -----------------CSDL--------------------------

  {
    title: 'SQL Toàn Diện: Truy Vấn, Thao Tác và Quản Trị Cơ Sở Dữ Liệu',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Cơ Bản',
    duration: 3600 * 30,
    price: 1399000,
    originalPrice: 1900000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description:
      'Học ngôn ngữ SQL từ cơ bản đến nâng cao (SELECT, INSERT, UPDATE, DELETE), tập trung vào các loại JOIN, Subquery, và Window Functions.',
    learnings: [
      'Nắm vững các câu lệnh DDL (Data Definition Language) và DML (Data Manipulation Language)',
      'Thực hiện các loại JOIN (Inner, Left, Right, Full) phức tạp',
      'Sử dụng Subquery và Common Table Expressions (CTE) để tối ưu truy vấn',
      'Áp dụng Window Functions (ROW_NUMBER, RANK, LEAD, LAG) cho phân tích dữ liệu',
    ],
    requirements: ['Kiến thức lập trình cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Truy vấn Cơ bản và Thao tác Dữ liệu',
        lessons: [
          {
            title:
              'Bài 1.1: Tạo bảng (CREATE TABLE) và Kiểu dữ liệu (Data Types)',
            content: 'Thiết lập cấu trúc cơ sở dữ liệu.',
          },
          {
            title: 'Bài 1.2: Các mệnh đề WHERE, GROUP BY và HAVING',
            content: 'Lọc và nhóm dữ liệu hiệu quả.',
          },
        ],
      },
      {
        title: 'Chương 2: Truy vấn Nâng cao và Tối ưu',
        lessons: [
          {
            title: 'Bài 2.1: Kỹ thuật JOIN (Ghép bảng) và Union',
            content: 'Kết hợp dữ liệu từ nhiều nguồn.',
          },
          {
            title: 'Bài 2.2: Window Functions và Tối ưu hóa truy vấn cơ bản',
            content: 'Xử lý các bài toán phân tích phức tạp.',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết Kế Cơ Sở Dữ Liệu Quan Hệ (ERD) và Chuẩn Hóa',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1199000,
    originalPrice: 1600000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Học cách thiết kế mô hình cơ sở dữ liệu (Database Schema) bền vững, áp dụng Mô hình Thực thể-Quan hệ (ERD) và các dạng chuẩn hóa (1NF, 2NF, 3NF).',
    learnings: [
      'Thiết kế Mô hình Thực thể-Quan hệ (ERD) chi tiết',
      'Xác định Khóa Chính (Primary Key) và Khóa Ngoại (Foreign Key)',
      'Áp dụng các Dạng Chuẩn hóa (Normalization) để loại bỏ dư thừa dữ liệu',
      'Quyết định khi nào nên De-normalize (Phi chuẩn hóa) để tăng hiệu suất truy vấn',
    ],
    requirements: ['Hiểu biết cơ bản về SQL'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Mô hình và Khóa',
        lessons: [
          {
            title:
              'Bài 1.1: Vẽ ERD (Entity-Relationship Diagram) và Các loại Quan hệ',
            content: 'Trực quan hóa cấu trúc dữ liệu.',
          },
          {
            title: 'Bài 1.2: Tính toàn vẹn Dữ liệu (Integrity) và Constraints',
            content: 'Đảm bảo dữ liệu chính xác.',
          },
        ],
      },
      {
        title: 'Chương 2: Chuẩn hóa và Tối ưu',
        lessons: [
          {
            title: 'Bài 2.1: Các Dạng Chuẩn hóa (1NF, 2NF, 3NF) và Mục tiêu',
            content: 'Giảm thiểu sự trùng lặp và bất thường.',
          },
          {
            title:
              'Bài 2.2: Phi Chuẩn hóa và Tối ưu hóa cho Báo cáo (Reporting)',
            content: 'Cân bằng giữa tốc độ và tính toàn vẹn.',
          },
        ],
      },
    ],
  },
  {
    title: 'Quản Trị Cơ Sở Dữ Liệu MySQL Nâng Cao (DBA)',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Nâng Cao',
    duration: 3600 * 35,
    price: 1799000,
    originalPrice: 2400000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ các kỹ năng của một Database Administrator (DBA) trong MySQL: Bảo mật, Backup/Restore, Tối ưu Hiệu suất và Replication.',
    learnings: [
      'Quản lý Người dùng, Phân quyền và Bảo mật (Security)',
      'Thực hiện Sao lưu (Backup) và Phục hồi (Recovery) dữ liệu (mysqldump)',
      'Tối ưu hóa Index, Buffer Pool và Query Cache',
      'Thiết lập Replication (Master-Slave) cho tính sẵn sàng cao (High Availability)',
    ],
    requirements: ['Kinh nghiệm làm việc với MySQL/PostgreSQL'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Quản trị và Bảo mật',
        lessons: [
          {
            title: 'Bài 1.1: Quản lý Users, Roles và Cấp quyền (GRANT/REVOKE)',
            content: 'Kiểm soát truy cập dữ liệu.',
          },
          {
            title: 'Bài 1.2: Bảo mật Kết nối và Encryption',
            content: 'Bảo vệ dữ liệu khi truyền tải và lưu trữ.',
          },
        ],
      },
      {
        title: 'Chương 2: Tối ưu và HA',
        lessons: [
          {
            title: 'Bài 2.1: Phân tích EXPLAIN và Tối ưu hóa Index',
            content: 'Đẩy nhanh tốc độ truy vấn.',
          },
          {
            title: 'Bài 2.2: Thiết lập Replication và Failover Cơ bản',
            content: 'Đảm bảo hệ thống luôn hoạt động.',
          },
        ],
      },
    ],
  },
  // --- Nhóm NoSQL Hiện đại ---
  {
    title: 'MongoDB Toàn Diện: Thiết Kế Dữ Liệu NoSQL theo Hướng Tài Liệu',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Trung Cấp',
    duration: 3600 * 25,
    price: 1499000,
    originalPrice: 2000000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    description:
      'Làm chủ MongoDB (Document-Oriented Database): Mô hình hóa dữ liệu linh hoạt, truy vấn nâng cao bằng Aggregation Framework và thiết lập Replica Set.',
    learnings: [
      'Mô hình hóa dữ liệu theo hướng Tài liệu (Embedded vs Referencing)',
      'Thực hiện các thao tác CRUD và Truy vấn nâng cao',
      'Sử dụng Aggregation Framework (Pipeline) cho các phép tính phức tạp',
      'Thiết lập Replica Set để tăng tính chịu lỗi (Fault Tolerance)',
    ],
    requirements: ['Kiến thức lập trình JSON/JavaScript cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Mô hình Document và CRUD',
        lessons: [
          {
            title: 'Bài 1.1: Ưu điểm của NoSQL và JSON/BSON Format',
            content: 'Hiểu cấu trúc của tài liệu MongoDB.',
          },
          {
            title:
              'Bài 1.2: Thao tác CRUD (Create, Read, Update, Delete) cơ bản',
            content: 'Các câu lệnh thao tác dữ liệu.',
          },
        ],
      },
      {
        title: 'Chương 2: Aggregation và Mở rộng',
        lessons: [
          {
            title: 'Bài 2.1: Aggregation Pipeline ($match, $group, $lookup)',
            content: 'Thực hiện phân tích dữ liệu trong MongoDB.',
          },
          {
            title: 'Bài 2.2: Replica Sets và Indexing trong NoSQL',
            content: 'Đảm bảo tính sẵn sàng và tốc độ.',
          },
        ],
      },
    ],
  },
  {
    title: 'Database Key-Value và In-Memory Cache với Redis',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 999000,
    originalPrice: 1400000,
    discount: 29,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Học cách sử dụng Redis (Key-Value/In-Memory Data Structure Store) để tăng tốc ứng dụng thông qua Caching, Session Management và Message Queues.',
    learnings: [
      'Hiểu kiến trúc Key-Value và Data Structures của Redis (Strings, Lists, Hashes)',
      'Triển khai Caching (Cache Aside, Read Through, Write Through)',
      'Sử dụng Redis cho Quản lý Session và Rate Limiting',
      'Áp dụng Redis như một Message Queue (Pub/Sub)',
    ],
    requirements: ['Kinh nghiệm phát triển Web Back-end cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Redis và Data Structures',
        lessons: [
          {
            title:
              'Bài 1.1: Giới thiệu Redis và Lợi ích của In-Memory Database',
            content: 'Tối ưu hóa tốc độ truy cập.',
          },
          {
            title: 'Bài 1.2: Thao tác với Strings, Hashes và Sorted Sets',
            content: 'Các cấu trúc dữ liệu cơ bản của Redis.',
          },
        ],
      },
      {
        title: 'Chương 2: Ứng dụng Thực tế',
        lessons: [
          {
            title:
              'Bài 2.1: Triển khai Caching cho Website (TTL, Eviction Policy)',
            content: 'Giảm tải cho Database chính.',
          },
          {
            title: 'Bài 2.2: Sử dụng Redis cho Distributed Lock và Pub/Sub',
            content: 'Đồng bộ hóa các dịch vụ phân tán.',
          },
        ],
      },
    ],
  },
  // --- Nhóm Chuyên đề và Tối ưu ---
  {
    title: 'Tối Ưu Hóa Hiệu Suất Truy Vấn (Query Optimization) Chuyên Sâu',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Nâng Cao',
    duration: 3600 * 20,
    price: 1599000,
    originalPrice: 2100000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    description:
      'Kỹ thuật phân tích, chẩn đoán và tối ưu các câu truy vấn chậm (Slow Queries) trong các hệ thống SQL quy mô lớn, bao gồm Indexing nâng cao và Partitioning.',
    learnings: [
      'Đọc và phân tích Execution Plan (Kế hoạch Thực thi)',
      'Tối ưu hóa Index (Composite Index, Clustered Index, Index Hints)',
      'Áp dụng Table Partitioning (Phân vùng) để quản lý dữ liệu lớn',
      'Xử lý Deadlock (Khóa Chết) và Tối ưu hóa Isolation Level',
    ],
    requirements: ['Kinh nghiệm làm việc với SQL Nâng cao'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Phân tích và Indexing',
        lessons: [
          {
            title:
              'Bài 1.1: Sử dụng EXPLAIN (SQL Server/PostgreSQL/MySQL) và Cost Analysis',
            content: 'Xác định nguyên nhân truy vấn chậm.',
          },
          {
            title:
              'Bài 1.2: Thiết kế Index hiệu quả (Selective Index, Order of Columns)',
            content: 'Chọn đúng cột để Index.',
          },
        ],
      },
      {
        title: 'Chương 2: Xử lý Tác vụ Lớn',
        lessons: [
          {
            title:
              'Bài 2.1: Table Partitioning (Range, List, Hash) và Sharding',
            content: 'Quản lý các bảng có hàng tỷ record.',
          },
          {
            title: 'Bài 2.2: Giải quyết Deadlock và Lock Contention',
            content: 'Tăng cường đồng thời (Concurrency) của hệ thống.',
          },
        ],
      },
    ],
  },
  {
    title: 'PostgreSQL Chuyên Sâu: JSONB, GIS và Full-Text Search',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Nâng Cao',
    duration: 3600 * 25,
    price: 1699000,
    originalPrice: 2300000,
    discount: 26,
    discountExpiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    description:
      'Khám phá các tính năng mạnh mẽ của PostgreSQL: Kiểu dữ liệu JSONB (hỗ trợ NoSQL), PostGIS (dữ liệu không gian) và Hệ thống tìm kiếm toàn văn (Full-Text Search).',
    learnings: [
      'Sử dụng JSONB để lưu trữ và truy vấn dữ liệu phi cấu trúc',
      'Triển khai Full-Text Search (tsvector, tsquery) hiệu quả',
      'Thao tác với dữ liệu Địa lý (GIS) bằng PostGIS',
      'Sử dụng Cấu trúc Dữ liệu Nâng cao (Arrays, Range Types)',
    ],
    requirements: ['Thành thạo SQL cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: JSONB và Full-Text Search',
        lessons: [
          {
            title:
              'Bài 1.1: JSONB và Các toán tử truy vấn dữ liệu NoSQL trong PostgreSQL',
            content: 'Lợi ích của việc kết hợp SQL và NoSQL.',
          },
          {
            title:
              'Bài 1.2: Xây dựng Hệ thống Tìm kiếm Toàn văn (GIN/GiST Index)',
            content: 'Tìm kiếm nhanh chóng trong văn bản.',
          },
        ],
      },
      {
        title: 'Chương 2: Dữ liệu Không gian và Tối ưu',
        lessons: [
          {
            title: 'Bài 2.1: PostGIS và các hàm tính toán Khoảng cách/Vị trí',
            content: 'Làm việc với dữ liệu bản đồ.',
          },
          {
            title:
              'Bài 2.2: Tối ưu hóa với CTEs, PL/pgSQL Functions và Triggers',
            content: 'Tạo các logic nghiệp vụ phức tạp trong DB.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Warehousing Cơ Bản và Thiết Kế Schema Ngôi Sao/Bông Tuyết',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Lê Hoàng Minh',
    level: 'Trung Cấp',
    duration: 3600 * 20,
    price: 1399000,
    originalPrice: 1800000,
    discount: 22,
    discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu về Kho dữ liệu (Data Warehouse) và các mô hình thiết kế tối ưu cho phân tích: Star Schema và Snowflake Schema.',
    learnings: [
      'Phân biệt Database OLTP (Giao dịch) và OLAP (Phân tích)',
      'Thiết kế Star Schema (Fact Tables và Dimension Tables)',
      'Phân tích ưu nhược điểm của Star Schema và Snowflake Schema',
      'Khái niệm ETL/ELT (Extract, Transform, Load) cơ bản',
    ],
    requirements: ['Kiến thức SQL và Thiết kế CSDL cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Kiến trúc Data Warehouse',
        lessons: [
          {
            title:
              'Bài 1.1: Data Warehouse là gì và Tầm quan trọng của nó trong BI',
            content: 'Phân tích dữ liệu lịch sử và tổng hợp.',
          },
          {
            title: 'Bài 1.2: Thiết kế Fact Table (Bảng Sự kiện) và Key Metrics',
            content: 'Lưu trữ các chỉ số nghiệp vụ.',
          },
        ],
      },
      {
        title: 'Chương 2: Mô hình Schema',
        lessons: [
          {
            title: 'Bài 2.1: Star Schema và Dimension Tables',
            content: 'Mô hình hóa dữ liệu dễ dàng cho truy vấn.',
          },
          {
            title: 'Bài 2.2: Snowflake Schema và Khi nào nên sử dụng',
            content: 'Cấu trúc phức tạp hơn nhưng ít dư thừa hơn.',
          },
        ],
      },
    ],
  },
  {
    title:
      'Lập Trình Thủ Tục (Stored Procedure, Trigger) trong SQL Server/Oracle',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Nâng Cao',
    duration: 3600 * 15,
    price: 1299000,
    originalPrice: 1700000,
    discount: 24,
    discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description:
      'Học cách viết các đoạn code phức tạp (Procedures, Functions, Triggers) trực tiếp trong Database bằng T-SQL (SQL Server) hoặc PL/SQL (Oracle) để thực thi logic nghiệp vụ hiệu quả.',
    learnings: [
      'Viết Stored Procedures (Thủ tục Lưu trữ) để thực thi các tác vụ thường xuyên',
      'Sử dụng Triggers để tự động hóa các hành động dựa trên sự kiện (INSERT/UPDATE/DELETE)',
      'Tạo User-Defined Functions (Hàm do người dùng định nghĩa) để tính toán',
      'Xử lý Lỗi và Điều khiển Luồng (Control Flow) trong ngôn ngữ thủ tục',
    ],
    requirements: ['Thành thạo SQL cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: Stored Procedure và Function',
        lessons: [
          {
            title: 'Bài 1.1: Cú pháp Stored Procedure và Truyền Tham số',
            content: 'Tạo các khối mã được thực thi trên server.',
          },
          {
            title: 'Bài 1.2: User-Defined Functions (Scalar và Table-Valued)',
            content: 'Tạo các hàm tùy chỉnh để tái sử dụng logic.',
          },
        ],
      },
      {
        title: 'Chương 2: Triggers và Điều khiển',
        lessons: [
          {
            title: 'Bài 2.1: Triggers (AFTER/INSTEAD OF) và Ứng dụng',
            content: 'Tự động hóa các quy tắc kinh doanh.',
          },
          {
            title: 'Bài 2.2: Xử lý Lỗi (TRY-CATCH) và Transaction Management',
            content: 'Đảm bảo tính toàn vẹn và đáng tin cậy của các giao dịch.',
          },
        ],
      },
    ],
  },
  {
    title: 'Database Cloud: AWS RDS, DynamoDB và Migrations',
    categoryName: 'Cơ Sở Dữ Liệu',
    instructorName: 'Trần Văn Mạnh',
    level: 'Trung Cấp',
    duration: 3600 * 15,
    price: 1199000,
    originalPrice: 1600000,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description:
      'Giới thiệu về Cơ sở dữ liệu trên Cloud, tập trung vào các dịch vụ của AWS: RDS (cho SQL) và DynamoDB (cho NoSQL), và cách di chuyển Database lên Cloud.',
    learnings: [
      'Quản lý CSDL Quan hệ trên AWS RDS (Scaling, Backup, Monitoring)',
      'Thiết kế Bảng và Access Patterns cho DynamoDB (NoSQL Key-Value)',
      'Sử dụng Tools để Di chuyển Database (Migration) lên Cloud',
      'Hiểu về Chi phí và Tối ưu hóa Tài nguyên Database Cloud',
    ],
    requirements: ['Kinh nghiệm SQL và kiến thức Cloud cơ bản'],
    image: sampleImageUrl,
    chapters: [
      {
        title: 'Chương 1: RDS và Quản trị Cloud',
        lessons: [
          {
            title:
              'Bài 1.1: AWS RDS (PostgreSQL/MySQL) và Các tính năng tự động hóa',
            content: 'Quản lý Database ít rắc rối hơn.',
          },
          {
            title: 'Bài 1.2: Scaling (Mở rộng) và High Availability trong RDS',
            content: 'Tăng cường hiệu suất và độ tin cậy.',
          },
        ],
      },
      {
        title: 'Chương 2: DynamoDB và Migrations',
        lessons: [
          {
            title: 'Bài 2.1: DynamoDB (NoSQL) và Thiết kế Access Patterns',
            content: 'Tối ưu hóa chi phí và tốc độ truy vấn NoSQL.',
          },
          {
            title:
              'Bài 2.2: Chiến lược Di chuyển (Schema and Data Migration) lên Cloud',
            content: 'Quy trình chuyển đổi môi trường Database.',
          },
        ],
      },
    ],
  },
];

export const seedCourses1 = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const chapterRepo = dataSource.getRepository(Chapter);
  const lessonRepo = dataSource.getRepository(Lesson);
  const lessonVideoRepo = dataSource.getRepository(LessonVideo);
  const roleRepo = dataSource.getRepository(Role);

  const teacherRole = await roleRepo.findOneBy({ roleName: 'teacher' });

  const hashedPassword = await bcrypt.hash('123456', 10);

  for (const data of coursesData) {
    // 1. Category
    let category = await categoryRepo.findOne({
      where: { categoryName: data.categoryName },
    });
    if (!category) {
      category = categoryRepo.create({ categoryName: data.categoryName });
      await categoryRepo.save(category);
    }

    // 2. Instructor
    let instructor = await userRepo.findOne({
      where: { fullName: data.instructorName },
    });
    if (!instructor) {
      const emailName = data.instructorName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .replace(/\./g, '')
        .toLowerCase();

      instructor = userRepo.create({
        fullName: data.instructorName,
        email: `${emailName}@example.com`,
        password: hashedPassword,
        phone: '09' + Math.floor(Math.random() * 900000000 + 100000000),
        dateOfBirth: '1990-01-01',
        address: 'Hà Nội, Việt Nam',
        isActive: true,
        role: teacherRole ?? undefined,
      });
      await userRepo.save(instructor);
    }

    const randomDaysAgo = Math.floor(Math.random() * 365);
    const courseCreatedAt = createRandomDate(randomDaysAgo);

    const course = courseRepo.create({
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      originalPrice: data.originalPrice || null,
      discount: data.discount || null,
      discountExpiresAt: data.discountExpiresAt || null,
      // rating: Number((Math.random() * (5 - 4) + 4).toFixed(1)),
      // ratingCount: Math.floor(Math.random() * 1001) + 50,
      // students: Math.floor(Math.random() * (1000 - 100 + 1)) + 100,
      students: 0,
      ratingCount: 0,
      rating: 0,
      level: data.level,
      image: data.image,
      requirements: data.requirements,
      learnings: data.learnings,
      isLive: true,
      status: 'published',
      category,
      instructor,
      createdAt: courseCreatedAt,
      updatedAt: courseCreatedAt,
    } as DeepPartial<Course>);
    await courseRepo.save(course);

    const allLessons: Lesson[] = [];

    for (let i = 0; i < data.chapters.length; i++) {
      const chapterData = data.chapters[i];
      const chapter = chapterRepo.create({
        id: uuidv4(),
        title: chapterData.title,
        order: i + 1,
        course,
      });
      await chapterRepo.save(chapter);

      for (let j = 0; j < chapterData.lessons.length; j++) {
        const lessonData = chapterData.lessons[j];

        // Tạo Lesson
        const lesson = lessonRepo.create({
          id: uuidv4(),
          title: lessonData.title,
          content: lessonData.content,
          duration: Math.floor(Math.random() * 12) + 5,
          order: j + 1,
          chapter,
        });
        await lessonRepo.save(lesson);
        allLessons.push(lesson);

        const videoAsset = lessonVideoRepo.create({
          lesson: lesson,
          publicId: uuidv4(),
          originalUrl: sampleOriginalUrl,
          duration: sampleDuration,
          widthOriginal: sampleWidth,
          heightOriginal: sampleHeight,
        });
        await lessonVideoRepo.save(videoAsset);
      }
    }
  }

  console.log(
    `✅ Seeded ${coursesData.length} full web development courses with detailed chapters, lessons, video placeholders, instructors & reviews!`,
  );
};
