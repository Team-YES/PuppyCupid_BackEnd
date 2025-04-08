import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum report_type {
  USER = 'user',
  POST = 'post',
  COMMENT = 'comment',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ type: 'enum', enum: report_type })
  reportType: 'post' | 'comment' | 'user';

  @Column()
  targetId: number;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}
