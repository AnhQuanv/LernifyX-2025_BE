import { dataSource } from 'src/typeorm.config';
import { seedLessonProgress } from './lesson-progress.seed';

const runSeedProgress = async () => {
  try {
    await dataSource.initialize();
    console.log('📦 DataSource initialized');

    await seedLessonProgress(dataSource);

    await dataSource.destroy();
    console.log('🧹 DataSource closed');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeedProgress();
