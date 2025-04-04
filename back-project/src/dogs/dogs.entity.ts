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

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  NEUTERED = 'male_neutered',
}

@Entity('dogs')
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

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column()
  breed: string;

  @Column({ nullable: true, type: 'enum', enum: MbtiType })
  mbti: MbtiType;

  @Column({ type: 'text' })
  personality: string;

  @Column()
  dog_image: string;

  @Column('float', { nullable: true })
  latitude: number | null;

  @Column('float', { nullable: true })
  longitude: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
