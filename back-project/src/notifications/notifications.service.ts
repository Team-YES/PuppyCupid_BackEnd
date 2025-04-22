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
      where: { receiver: { id: userId } },
      relations: ['sender', 'sender.dogs'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formatted = items.map((notification) => {
      const dogImage = notification.sender?.dogs?.[0]?.dog_image || null;

      return {
        id: notification.id,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.created_at,
        dogImage,
      };
    });

    return { items: formatted, totalCount };
  }

  // 알림 만들기
  async createNotification(
    receiverUserId: number,
    message: string,
    senderUserId?: number,
  ) {
    const notification = this.notificationRepository.create({
      receiver: { id: receiverUserId },
      sender: senderUserId ? { id: senderUserId } : undefined,
      message,
    });
    return await this.notificationRepository.save(notification);
  }

  // 읽음 표시하기
  async markAsRead(userId: number) {
    await this.notificationRepository.update(
      { receiver: { id: userId }, isRead: false },
      { isRead: true },
    );
  }
  
  async hasUnread(userId: number): Promise<boolean> {
    const count = await this.notificationRepository.count({
      where: { receiver: { id: userId }, isRead: false },
    });
    return count > 0;
  }
  
}
