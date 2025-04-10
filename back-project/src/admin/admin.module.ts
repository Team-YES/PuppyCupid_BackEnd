import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { ReportsModule } from 'src/report/report.module';
import { InquiriesModule } from 'src/inquiries/inquiries.module';

@Module({
  imports: [UsersModule, ReportsModule, InquiriesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
