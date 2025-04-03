import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersController } from './users.controller';
import { PostsModule } from 'src/posts/posts.module';
import { InteractionsModule } from 'src/interactions/interactions.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PostsModule,
    InteractionsModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
