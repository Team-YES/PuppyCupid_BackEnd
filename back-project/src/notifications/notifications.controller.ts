import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMyNotifications(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const user = req.user as any; // JWT에서 가져온 유저 정보
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
}
