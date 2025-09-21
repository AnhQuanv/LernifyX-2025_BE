import { Role } from '../../src/modules/role/entities/role.entity';
import { DataSource } from 'typeorm';

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepo = dataSource.getRepository(Role);

  const roles = [
    { roleName: 'admin' },
    { roleName: 'student' },
    { roleName: 'teacher' },
  ];

  for (const role of roles) {
    const existing = await roleRepo.findOneBy({ roleName: role.roleName });
    if (!existing) {
      await roleRepo.save(roleRepo.create(role));
    }
  }

  console.log('✅ Seeded roles successfully');
};
