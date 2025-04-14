import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { User, Gender, UserRole } from './users.entity';

interface CreateUserInput {
  email: string;
  nickname?: string;
  photo?: string;
  provider: 'google' | 'kakao' | 'naver';
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 모든 유저 찾기
  findAllUser() {
    return this.userRepository.find();
  }

  findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findUserByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  findUserByNickname(nickName: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { nickName } });
  }

  async findUserWithDogs(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['dogs'],
    });
  }

  async getUserNickName(userId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.nickName ?? '알 수 없음';
  }

  async updatePhoneNumber(userId: number, phone: string) {
    await this.userRepository.update({ id: userId }, { phone });
  }

  async setPhoneVerified(userId: number) {
    await this.userRepository.update({ id: userId }, { isPhoneVerified: true });
  }

  async createUser(user: CreateUserInput): Promise<User> {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  async updateProfile(
    userId: number,
    update: { phone: string; nickName: string; gender: Gender },
  ) {
    await this.userRepository.update(userId, {
      phone: update.phone,
      nickName: update.nickName,
      gender: update.gender,
    });
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  // 유저 삭제
  async deleteUser(params: {
    targetUserId: number;
    requester: { id: number; role: UserRole };
  }): Promise<User> {
    const { targetUserId, requester } = params;

    // 관리자 또는 본인만 삭제 가능
    if (requester.role !== UserRole.ADMIN && requester.id !== targetUserId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    return this.userRepository.remove(user);
  }

  // 유효기간 지난 유저
  async findExpiredUsers(currentDate: Date) {
    return this.userRepository.find({
      where: [
        {
          role: UserRole.POWER_MONTH,
          power_expired_at: LessThan(currentDate),
        },
        { role: UserRole.POWER_YEAR, power_expired_at: LessThan(currentDate) },
      ],
    });
  }
}
