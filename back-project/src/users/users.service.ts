import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, Gender } from './users.entity';

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
    update: { phone: string; nickName: string },
  ) {
    await this.userRepository.update(userId, {
      phone: update.phone,
      nickName: update.nickName,
    });
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
