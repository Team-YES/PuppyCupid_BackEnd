import { Module } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { Comment } from './comments.entity';
import { Post } from 'src/posts/posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Comment, Post])],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
