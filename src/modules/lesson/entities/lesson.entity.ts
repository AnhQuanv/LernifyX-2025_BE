import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Chapter } from '../../chapter/entities/chapter.entity';
import { Comment } from '../../../modules/comment/entities/comment.entity';
import { LessonProgress } from '../../../modules/lesson_progress/entities/lesson_progress.entity';
import { QuizQuestion } from '../../../modules/quiz_question/entities/quiz_question.entity';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'duration', type: 'int', comment: 'Duration in minutes' })
  duration: number;

  @Column({ name: 'video_url', type: 'varchar', nullable: true })
  videoUrl: string;

  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Chapter, (chapter) => chapter.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @OneToMany(() => Comment, (comment) => comment.lesson)
  comments: Comment[];

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progress: LessonProgress[];

  @OneToMany(() => QuizQuestion, (quiz) => quiz.lesson, {
    cascade: true,
  })
  quizQuestions: QuizQuestion[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
