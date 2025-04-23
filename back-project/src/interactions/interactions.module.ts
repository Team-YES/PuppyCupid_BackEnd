import { forwardRef, Module } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { Comment } from './comments.entity';
import { Post } from 'src/posts/posts.entity';
import { PostsModule } from 'src/posts/posts.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Comment, Post]),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
