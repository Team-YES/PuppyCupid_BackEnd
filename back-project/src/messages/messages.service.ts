import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';
import { ChatCondition } from 'src/messages/chatCondition.entity';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ChatCondition)
    private readonly chatConditionRepository: Repository<ChatCondition>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendMessage(
    sendId: number,
    receiverId: number,
    content: string,
  ): Promise<Message | null> {
    const isRequest =
      content === '채팅 신청합니다!' || content === '산책 메이트 신청합니다!';

    const [myExit, otherExit] = await Promise.all([
      this.chatConditionRepository.findOne({
        where: { userId: sendId, otherUserId: receiverId },
      }),
      this.chatConditionRepository.findOne({
        where: { userId: receiverId, otherUserId: sendId },
      }),
    ]);

    if (isRequest) {
      const userNickName = await this.usersService.getUserNickName(sendId);

      await this.notificationsService.createNotification(
        receiverId,
        `${userNickName}님이 회원님이 채팅을 보냈습니다.`,
      );
    }

    if (!isRequest) {
      if (otherExit?.exited) return null;
    } else {
      const messages = await this.messageRepository.find({
        where: [
          { sender: { id: sendId }, receiver: { id: receiverId } },
          { sender: { id: receiverId }, receiver: { id: sendId } },
        ],
        relations: ['sender', 'receiver'],
      });

      const canReapply = myExit?.exited && (!otherExit || !otherExit.exited);
      if (messages.length > 0 && !canReapply) return null;

      if (canReapply && myExit?.exitedAt) {
        for (const msg of messages) {
          if (msg.created_at <= myExit.exitedAt) {
            if (msg.sender.id === sendId) msg.senderDeleted = true;
            if (msg.receiver.id === sendId) msg.receiverDeleted = true;
          }
        }
        await this.messageRepository.save(messages);
      }

      if (myExit?.exited) {
        myExit.exited = false;
        myExit.exitedAt = null;
        await this.chatConditionRepository.save(myExit);
      }
    }

    const newMessage = this.messageRepository.create({
      sender: { id: sendId } as User,
      receiver: { id: receiverId } as User,
      content,
    });

    return this.messageRepository.save(newMessage);
  }

  async getChatUsers(userId: number): Promise<
    {
      id: number;
      nickName: string;
      dogImage: string | null;
      lastMessage: string;
      lastMessageTime: string;
    }[]
  > {
    const [messages, myExitedConditions] = await Promise.all([
      this.messageRepository.find({
        where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
        relations: ['sender', 'receiver', 'sender.dogs', 'receiver.dogs'],
        order: { created_at: 'DESC' },
      }),
      this.chatConditionRepository.find({ where: { userId, exited: true } }),
    ]);

    const exitedUserIds = new Set(
      myExitedConditions.map((cond) => cond.otherUserId),
    );
    const result = new Map<number, any>();

    for (const msg of messages) {
      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
      if (!otherUser || exitedUserIds.has(otherUser.id)) continue;

      const dogImage = otherUser.dogs?.[0]?.dog_image || null;

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

  async getConversation(
    userId: number,
    otherUserId: number,
  ): Promise<Message[]> {
    const myCondition = await this.chatConditionRepository.findOne({
      where: { userId, otherUserId },
    });

    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });

    return messages.filter((msg) => {
      if (myCondition?.exitedAt && msg.created_at <= myCondition.exitedAt) {
        return false;
      }

      // 삭제된 메시지 필터링
      if (
        (msg.sender.id === userId && msg.senderDeleted) ||
        (msg.receiver.id === userId && msg.receiverDeleted)
      ) {
        return false;
      }

      return true;
    });
  }

  async deleteConversation(userId: number, otherUserId: number): Promise<void> {
    let myCondition = await this.chatConditionRepository.findOne({
      where: { userId, otherUserId },
    });

    if (!myCondition) {
      myCondition = this.chatConditionRepository.create({
        userId,
        otherUserId,
        exited: true,
        exitedAt: new Date(),
      });
    } else {
      myCondition.exited = true;
      myCondition.exitedAt = new Date();
    }

    await this.chatConditionRepository.save(myCondition);

    const otherCondition = await this.chatConditionRepository.findOne({
      where: { userId: otherUserId, otherUserId: userId },
    });

    const isFirstToExit = !otherCondition || !otherCondition.exited;
    if (isFirstToExit) {
      const nickName = await this.usersService.getUserNickName(userId);
      const systemMessage = this.messageRepository.create({
        sender: { id: userId } as User,
        receiver: { id: otherUserId } as User,
        content: `${nickName}님이 채팅을 나갔습니다.`,
        system: true,
      });

      await this.messageRepository.save(systemMessage);
    }

    if (myCondition.exited && otherCondition?.exited) {
      const messages = await this.messageRepository.find({
        where: [
          { sender: { id: userId }, receiver: { id: otherUserId } },
          { sender: { id: otherUserId }, receiver: { id: userId } },
        ],
        relations: ['sender', 'receiver'],
        withDeleted: true,
      });

      await this.messageRepository.remove(messages);
      await this.chatConditionRepository.remove([myCondition, otherCondition]);
    }
  }
}
