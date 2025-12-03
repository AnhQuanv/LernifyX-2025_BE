import { Lesson } from '../../../modules/lesson/entities/lesson.entity';
import { QuizOption } from '../../../modules/quiz_option/entities/quiz_option.entity';
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

@Entity('quiz_question')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
