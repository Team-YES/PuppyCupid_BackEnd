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

  // 유저 알림 찾기
  async findByUser(userId: number, page: number, limit: number) {
    const [items, totalCount] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user', 'user.dogs'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formatted = items.map((notification) => {
      const dogImage = notification.user?.dogs?.[0]?.dog_image || null;

      return {
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.created_at,
        dogImage: dogImage
          ? `http://localhost:5000${dogImage}`
          : '/puppy_profile.png',
      };
    });

    return { items: formatted, totalCount };
  }

  // 알림 만들기
  async createNotification(userId: number, message: string) {
    const notification = this.notificationRepository.create({
      user: { id: userId },
      message,
    });
    return await this.notificationRepository.save(notification);
  }

  // 읽음 표시하기
  async markAsRead(userId: number) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  // 읽지 않은 알림 존재?
  async hasUnread(userId: number): Promise<boolean> {
    const count = await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
    return count > 0;
  }
}
