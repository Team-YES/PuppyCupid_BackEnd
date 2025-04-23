import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/users.entity';

@Injectable()
export class AdminSeederService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createAdminUser() {
    const adminId = this.configService.get<string>('ADMIN_ID');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existing = await this.usersRepository.findOne({
      where: { email: adminId },
    });

    if (!existing) {
      const user = this.usersRepository.create({
        email: adminId,
        nickName: '관리자',
        admin_password: hashedPassword,
        role: UserRole.ADMIN,
      });
      await this.usersRepository.save(user);
      console.log('[Seeder] 관리자 계정 생성 완료');
    } else {
      console.log('[Seeder] 관리자 계정이 이미 존재합니다');
    }
  }
}
