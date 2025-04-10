import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { ChatCondition } from 'src/messages/chatCondition.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ChatCondition)
    private readonly chatConditionRepository: Repository<ChatCondition>,
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

    const exitedConditions = await this.chatConditionRepository.find({
      where: { userId },
    });

    const exitedUserIds = exitedConditions
      .filter((cond) => cond.exited)
      .map((cond) => cond.otherUserId);

    const result = new Map<number, any>();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;

      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;

      if (exitedUserIds.includes(otherUser.id)) continue;

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
    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });
  }

  // 내 화면에서만 채팅 삭제
  // async deleteMyMessage(userId: number, otherUserId: number): Promise<void> {
  //   const messages = await this.messageRepository.find({
  //     where: [
  //       { sender: { id: userId }, receiver: { id: otherUserId } },
  //       { sender: { id: otherUserId }, receiver: { id: userId } },
  //     ],
  //     relations: ['sender', 'receiver'],
  //   });

  //   for (const message of messages) {
  //     if (message.sender.id === userId) {
  //       message.senderDeleted = true;
  //     }
  //     if (message.receiver.id === userId) {
  //       message.receiverDeleted = true;
  //     }
  //   }

  //   await this.messageRepository.save(messages);
  // }

  // 채팅 삭제
  async deleteConversation(userId: number, otherUserId: number): Promise<void> {
    let myCondition = await this.chatConditionRepository.findOne({
      where: { userId, otherUserId },
    });

    if (!myCondition) {
      myCondition = this.chatConditionRepository.create({
        userId,
        otherUserId,
        exited: true,
      });
    } else {
      myCondition.exited = true;
    }

    await this.chatConditionRepository.save(myCondition);

    const otherCondition = await this.chatConditionRepository.findOne({
      where: { userId: otherUserId, otherUserId: userId },
    });

    // 상대가 아직 안 나갔으면 시스템 메시지 생성
    if (!otherCondition || !otherCondition.exited) {
      const user = { id: userId } as User;
      const otherUser = { id: otherUserId } as User;
      const nickName = await this.usersService.getUserNickName(userId);
      const exitMessage = this.messageRepository.create({
        sender: user,
        receiver: otherUser,
        content: `${nickName}님이 채팅을 나갔습니다.`,
        system: true,
      });

      await this.messageRepository.save(exitMessage);
    }

    // 두 명 다 나간 경우에만 메시지 삭제
    if (myCondition.exited && otherCondition?.exited) {
      const messages = await this.messageRepository.find({
        where: [
          { sender: { id: userId }, receiver: { id: otherUserId } },
          { sender: { id: otherUserId }, receiver: { id: userId } },
        ],
        relations: ['sender', 'receiver'],
      });

      await this.messageRepository.remove(messages);

      // 둘 다 나갔으면 chatCondition도 삭제 (선택사항)
      await this.chatConditionRepository.remove([myCondition, otherCondition]);
    }
  }
}
