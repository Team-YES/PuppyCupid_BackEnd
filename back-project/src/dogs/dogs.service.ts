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
  latitude: number | null;
  longitude: number | null;
  dong_name: string;
}

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
  ) {}

  async createDogInfo(dog: CreateInfoInput): Promise<Dog> {
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
    } = dog;

    const newDog = this.dogRepository.create({
      name,
      age,
      breed,
      mbti: mbti as MbtiType,
      personality,
      dog_image,
      latitude,
      longitude,
      dong_name,
      user: { id: userId } as User,
    });

    return await this.dogRepository.save(newDog);
  }
}
