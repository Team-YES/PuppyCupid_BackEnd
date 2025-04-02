import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dog } from './dogs.entity';

import { User } from '../users/users.entity';
import { MbtiType } from './dogs.entity';

export interface CreateInfoInput {
  userId: number;
  name: string;
  age: number;
  breed: string;
  mbti?: string;
  personality: string;
  dog_image: string;
  latitude: number;
  longitude: number;
  dong_name: string;
}

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
  ) {}

  async createDogInfo(input: CreateInfoInput): Promise<Dog> {
    const {
      userId,
      name,
      age,
      breed,
      mbti,
      personality,
      dog_image,
      latitude,
      longitude,
      dong_name,
    } = input;

    const dog = this.dogRepository.create({
      user: { id: userId } as User,
      name,
      age,
      breed,
      mbti: mbti as MbtiType,
      personality,
      dog_image,
      latitude,
      longitude,
      dong_name,
    });

    return await this.dogRepository.save(dog);
  }
}
