import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '@/users/users.module';
import { ReportsModule } from '@/report/report.module';
import { InquiriesModule } from '@/inquiries/inquiries.module';
import { PaymentsModule } from '@/payments/payments.module';
import { PostsModule } from '@/posts/posts.module';
import { InteractionsModule } from '@/interactions/interactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blacklist } from './blacklist.entity';
import { MessagesModule } from '@/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blacklist]),
    UsersModule,
    ReportsModule,
    InquiriesModule,
    PaymentsModule,
    PostsModule,
    InteractionsModule,
    MessagesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
