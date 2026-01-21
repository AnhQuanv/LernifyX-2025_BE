import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  OneToOne,
} from 'typeorm';
import { Chapter } from '../../chapter/entities/chapter.entity';
import { Comment } from '../../../modules/comment/entities/comment.entity';
import { LessonProgress } from '../../../modules/lesson_progress/entities/lesson_progress.entity';
import { QuizQuestion } from '../../../modules/quiz_question/entities/quiz_question.entity';
import { LessonVideo } from '../../../modules/lesson_video/entities/lesson_video.entity';

@Entity('lesson')
export class Lesson {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content: string;

  @Column({
    name: 'duration',
    type: 'int',
    comment: 'Duration in second',
    nullable: true,
  })
  duration: number;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ name: 'video_id', type: 'uuid', nullable: true })
  videoId: string | null;

  @OneToOne(() => LessonVideo, (video) => video.lesson, {
    cascade: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'video_id' })
  videoAsset: LessonVideo | null;

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
