import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/role/entities/role.entity';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  // Lấy các role từ DB
  const adminRole = await roleRepo.findOneBy({ roleName: 'admin' });
  const studentRole = await roleRepo.findOneBy({ roleName: 'student' });
  const teacherRole = await roleRepo.findOneBy({ roleName: 'teacher' });

  if (!adminRole || !studentRole || !teacherRole) {
    throw new Error('⚠️ Missing required roles in database. Seed roles first!');
  }

  const plainUsers = [
    {
      fullName: 'Nguyễn Văn A',
      email: 'a@example.com',
      password: '123456',
      phone: '0909123456',
      dateOfBirth: '1990-01-01',
      address: 'Hà Nội',
      role: adminRole,
    },
    {
      fullName: 'Trần Thị B',
      email: 'b@example.com',
      password: '123456',
      phone: '0912345678',
      dateOfBirth: '1995-02-15',
      address: 'TP.HCM',
      role: studentRole,
    },
    {
      fullName: 'Lê Văn C',
      email: 'c@example.com',
      password: '123456',
      phone: '0923456789',
      dateOfBirth: '1992-08-20',
      address: 'Đà Nẵng',
      role: teacherRole,
    },
  ];

  for (const user of plainUsers) {
    const existing = await userRepo.findOneBy({ email: user.email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10); // 👈 Mã hóa mật khẩu
      const userToSave = userRepo.create({
        ...user,
        password: hashedPassword,
      });

      await userRepo.save(userToSave);
    }
  }

  console.log('✅ Seeded users successfully');
};
