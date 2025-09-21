import { seedRoles } from '../typeorm/seeds/role.seed';
import { seedUsers } from '../typeorm/seeds/user.seed';
import { dataSource } from './typeorm.config';

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log('📦 DataSource initialized');

    await seedRoles(dataSource);
    await seedUsers(dataSource);

    await dataSource.destroy();
    console.log('🧹 DataSource closed');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runSeed();
