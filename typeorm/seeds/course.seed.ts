import { DataSource, DeepPartial } from 'typeorm';
import { Course } from '../../src/modules/course/entities/course.entity';
import { Category } from '../../src/modules/category/entities/category.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { Chapter } from '../../src/modules/chapter/entities/chapter.entity';
import { Lesson } from '../../src/modules/lesson/entities/lesson.entity';
import { Comment } from '../../src/modules/comment/entities/comment.entity';
import { Role } from '../../src/modules/role/entities/role.entity';

export const seedCourses = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const chapterRepo = dataSource.getRepository(Chapter);
  const lessonRepo = dataSource.getRepository(Lesson);
  const commentRepo = dataSource.getRepository(Comment);
  const roleRepo = dataSource.getRepository(Role);

  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  const teacherRole = await roleRepo.findOneBy({ roleName: 'teacher' });

  const coursesData = [
    {
      title: 'Complete React Development Bootcamp',
      categoryName: 'Web Development',
      instructorName: 'John Smith',
      level: 'Intermediate',
      duration: 45,
      price: 99.99,
      originalPrice: 199.99,
      discount: 50,
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description:
        'Master React from basics to advanced with hands-on projects and Redux.',
      learnings: [
        'React fundamentals and JSX',
        'Hooks and Context API',
        'State management with Redux Toolkit',
        'Routing and deployment',
      ],
      requirements: ['Basic HTML/CSS', 'JavaScript ES6 knowledge'],
      image: '/images/react-course.jpg',
    },
    {
      title: 'Node.js Backend Development Masterclass',
      categoryName: 'Backend Development',
      instructorName: 'Sarah Johnson',
      level: 'Advanced',
      duration: 40,
      price: 109.99,
      description:
        'Learn to build scalable RESTful APIs using Node.js, Express, and MongoDB.',
      learnings: [
        'Express fundamentals',
        'Authentication and authorization',
        'MongoDB and Mongoose',
        'Error handling and deployment',
      ],
      requirements: ['JavaScript knowledge', 'Basic REST understanding'],
      image: '/images/node-course.jpg',
    },
    {
      title: 'Python for Data Science and Analytics',
      categoryName: 'Data Science',
      instructorName: 'Michael Lee',
      level: 'Beginner',
      duration: 35,
      price: 79.99,
      originalPrice: 149.99,
      discount: 46,
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description:
        'Learn Python for data cleaning, visualization, and machine learning.',
      learnings: [
        'Python basics',
        'Data wrangling with Pandas',
        'Data visualization with Matplotlib',
        'Intro to Scikit-learn',
      ],
      requirements: ['No programming experience required'],
      image: '/images/python-course.jpg',
    },
    {
      title: 'Machine Learning A-Z with Real Projects',
      categoryName: 'Artificial Intelligence',
      instructorName: 'Emily Davis',
      level: 'Intermediate',
      duration: 60,
      price: 129.99,
      description:
        'Build real-world machine learning models using Python and Scikit-learn.',
      learnings: [
        'Supervised and unsupervised learning',
        'Regression and classification',
        'Model evaluation',
        'Clustering and dimensionality reduction',
      ],
      requirements: ['Python basics', 'Math foundations'],
      image: '/images/ml-course.jpg',
    },
    {
      title: 'Digital Marketing Fundamentals',
      categoryName: 'Marketing',
      instructorName: 'Rachel Green',
      level: 'Beginner',
      duration: 25,
      price: 79.99,
      description:
        'Learn how to create digital campaigns and grow brands online.',
      learnings: [
        'SEO & SEM basics',
        'Email and content marketing',
        'Social media ads',
        'Google Analytics overview',
      ],
      requirements: ['Interest in marketing and branding'],
      image: '/images/marketing-course.jpg',
    },
    {
      title: 'UI/UX Design Essentials with Figma',
      categoryName: 'Design',
      instructorName: 'David Miller',
      level: 'Intermediate',
      duration: 30,
      price: 94.99,
      originalPrice: 159.99,
      discount: 41,
      discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description:
        'Design beautiful user interfaces and experiences using Figma.',
      learnings: [
        'User research and personas',
        'Wireframes and prototypes',
        'UI patterns and accessibility',
        'Portfolio building',
      ],
      requirements: ['Basic design interest', 'Laptop required'],
      image: '/images/uiux-course.jpg',
    },
    {
      title: 'AWS Cloud Practitioner Certification Prep',
      categoryName: 'Cloud Computing',
      instructorName: 'Tom Brown',
      level: 'Intermediate',
      duration: 28,
      price: 119.99,
      description:
        'Prepare for AWS certification and learn cloud fundamentals.',
      learnings: [
        'AWS core services',
        'Identity and access management',
        'Cloud architecture and pricing',
      ],
      image: '/images/aws-course.jpg',
    },
    {
      title: 'Cybersecurity for Beginners',
      categoryName: 'Cybersecurity',
      instructorName: 'Jane Parker',
      level: 'Beginner',
      duration: 22,
      price: 79.99,
      description:
        'Understand the basics of cybersecurity, online threats, and data protection.',
      learnings: [
        'Network fundamentals',
        'Phishing and malware defense',
        'Incident response basics',
      ],
      requirements: ['Basic computer skills'],
      image: '/images/cyber-course.jpg',
    },
    {
      title: 'Mobile App Development with Flutter',
      categoryName: 'Mobile Development',
      instructorName: 'Alex Carter',
      level: 'Intermediate',
      duration: 38,
      price: 104.99,
      originalPrice: 199.99,
      discount: 48,
      discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      description:
        'Create cross-platform mobile apps using Flutter and Dart language.',
      learnings: [
        'Flutter widgets',
        'State management',
        'Navigation and routing',
        'Publishing apps to stores',
      ],
      requirements: ['Basic programming experience'],
      image: '/images/flutter-course.jpg',
    },
    {
      title: 'Game Development with Unity 3D',
      categoryName: 'Game Development',
      instructorName: 'Chris Adams',
      level: 'Intermediate',
      duration: 42,
      price: 119.99,
      description:
        'Learn to build 3D games from scratch using Unity engine and C#.',
      learnings: [
        'Unity interface',
        'Game physics',
        'Scripting with C#',
        'Publishing and optimization',
      ],
      image: '/images/unity-course.jpg',
    },
    {
      title: 'Project Management Essentials',
      categoryName: 'Business & Management',
      instructorName: 'Laura Wilson',
      level: 'Beginner',
      duration: 20,
      price: 69.99,
      description:
        'Manage projects effectively with agile and waterfall methodologies.',
      learnings: [
        'Project lifecycle',
        'Team communication',
        'Risk management',
        'Agile principles',
      ],
      requirements: ['Interest in management or team leadership'],
      image: '/images/pm-course.jpg',
    },
    {
      title: 'Financial Analysis for Business Decisions',
      categoryName: 'Finance',
      instructorName: 'Daniel Evans',
      level: 'Intermediate',
      duration: 34,
      price: 89.99,
      description:
        'Make smarter financial decisions through data-driven analysis.',
      learnings: [
        'Financial statement analysis',
        'Cash flow management',
        'Forecasting and budgeting',
      ],
      requirements: ['Basic Excel skills'],
      image: '/images/finance-course.jpg',
    },
  ];

  for (const data of coursesData) {
    // Category
    let category = await categoryRepo.findOne({
      where: { categoryName: data.categoryName },
    });
    if (!category) {
      category = categoryRepo.create({ categoryName: data.categoryName });
      await categoryRepo.save(category);
    }

    // Instructor
    let instructor = await userRepo.findOne({
      where: { fullName: data.instructorName },
    });
    if (!instructor) {
      instructor = userRepo.create({
        fullName: data.instructorName,
        email: `${data.instructorName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        password: '123456',
        phone: '0000000000',
        dateOfBirth: '1990-01-01',
        address: 'Unknown',
        isActive: true,
        role: teacherRole ?? undefined,
      });
      await userRepo.save(instructor);
    }

    // Course
    const course = courseRepo.create({
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      originalPrice: data.originalPrice || null,
      discount: data.discount || null,
      discountExpiresAt: data.discountExpiresAt || null,
      rating: Number((Math.random() * (5 - 3.8) + 3.8).toFixed(1)),
      students: Math.floor(Math.random() * 5000 + 1000),
      level: data.level,
      image: data.image,
      requirements: data.requirements || null,
      learnings: data.learnings,
      status: 'published',
      category,
      instructor,
    } as DeepPartial<Course>);
    await courseRepo.save(course);

    // Chapters & Lessons
    for (let i = 1; i <= 3; i++) {
      const chapter = chapterRepo.create({
        title: `Chapter ${i}: ${data.title} - Part ${i}`,
        order: i,
        course,
      });
      await chapterRepo.save(chapter);

      for (let j = 1; j <= 3; j++) {
        const lesson = lessonRepo.create({
          title: `Lesson ${j}: Key concept ${j}`,
          duration: Math.floor(Math.random() * 12) + 5,
          order: j,
          chapter,
        });
        await lessonRepo.save(lesson);
      }
    }

    // Comments (for course & lessons)
    const reviewers = ['Alice Nguyen', 'Bob Tran', 'Charlie Le'];
    for (const name of reviewers) {
      // Tạo reviewer nếu chưa có
      let reviewer = await userRepo.findOne({ where: { fullName: name } });
      if (!reviewer) {
        reviewer = userRepo.create({
          fullName: name,
          email: `${name.replace(/\s+/g, '.').toLowerCase()}@example.com`,
          password: '123456',
          phone: '0000000000',
          dateOfBirth: '1995-01-01',
          address: 'Vietnam',
          isActive: true,
          role: studentRole ?? undefined,
        });
        await userRepo.save(reviewer);
      }

      // Bình luận về khóa học
      const courseComment = commentRepo.create({
        content: `Great course "${data.title}"! Learned a lot from ${data.instructorName}.`,
        rating: Math.floor(Math.random() * 2) + 4,
        user: reviewer,
        course,
      });
      await commentRepo.save(courseComment);

      // Bình luận về từng lesson trong khóa học
      const lessons = await lessonRepo.find({
        where: { chapter: { course: { id: course.id } } },
        relations: ['chapter', 'chapter.course'],
      });

      for (const lesson of lessons) {
        const lessonComment = commentRepo.create({
          content: `I really enjoyed "${lesson.title}" — ${data.instructorName} explained it clearly.`,
          rating: Math.floor(Math.random() * 2) + 4,
          user: reviewer,
          lesson, // 👈 gắn bình luận vào bài học
          course, // và liên kết luôn với khóa học
        });
        await commentRepo.save(lessonComment);
      }
    }
  }

  console.log(
    '✅ Seeded 12 full courses with chapters, lessons, instructors & reviews!',
  );
};
