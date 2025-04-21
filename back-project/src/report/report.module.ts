import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';
import { User } from '@/users/users.entity';
import { Post } from '@/posts/posts.entity';
import { Comment } from '@/interactions/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Post, Comment])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
