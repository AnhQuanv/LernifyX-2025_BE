import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Course } from '../../../modules/course/entities/course.entity';
import { Payment } from '../../../modules/payment/entities/payment.entity';

@Entity('payment_items')
export class PaymentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment, (payment) => payment.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
