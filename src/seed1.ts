import { dataSource } from './typeorm.config';
import { seedCourses1 } from '../typeorm/seeds/course1.seed';

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log('📦 DataSource initialized');
    await seedCourses1(dataSource);
    await dataSource.destroy();
    console.log('🧹 DataSource closed');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runSeed();
