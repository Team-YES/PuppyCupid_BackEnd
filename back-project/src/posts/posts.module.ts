import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts.entity';
import { PostImage } from './post_images.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { InteractionsModule } from 'src/interactions/interactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage]),
    forwardRef(() => InteractionsModule),
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
