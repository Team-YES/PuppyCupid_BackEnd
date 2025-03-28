import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DogsModule } from './dogs/dogs.module';
import { PostsModule } from './posts/posts.module';
import { InteractionsModule } from './interactions/interactions.module';
import { BlacklistModule } from './blacklist/blacklist.module';
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
      // entities: [Todo, User],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    DogsModule,
    PostsModule,
    InteractionsModule,
    BlacklistModule,
    AdminModule,
    MatchesModule,
    MessagesModule,
    NotificationsModule,
    FollowsModule,
    InquiriesModule,
    PaymentsModule,
    WeatherModule,
  ],
})
export class AppModule {}
