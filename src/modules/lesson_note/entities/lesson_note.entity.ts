import { LessonProgress } from '../../../modules/lesson_progress/entities/lesson_progress.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lesson_note')
export class LessonNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LessonProgress, (progress) => progress.notes, {
    onDelete: 'CASCADE',
  })
  progress: LessonProgress;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
