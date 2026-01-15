import { Lesson } from '../../../modules/lesson/entities/lesson.entity';
import { QuizOption } from '../../../modules/quiz_option/entities/quiz_option.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity('quiz_question')
export class QuizQuestion {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  question: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.quizQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => QuizOption, (option) => option.question, {
    cascade: true,
  })
  options: QuizOption[];

  @Column({ name: 'correct_option_id', type: 'uuid', nullable: true })
  correctOptionId: string;

  @Column({ type: 'int', default: 0 })
  order: number;

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
