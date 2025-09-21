export interface User {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  roleName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;
