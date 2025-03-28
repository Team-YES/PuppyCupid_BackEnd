import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';

interface CreateUserInput {
  email: string;
  nickname?: string;
  photo?: string;
  type: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAllUser() {
    return this.userRepository.find();
  }

  findUser(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(user: CreateUserInput): Promise<User> {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
