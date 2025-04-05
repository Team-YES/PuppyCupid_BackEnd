import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './matches.entity';
import { Dog } from 'src/dogs/dogs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Dog])],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
