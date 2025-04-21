import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Dog } from '@/dogs/dogs.entity';
import { DogsModule } from '@/dogs/dogs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dog]), DogsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
