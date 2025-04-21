import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/users/users.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ default: false })
  senderDeleted: boolean;

  @Column({ default: false })
  receiverDeleted: boolean;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  system: boolean;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  created_at: Date;
}
