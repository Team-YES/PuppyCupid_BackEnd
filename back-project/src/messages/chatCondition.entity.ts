import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/users.entity';

@Entity('chat_condition')
export class ChatCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @Column()
  otherUserId: number;

  @Column({ default: false })
  exited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  exitedAt: Date | null;
}
