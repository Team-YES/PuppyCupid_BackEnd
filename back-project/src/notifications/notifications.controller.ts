import { Controller, Get, Req, UseGuards, Query, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 알림 만들기
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMyNotifications(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const user = req.user as any;
    const userId = user.id;

    const { items, totalCount } = await this.notificationsService.findByUser(
      userId,
      Number(page),
      Number(limit),
    );

    return {
      ok: true,
      notifications: items,
      totalCount,
    };
  }

  // 알림 읽음 표시
  @Patch('read')
  async markNotificationsAsRead(@Req() req: any) {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(userId);
    return { ok: true, message: '알림 읽음 처리 완료' };
  }
}
