import { LessonNote } from '../../../modules/lesson_note/entities/lesson_note.entity';
import { Lesson } from '../../../modules/lesson/entities/lesson.entity';
import { User } from '../../../modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lesson_progress')
@Unique(['user', 'lesson'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.lessonProgress, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  lastPosition: number;

  @OneToMany(() => LessonNote, (note) => note.progress, { cascade: true })
  notes: LessonNote[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
