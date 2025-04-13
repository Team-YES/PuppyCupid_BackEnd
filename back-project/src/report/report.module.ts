import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';
import { Blacklist } from './blacklist.entity';
import { User } from 'src/users/users.entity';
import { Post } from 'src/posts/posts.entity';
import { Comment } from 'src/interactions/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Blacklist, User, Post, Comment])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
