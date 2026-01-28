import { Wishlist } from '../../../modules/wishlist/entities/wishlist.entity';
import { Course } from '../../../modules/course/entities/course.entity';
import { RefreshToken } from '../../refresh-token/entities/refresh-token.entity';
import { Role } from '../../role/entities/role.entity';
import { CartItem } from '../../../modules/cart_item/entities/cart_item.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Comment } from '../../../modules/comment/entities/comment.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { LessonProgress } from '../../../modules/lesson_progress/entities/lesson_progress.entity';
import { UserPreference } from '../../../modules/user_preferences/entities/user_preference.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', unique: true, length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', nullable: true, length: 15 })
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  bio: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({
    name: 'code_id',
    type: 'varchar',
    length: 6,
    nullable: true,
  })
  codeId: string | null;

  @Column({ name: 'code_expires_at', type: 'timestamp', nullable: true })
  codeExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  avatar: string | null;

  @Column({ name: 'has_preferences', type: 'boolean', default: false })
  hasPreferences: boolean;

  @ManyToOne(() => Role, (role) => role.users, { cascade: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'is_disabled', type: 'boolean', default: false })
  isDisabled: boolean;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => UserPreference, (pref) => pref.user)
  preferences: UserPreference[];

  @OneToMany(() => LessonProgress, (progress) => progress.user)
  lessonProgress: LessonProgress[];

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
