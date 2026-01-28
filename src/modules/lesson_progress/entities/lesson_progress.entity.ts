import { LessonNote } from '../../../modules/lesson_note/entities/lesson_note.entity';
import { Lesson } from '../../../modules/lesson/entities/lesson.entity';
import { User } from '../../../modules/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
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

  @Column({ type: 'smallint', default: 0 })
  lastPosition: number;

  @OneToMany(() => LessonNote, (note) => note.progress, { cascade: true })
  notes: LessonNote[];

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
