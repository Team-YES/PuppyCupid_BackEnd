import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/users.entity';

export enum MbtiType {
  ISTJ = 'ISTJ',
  ISFJ = 'ISFJ',
  INFJ = 'INFJ',
  INTJ = 'INTJ',
  ISTP = 'ISTP',
  ISFP = 'ISFP',
  INFP = 'INFP',
  INTP = 'INTP',
  ESTP = 'ESTP',
  ESFP = 'ESFP',
  ENFP = 'ENFP',
  ENTP = 'ENTP',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ENFJ = 'ENFJ',
  ENTJ = 'ENTJ',
}

@Entity()
export class Dog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.dogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  breed: string;

  @Column({ nullable: true, type: 'enum', enum: MbtiType })
  mbti: MbtiType;

  @Column()
  personality: string;

  @Column()
  dog_image: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column()
  dong_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
