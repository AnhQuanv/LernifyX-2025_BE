import { PaymentItem } from '../../../modules/payment_items/entities/payment_item.entity';
import { User } from '../../../modules/user/entities/user.entity';
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

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @Column()
  gateway: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gateway_transaction_id: string | null;

  @Column({ unique: true })
  transaction_ref: string;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  order_info: string;

  @Column({ type: 'text', nullable: true })
  pay_url: string;

  @Column({ nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankCode: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  response_code: string | null;

  @Column({ type: 'json', nullable: true })
  raw_response: Record<string, string | undefined> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PaymentItem, (item) => item.payment)
  items: PaymentItem[];
}
