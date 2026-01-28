import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('user_preference')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => User, (user) => user.preferences)
  user: User;

  @ManyToMany(() => Category)
  @JoinTable()
  mainCategories: Category[];

  @Column({ type: 'simple-array', nullable: true })
  desiredLevels: string[];

  @Column({ type: 'simple-array', nullable: true })
  learningGoals: string[];

  @Column({ type: 'simple-array', nullable: true })
  interestedSkills: string[];
}
