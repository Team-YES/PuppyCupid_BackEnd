import { Controller, Get, Req, UseGuards, Query, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  NotificationListResDto,
  MarkAsReadResDto,
  UnreadStatusResDto,
} from './dto/notifications.dto';

@ApiTags('알림')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 알림 조회
  @Get()
  @ApiOperation({ summary: '내 알림 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: NotificationListResDto,
  })
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
  @ApiOperation({ summary: '내 알림 전체 읽음 표시' })
  @ApiResponse({
    status: 200,
    description: '알림 읽음 처리 완료',
    type: MarkAsReadResDto,
  })
  async markNotificationsAsRead(@Req() req: any) {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(userId);
    return { ok: true, message: '알림 읽음 처리 완료' };
  }

  // 알림 상태 확인 (읽지 않은 알림 존재?)
  @Get('status')
  @ApiOperation({ summary: '읽지 않은 알림 존재 여부 확인' })
  @ApiResponse({
    status: 200,
    description: '읽지 않은 알림 상태',
    type: UnreadStatusResDto,
  })
  async checkUnread(@Req() req: any) {
    const userId = req.user.id;
    const hasUnread = await this.notificationsService.hasUnread(userId);
    return { ok: true, hasUnread };
  }
}
