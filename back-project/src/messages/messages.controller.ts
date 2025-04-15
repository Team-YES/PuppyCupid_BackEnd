import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { AuthRequest } from 'src/users/users.controller';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // 메세지
  @Post()
  async sendMessage(
    @Body() body: { receiverId: number; content: string },
    @Req() req: AuthRequest,
  ) {
    const senderId = req.user.id;
    const message = await this.messagesService.sendMessage(
      senderId,
      body.receiverId,
      body.content,
    );
    return { ok: true, exist: message === null, message };
  }

  // 채팅한 유저 정보
  @Get('chatUsers')
  async getChatUsers(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const users = await this.messagesService.getChatUsers(userId);
    return { ok: true, users };
  }

  // 유저 간 메세지
  @Get(':otherUserId')
  async getMessages(
    @Param('otherUserId') otherUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const messages = await this.messagesService.getConversation(
      userId,
      otherUserId,
    );
    return { ok: true, messages };
  }

  // 안읽은 메세지 확인
  @Patch('read/:otherUserId')
  async readMark(@Param('otherUserId') otherUserId: number, @Req() req: any) {
    const receiverId = req.user.id;
    await this.messagesService.messagesRead(receiverId, otherUserId);
    return { ok: true, message: '읽음 처리 완료' };
  }

  // 삭제
  @Delete('/:otherUserId')
  async deleteConversation(
    @Param('otherUserId') otherUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.messagesService.deleteConversation(userId, otherUserId);
    return { ok: true, message: '채팅 삭제 완료' };
  }
}
