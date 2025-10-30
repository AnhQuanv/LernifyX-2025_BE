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

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'requirements', type: 'json', nullable: true })
  requirements: string[];

  @Column({ name: 'learnings', type: 'json', nullable: true })
  learnings: string[];

  @Column({ name: 'duration', type: 'int' })
  duration: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice: number;

  @Column({ name: 'image', type: 'varchar' })
  image: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

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
  discountExpiresAt: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft',
  })
  status: 'draft' | 'pending' | 'published' | 'archived';

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @OneToMany(() => Chapter, (chapter) => chapter.course, { cascade: true })
  chapters: Chapter[];

  @OneToMany(() => Comment, (comment) => comment.course)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
