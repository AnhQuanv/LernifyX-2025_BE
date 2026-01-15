import { seedRoles } from '../typeorm/seeds/role.seed';
import { seedUsers } from '../typeorm/seeds/user.seed';
import { dataSource } from './typeorm.config';
import { seedLessonProgress } from '../typeorm/seeds/lesson-progress.seed';
import { seedLessonCommentsWithRandomUsers } from '../typeorm/seeds/commentLesson.seed';
import { seedQuiz } from '../typeorm/seeds/quiz.seed';
import { seedUserPreferences } from '../typeorm/seeds/user-preference.seed';
import { seedCourses1 } from '../typeorm/seeds/course1.seed';
import { paymentSeedFor12Month } from '../typeorm/seeds/payment-random-12-months.seed';

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log('📦 DataSource initialized');

    await seedRoles(dataSource);
    await seedUsers(dataSource);
    await seedCourses1(dataSource);
    await seedLessonProgress(dataSource);
    await seedLessonCommentsWithRandomUsers(dataSource);
    await seedQuiz(dataSource);
    await seedUserPreferences(dataSource);
    await paymentSeedFor12Month(dataSource);
    await dataSource.destroy();
    console.log('🧹 DataSource closed');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runSeed();
