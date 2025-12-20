import { Expose, Transform } from 'class-transformer';

export class RoleDto {
  @Expose()
  roleName: string;
}

export class UserResponseDto {
  @Expose()
  userId: string;
  @Expose()
  fullName: string;
  @Expose()
  email: string;
  @Expose()
  phone: string;
  @Expose()
  dateOfBirth: string;
  @Expose()
  avatar: string;
  @Expose()
  address: string;
  @Expose()
  hasPreferences: boolean;
  @Expose()
  isNewTeacher: boolean;
  @Expose()
  bio: string;
  @Expose()
  description: string;
  @Expose()
  @Transform(
    ({ obj }: { obj: { role?: RoleDto } }) => obj.role?.roleName ?? null,
  )
  roleName: string | null;
}
