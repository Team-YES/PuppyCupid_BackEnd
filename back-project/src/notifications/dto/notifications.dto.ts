import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemDto {
  @ApiProperty({ example: 'ㅇㅇㅇ님이 회원님의 게시글에 댓글을 남겼습니다.' })
  message: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2024-04-16T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: 'https://example.com/dog.jpg',
    nullable: true,
    description: '유저의 대표 강아지 이미지',
  })
  dogImage: string | null;
}

export class NotificationListResDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ type: [NotificationItemDto] })
  notifications: NotificationItemDto[];

  @ApiProperty({ example: 15 })
  totalCount: number;
}

export class MarkAsReadResDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: '알림 읽음 처리 완료' })
  message: string;
}

export class UnreadStatusResDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: true, description: '읽지 않은 알림 존재 여부' })
  hasUnread: boolean;
}
