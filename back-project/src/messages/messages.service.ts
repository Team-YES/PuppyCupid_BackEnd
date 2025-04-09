import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  // 보내기
  async sendMessage(
    sendId: number,
    receiverId: number,
    content: string,
  ): Promise<Message | null> {
    if (
      content === '채팅 신청합니다!' ||
      content === '산책 메이트 신청합니다!'
    ) {
      const existing = await this.messageRepository.findOne({
        where: [
          { sender: { id: sendId }, receiver: { id: receiverId } },
          { sender: { id: receiverId }, receiver: { id: sendId } },
        ],
        relations: ['sender', 'receiver'],
      });

      if (existing) return null;
    }

    const message = this.messageRepository.create({
      sender: { id: sendId } as User,
      receiver: { id: receiverId } as User,
      content,
    });
    return await this.messageRepository.save(message);
  }

  // 채팅 유저
  async getChatUsers(userId: number): Promise<
    {
      id: number;
      nickName: string;
      dogImage: string | null;
      lastMessage: string;
      lastMessageTime: string;
    }[]
  > {
    const messages = await this.messageRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver', 'sender.dogs', 'receiver.dogs'],
      order: { created_at: 'DESC' },
    });

    const result = new Map<number, any>();

    for (const msg of messages) {
      if (msg.sender.id === userId && msg.senderDeleted) continue;
      if (msg.receiver.id === userId && msg.receiverDeleted) continue;

      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
      const dogs = otherUser.dogs || [];
      const dogImage = dogs.length > 0 ? dogs[0].dog_image : null;

      if (!result.has(otherUser.id)) {
        result.set(otherUser.id, {
          id: otherUser.id,
          nickName: otherUser.nickName,
          dogImage,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at.toISOString(),
        });
      }
    }

    return Array.from(result.values());
  }

  // 유저 간 채팅
  async getConversation(
    userId: number,
    otherUserId: number,
  ): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });

    return messages.filter((msg) => {
      if (msg.sender.id === userId && msg.senderDeleted) return false;
      if (msg.receiver.id === userId && msg.receiverDeleted) return false;
      return true;
    });
  }

  // 채팅 삭제
  async deleteConversation(userId: number, otherUserId: number): Promise<void> {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
    });

    const nickName = await this.usersService.getUserNickName(userId);
    const systemMessage = this.messageRepository.create({
      sender: { id: userId },
      receiver: { id: otherUserId },
      content: `💬 ${nickName}님이 채팅방을 나가셨습니다.`,
      system: true,
      senderDeleted: true,
      receiverDeleted: true,
    });
    await this.messageRepository.save(systemMessage);

    for (const message of messages) {
      if (message.sender.id === userId) {
        message.senderDeleted = true;
      }
      if (message.receiver.id === userId) {
        message.receiverDeleted = true;
      }
    }
    await this.messageRepository.save(messages);
  }
}
