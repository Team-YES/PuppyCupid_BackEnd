import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DogsModule } from './dogs/dogs.module';
import { PostsModule } from './posts/posts.module';
import { InteractionsModule } from './interactions/interactions.module';
import { AdminModule } from './admin/admin.module';
import { MatchesModule } from './matches/matches.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FollowsModule } from './follows/follows.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { PaymentsModule } from './payments/payments.module';
import { WeatherModule } from './weather/weather.module';
// typeorm
import { TypeOrmModule } from '@nestjs/typeorm';
// config
import { ConfigModule } from '@nestjs/config';
// entity
import { User } from './users/users.entity';
import { Dog } from './dogs/dogs.entity';
import { Like } from './interactions/likes.entity';
import { Post } from './posts/posts.entity';
import { PostImage } from './posts/post_images.entity';
import { Comment } from './interactions/comments.entity';
import { Inquiry } from './inquiries/inquiries.entity';
import { Match } from './matches/matches.entity';
import { Message } from './messages/messages.entity';
import { Notification } from './notifications/notifications.entity';
import { Follow } from './follows/follows.entity';
import { Payment } from './payments/payments.entity';

import { AppController } from './app.controller';
import { Weather } from './weather/weather.entity';
import { ReportsModule } from './report/report.module';
import { ChatCondition } from './messages/chatCondition.entity';
import { SchedulerService } from './scheduler/scheduler.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { Report } from './report/report.entity';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'korizon5479@@',
      database: 'puppies',
      entities: [
        User,
        Dog,
        Post,
        PostImage,
        Comment,
        Like,
        Inquiry,
        Match,
        Message,
        Notification,
        Follow,
        Payment,
        Weather,
        ChatCondition,
        Report,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    DogsModule,
    PostsModule,
    InteractionsModule,
    AdminModule,
    MatchesModule,
    MessagesModule,
    NotificationsModule,
    FollowsModule,
    InquiriesModule,
    PaymentsModule,
    WeatherModule,
    ReportsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [SchedulerService],
})
export class AppModule {}
