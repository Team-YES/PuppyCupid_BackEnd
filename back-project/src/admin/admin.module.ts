import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { ReportsModule } from 'src/report/report.module';
import { InquiriesModule } from 'src/inquiries/inquiries.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    UsersModule,
    ReportsModule,
    InquiriesModule,
    PaymentsModule,
    PostsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
