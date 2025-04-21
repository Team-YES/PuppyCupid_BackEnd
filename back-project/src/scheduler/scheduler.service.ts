import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/users.entity';

@Injectable()
export class SchedulerService {
  constructor(private readonly usersService: UsersService) {}
  // 새벽 1시에 실행
  @Cron('0 1 * * *')
  async downgradeUsers() {
    const now = new Date();

    const expiredUsers = await this.usersService.findExpiredUsers(now);

    for (const user of expiredUsers) {
      user.role = UserRole.USER;
      user.power_expired_at = null;
      await this.usersService.save(user);
      console.log(`유저 ${user.id} → 일반 유저`);
    }
  }
}
