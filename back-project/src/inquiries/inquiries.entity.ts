import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';

export enum InquiryType {
  REPORT = 'report',
  PAYMENT = 'payment',
  OTHER = 'other',
}

export enum InquiryStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'enum', enum: InquiryType })
  type: InquiryType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.PENDING })
  status: InquiryStatus;

  @CreateDateColumn()
  created_at: Date;
}
