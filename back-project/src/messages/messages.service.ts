import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // 보내기
  async sendMessage(
    sendId: number,
    receiverId: number,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      sender: { id: sendId } as User,
      receiver: { id: receiverId } as User,
      content,
    });
    return await this.messageRepository.save(message);
  }

  // 채팅한 유저 정보
  async getChatUsers(userId: number): Promise<User[]> {
    const messages = await this.messageRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver'],
    });

    const users = new Map<number, User>();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) {
        console.warn('⚠️ sender 또는 receiver가 null입니다:', msg);
        continue; // null이면 무시
      }

      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;

      if (otherUser && otherUser.id) {
        users.set(otherUser.id, otherUser);
      }
    }

    return Array.from(users.values());
  }

  // 유저 간 채팅
  async getConversation(
    userId: number,
    otherUserId: number,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });
  }
}
