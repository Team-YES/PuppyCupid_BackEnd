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
      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
      users.set(otherUser.id, otherUser);
    }

    return Array.from(users.values());
  }

  // 유저 간 메세지
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
