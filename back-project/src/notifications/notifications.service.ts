import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notifications.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findByUser(userId: number, page: number, limit: number) {
    const [items, totalCount] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, totalCount };
  }

  async createNotification(userId: number, message: string) {
    const notification = this.notificationRepository.create({
      user: { id: userId },
      message,
    });
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: number) {
    await this.notificationRepository.update({ id }, { is_read: true });
  }
}
