import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { Dog } from '../dogs/dogs.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'boolean', default: false })
  is_power_user: boolean;

  @OneToMany(() => Dog, (dog) => dog.user, { cascade: true })
  dogs: Dog[];

  @Column({ type: 'varchar', nullable: true })
  eid_refresh_token: string | null;

  @CreateDateColumn()
  created_at: Date;
}
