import { DataSource } from 'typeorm';
import { User } from '../../src/modules/user/entities/user.entity';
import { Category } from '../../src/modules/category/entities/category.entity';
import { UserPreference } from '../../src/modules/user_preferences/entities/user_preference.entity';

const targetPrefCategoryName = 'Lập Trình Web';

export async function seedUserPreferences(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const userPrefRepo = dataSource.getRepository(UserPreference);

  const student = await userRepo.findOne({ where: { email: 'b@example.com' } });
  if (!student) {
    console.log('⚠️ User not found');
    return;
  }

  const category = await categoryRepo.findOne({
    where: { categoryName: targetPrefCategoryName },
  });

  if (!category) {
    console.log(`⚠️ Category "${targetPrefCategoryName}" not found. Skipping.`);
    return;
  }

  const existingPref = await userPrefRepo.findOne({
    where: { user: { userId: student.userId } },
    relations: ['user'],
  });

  if (existingPref) {
    console.log(`⚠️ UserPreference already exists. Skipping.`);
    return;
  }

  const preference = userPrefRepo.create({
    user: student,
    mainCategories: [category],
    desiredLevels: ['Cơ Bản'],
    learningGoals: ['Học để tìm việc Frontend'],
    interestedSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
  });

  await userPrefRepo.save(preference);

  console.log(`✅ Seeded UserPreference`);
}
