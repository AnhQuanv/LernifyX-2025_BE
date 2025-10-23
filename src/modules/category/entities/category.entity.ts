import { Course } from '../../../modules/course/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  categoryId: string;

  @Column({ name: 'name', type: 'varchar' })
  categoryName: string;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
