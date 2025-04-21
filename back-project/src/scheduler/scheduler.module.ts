import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
