import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
