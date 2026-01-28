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

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  publicId: string;

  @Column({ name: 'playback_id', type: 'varchar', length: 50, nullable: true })
  playbackId: string;

  @Column({ name: 'duration', type: 'smallint', default: 0 })
  duration: number;

  @Column({ name: 'width_original', type: 'smallint', nullable: true })
  widthOriginal: number;

  @Column({ name: 'height_original', type: 'smallint', nullable: true })
  heightOriginal: number;
}
