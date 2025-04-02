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

export enum UserRole {
  USER = 'user',
  POWER = 'power',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  nickName: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true, unique: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  provider: 'google' | 'kakao' | 'naver' | null;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Dog, (dog) => dog.user, { cascade: true })
  dogs: Dog[];

  @Column({ type: 'varchar', nullable: true })
  eid_refresh_token: string | null;

  @CreateDateColumn()
  created_at: Date;
}
