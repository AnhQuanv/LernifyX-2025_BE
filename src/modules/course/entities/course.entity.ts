import { Chapter } from '../../../modules/chapter/entities/chapter.entity';
import { Category } from '../../../modules/category/entities/category.entity';
import { User } from '../../../modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../../modules/comment/entities/comment.entity';
import { PaymentItem } from '../../../modules/payment_items/entities/payment_item.entity';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'requirements', type: 'json', nullable: true })
  requirements: string[];

  @Column({ name: 'learnings', type: 'json', nullable: true })
  learnings: string[];

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration: number;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  price: number | null;

  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  originalPrice: number | null;

  @Column({ name: 'image', type: 'varchar', nullable: true })
  image: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column('int', { default: 0 })
  ratingCount: number;

  @Column('int', { default: 0 })
  students: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  level: string;

  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  discount: number | null;

  @Column({ type: 'timestamp', nullable: true })
  discountExpiresAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft',
  })
  status: 'draft' | 'pending' | 'published' | 'rejected';

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @OneToMany(() => PaymentItem, (item) => item.course)
  paymentItems: PaymentItem[];

  @OneToMany(() => Chapter, (chapter) => chapter.course, { cascade: true })
  chapters: Chapter[];

  @OneToMany(() => Comment, (comment) => comment.course)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
