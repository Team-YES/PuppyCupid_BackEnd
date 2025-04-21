import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from 'sr /users/users.entity';
import { AdminSeederService } from './admin-seeder.service';
import { SeederService } from './seeder.service';
import { Dog } from 'src/dogs/dogs.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'korizon5479@@',
      database: 'puppies',
      entities: [User, Dog],
      synchronize: true,
    } as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [SeederService, AdminSeederService],
  exports: [SeederService],
})
export class SeederModule {}
