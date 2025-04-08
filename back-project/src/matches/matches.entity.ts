import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Dog } from 'src/dogs/dogs.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dog1_id' })
  dog1: Dog;

  @ManyToOne(() => Dog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dog2_id' })
  dog2: Dog;

  @CreateDateColumn()
  created_at: Date;
}
