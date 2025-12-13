import { Lesson } from '../../../modules/lesson/entities/lesson.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lesson_video')
export class LessonVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Lesson, (lesson) => lesson.videoAsset, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  lesson: Lesson;

  @Column({ name: 'public_id', type: 'varchar', unique: true })
  publicId: string;

  @Column({ name: 'original_url', type: 'varchar', nullable: true })
  originalUrl: string;

  @Column({ name: 'duration', type: 'int', default: 0 })
  duration: number;

  @Column({ name: 'width_original', type: 'int', nullable: true })
  widthOriginal: number;

  @Column({ name: 'height_original', type: 'int', nullable: true })
  heightOriginal: number;
}
