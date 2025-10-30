import { DataSource } from 'typeorm';
import { Category } from '../../src/modules/category/entities/category.entity';

export const categorySeeder = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);

  const categories = [
    {
      categoryName: 'Web Development',
    },
    {
      categoryName: 'Mobile Development',
    },
    {
      categoryName: 'Data Science',
    },
    {
      categoryName: 'Artificial Intelligence',
    },
    {
      categoryName: 'UI/UX Design',
    },
    {
      categoryName: 'Business & Management',
    },
    {
      categoryName: 'Marketing',
    },
    {
      categoryName: 'Cybersecurity',
    },
    {
      categoryName: 'Cloud Computing',
    },
    {
      categoryName: 'Game Development',
    },
    {
      categoryName: 'DevOps & Tools',
    },
    {
      categoryName: 'Personal Development',
    },
  ];

  await categoryRepository.save(categories);
  console.log('✅ Seeded categories successfully!');
};
