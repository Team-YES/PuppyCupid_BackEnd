import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  async getChatUsers(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const users = await this.messagesService.getChatUsers(userId);
    return { ok: true, users };
  }

  // 유저 간 메세지
  @Get(':otherUserId')
  @UseGuards(AuthGuard('jwt'))
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
