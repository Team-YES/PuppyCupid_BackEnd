import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts.entity';
import { PostImage } from './post_images.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { InteractionsModule } from '@/interactions/interactions.module';
import { Comment } from '@/interactions/comments.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage, Comment]),
    forwardRef(() => InteractionsModule),
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
