import { Course } from '../../src/modules/course/entities/course.entity';
import { Category } from '../../src/modules/category/entities/category.entity';
import { User } from '../../src/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

interface CourseSeedData {
  title: string;
  instructorName: string;
  rating: number;
  students: number;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  level: string;
  duration: number;
  categoryName: string;
  discountExpiresAt?: Date | null;
  image: string;
}

export const seedCourses = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(Course);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);

  const coursesData: CourseSeedData[] = [
    {
      title: 'Complete React Development Course',
      instructorName: 'John Smith',
      rating: 4.8,
      students: 12500,
      price: 89.99,
      originalPrice: 199.99,
      discount: 55,
      level: 'Intermediate',
      duration: 40,
      categoryName: 'Programming',
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Digital Marketing Masterclass',
      instructorName: 'Sarah Johnson',
      rating: 4.9,
      students: 8900,
      price: 149.99,
      originalPrice: null,
      discount: null,
      level: 'Beginner',
      duration: 25,
      categoryName: 'Marketing',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'UI/UX Design Fundamentals',
      instructorName: 'Mike Chen',
      rating: 4.7,
      students: 15200,
      price: 69.99,
      originalPrice: 129.99,
      discount: 46,
      level: 'Beginner',
      duration: 30,
      categoryName: 'Design',
      discountExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Python for Data Science',
      instructorName: 'Lisa Wang',
      rating: 4.9,
      students: 20100,
      price: 179.99,
      originalPrice: null,
      discount: null,
      level: 'Advanced',
      duration: 50,
      categoryName: 'Data Science',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Machine Learning Bootcamp',
      instructorName: 'David Brown',
      rating: 4.8,
      students: 18400,
      price: 109.99,
      originalPrice: 249.99,
      discount: 56,
      level: 'Advanced',
      duration: 60,
      categoryName: 'Data Science',
      discountExpiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'WordPress Development',
      instructorName: 'Emma Wilson',
      rating: 4.6,
      students: 9200,
      price: 119.99,
      originalPrice: null,
      discount: null,
      level: 'Beginner',
      duration: 20,
      categoryName: 'Web Development',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Photoshop Mastery Course',
      instructorName: 'Alex Turner',
      rating: 4.9,
      students: 13800,
      price: 74.99,
      originalPrice: 159.99,
      discount: 53,
      level: 'Intermediate',
      duration: 35,
      categoryName: 'Design',
      discountExpiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'JavaScript Advanced Concepts',
      instructorName: 'Maria Garcia',
      rating: 4.8,
      students: 16700,
      price: 179.99,
      originalPrice: null,
      discount: null,
      level: 'Advanced',
      duration: 45,
      categoryName: 'Programming',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'SEO Optimization Masterclass',
      instructorName: 'Tom Wilson',
      rating: 4.7,
      students: 7600,
      price: 64.99,
      originalPrice: 129.99,
      discount: 50,
      level: 'Intermediate',
      duration: 28,
      categoryName: 'Marketing',
      discountExpiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Web Design with Figma',
      instructorName: 'Lisa Park',
      rating: 4.8,
      students: 11200,
      price: 149.99,
      originalPrice: null,
      discount: null,
      level: 'Beginner',
      duration: 32,
      categoryName: 'Design',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Node.js Backend Development',
      instructorName: 'James Lee',
      rating: 4.9,
      students: 14500,
      price: 99.99,
      originalPrice: 199.99,
      discount: 50,
      level: 'Intermediate',
      duration: 48,
      categoryName: 'Programming',
      discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
    {
      title: 'Content Marketing Strategy',
      instructorName: 'Rachel Green',
      rating: 4.6,
      students: 6800,
      price: 139.99,
      originalPrice: null,
      discount: null,
      level: 'Beginner',
      duration: 22,
      categoryName: 'Marketing',
      discountExpiresAt: null,
      image:
        'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg',
    },
  ];

  for (const c of coursesData) {
    // Tìm hoặc tạo Category
    let category = await categoryRepo.findOne({
      where: { categoryName: c.categoryName },
    });
    if (!category) {
      category = categoryRepo.create({ categoryName: c.categoryName });
      await categoryRepo.save(category);
    }

    // Tìm hoặc tạo User (instructor)
    let instructor = await userRepo.findOne({
      where: { fullName: c.instructorName },
    });
    if (!instructor) {
      instructor = userRepo.create({
        fullName: c.instructorName,
        email: `${c.instructorName.replace(' ', '.').toLowerCase()}@example.com`,
        password: '123456',
        phone: '0000000000',
        dateOfBirth: '1990-01-01',
        address: 'Unknown',
        isActive: true,
      });
      await userRepo.save(instructor);
    }

    const course = courseRepo.create({
      id: uuidv4(),
      title: c.title,
      description: '',
      duration: c.duration,
      price: c.price,
      originalPrice: c.originalPrice || null,
      discount: c.discount || null,
      level: c.level,
      rating: c.rating,
      students: c.students,
      discountExpiresAt: c.discountExpiresAt || null,
      image: c.image,
      status: 'published',
      category,
      instructor,
    } as Partial<Course>);
    await courseRepo.save(course);
  }
  console.log('Courses seeded successfully!');
};
