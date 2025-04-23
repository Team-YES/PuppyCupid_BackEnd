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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ChatUserInfoDto,
  MessageDto,
  SendMessageDto,
} from './dto/messages.dto';

@ApiTags('채팅')
@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // 메세지
  @Post()
  @ApiOperation({
    summary: '메시지 보내기',
    description: '상대방에게 메시지를 보냅니다.',
  })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(@Body() body: SendMessageDto, @Req() req: AuthRequest) {
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
  @ApiOperation({
    summary: '채팅 유저 목록',
    description:
      '나와 채팅한 유저의 닉네임, 강아지 이미지, 마지막 메시지 등을 조회합니다.',
  })
  @ApiOkResponse({ type: ChatUserInfoDto, isArray: true })
  async getChatUsers(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const users = await this.messagesService.getChatUsers(userId);
    return { ok: true, users };
  }

  // 유저 간 메세지
  @Get(':otherUserId')
  @ApiOperation({
    summary: '대화 내용 조회',
    description: '상대 유저와의 메시지 전체를 조회합니다.',
  })
  @ApiParam({ name: 'otherUserId', type: Number })
  @ApiOkResponse({ type: MessageDto, isArray: true })
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
  @ApiOperation({
    summary: '메시지 읽음 처리',
    description: '상대방이 보낸 메시지를 읽음 상태로 변경합니다.',
  })
  @ApiParam({ name: 'otherUserId', type: Number })
  async readMark(@Param('otherUserId') otherUserId: number, @Req() req: any) {
    const receiverId = req.user.id;
    await this.messagesService.messagesRead(receiverId, otherUserId);
    return { ok: true, message: '읽음 처리 완료' };
  }

  // 삭제
  @Delete(':otherUserId')
  @ApiOperation({
    summary: '대화 삭제',
    description: '상대방과의 채팅방을 나가고 메시지를 삭제합니다.',
  })
  @ApiParam({ name: 'otherUserId', type: Number })
  async deleteConversation(
    @Param('otherUserId') otherUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.messagesService.deleteConversation(userId, otherUserId);
    return { ok: true, message: '채팅 삭제 완료' };
  }
}
