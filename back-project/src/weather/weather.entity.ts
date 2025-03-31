import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float')
  temperature: number;

  @Column('float')
  humidity: number;

  @Column('float')
  wind_speed: number;

  @Column({ type: 'varchar', length: 50 })
  weather_main: string;

  @Column({ type: 'varchar', length: 100 })
  weather_desc: string;

  @CreateDateColumn()
  recorded_at: Date;
}
