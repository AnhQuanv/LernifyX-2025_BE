import { Category } from '../../src/modules/category/entities/category.entity';
import { DataSource } from 'typeorm';

export const seedCategories = async (dataSource: DataSource) => {
  const categoryRepo = dataSource.getRepository(Category);

  // Kiểm tra xem dữ liệu đã có chưa (tránh tạo trùng)
  const count = await categoryRepo.count();
  if (count > 0) {
    console.log('Categories already seeded');
    return;
  }

  // Mảng dữ liệu mẫu
  const categories = [
    { categoryName: 'Programming' },
    { categoryName: 'Design' },
    { categoryName: 'Marketing' },
    { categoryName: 'Business' },
    { categoryName: 'Photography' },
  ];

  // Tạo entity
  const categoryEntities = categoryRepo.create(categories);

  // Lưu vào DB
  await categoryRepo.save(categoryEntities);

  console.log('✅ Categories seeded successfully!');
};
