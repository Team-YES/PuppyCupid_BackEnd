import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from 'src/users/users.entity';
import { AdminSeederService } from './admin-seeder.service';
import { SeederService } from './seeder.service';
import { Dog } from 'src/dogs/dogs.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT')!, 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Dog],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [SeederService, AdminSeederService],
  exports: [SeederService],
})
export class SeederModule {}
