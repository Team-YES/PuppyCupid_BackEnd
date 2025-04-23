import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 2, description: '메시지를 받을 유저 ID' })
  @IsNumber()
  receiverId: number;

  @ApiProperty({ example: '안녕하세요!', description: '메시지 내용' })
  @IsString()
  content: string;
}

export class ChatUserInfoDto {
  @ApiProperty({ example: 3, description: '상대 유저 ID' })
  id: number;

  @ApiProperty({ example: '댕댕이주인', description: '상대 유저 닉네임' })
  nickName: string;

  @ApiProperty({
    example: '/uploads/dogsImage/dog.png',
    nullable: true,
    description: '상대 강아지 이미지',
  })
  dogImage: string | null;

  @ApiProperty({
    example: '마지막 보낸 메시지입니다.',
    description: '최근 메시지',
  })
  lastMessage: string;

  @ApiProperty({
    example: '2025-04-21T10:30:00.000Z',
    description: '최근 메시지 시간',
  })
  lastMessageTime: string;

  @ApiProperty({ example: 2, description: '안 읽은 메시지 수' })
  unreadCount: number;
}

export class MessageDto {
  @ApiProperty({ example: 1, description: '메시지 ID' })
  id: number;

  @ApiProperty({ example: '안녕하세요!', description: '내용' })
  content: string;

  @ApiProperty({ example: false, description: '시스템 메시지 여부' })
  system: boolean;

  @ApiProperty({ example: false, description: '읽음 여부' })
  isRead: boolean;

  @ApiProperty({
    example: '2025-04-21T10:30:00.000Z',
    description: '보낸 시간',
  })
  created_at: string;

  @ApiProperty({ example: 1, description: '보낸 사람 ID' })
  senderId: number;

  @ApiProperty({ example: 2, description: '받은 사람 ID' })
  receiverId: number;
}
