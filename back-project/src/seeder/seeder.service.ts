import { Injectable } from '@nestjs/common';
import { AdminSeederService } from './admin-seeder.service';

@Injectable()
export class SeederService {
  constructor(private readonly adminSeeder: AdminSeederService) {}

  async run() {
    console.log('[Seeder] 시딩을 시작합니다...');
    await this.adminSeeder.createAdminUser();
    console.log('[Seeder] 완료!');
  }
}
