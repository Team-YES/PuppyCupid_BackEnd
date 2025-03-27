import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [AuthModule, UsersModule, DogsModule, PostsModule, InteractionsModule, BlacklistModule, AdminModule, MatchesModule, MessagesModule, NotificationsModule, FollowsModule, InquiriesModule, PaymentsModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
