import { Dog } from 'src/dogs/dogs.entity';
import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Blacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User | null;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}
