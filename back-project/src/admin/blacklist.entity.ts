import { Dog } from '@/dogs/dogs.entity';
import { User } from '@/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity('blacklists')
export class Blacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_user_id' })
  @Index({ unique: true })
  targetUser: User | null;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}
