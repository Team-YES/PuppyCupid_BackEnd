import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dog, GenderType } from './dogs.entity';
import { User } from '../users/users.entity';
import { MbtiType } from './dogs.entity';

export interface CreateInfoInput {
  userId: number;
  name: string;
  age: number;
  breed: string;
  mbti?: string;
  gender: string;
  personality: string;
  dog_image: string;
  latitude: number | null;
  longitude: number | null;
  dong_name: string;
}

export interface UpdateInfoInput {
  dogId: number;
  userId: number;
  name: string;
  age: number;
  breed: string;
  mbti?: string;
  gender: string;
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
      gender,
    } = dog;

    const newDog = this.dogRepository.create({
      name,
      age,
      breed,
      mbti: mbti as MbtiType,
      gender: gender as GenderType,
      personality,
      dog_image,
      latitude,
      longitude,
      dong_name,
      user: { id: userId } as User,
    });

    return await this.dogRepository.save(newDog);
  }

  async updateDogInfo(input: UpdateInfoInput): Promise<Dog> {
    const {
      dogId,
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
      gender,
    } = input;

    const dog = await this.dogRepository.findOne({
      where: { id: dogId, user: { id: userId } },
      relations: ['user'],
    });

    if (!dog) {
      throw new Error('해당 유저의 강아지 정보를 찾을 수 없습니다.');
    }
    dog.name = name;
    dog.age = age;
    dog.breed = breed;
    dog.mbti = mbti as MbtiType;
    dog.gender = gender as GenderType;
    dog.personality = personality;
    dog.dog_image = dog_image;
    dog.latitude = latitude;
    dog.longitude = longitude;
    dog.dong_name = dong_name;

    // 저장
    return await this.dogRepository.save(dog);
  }

  async findDogByUserID(userId: number): Promise<Dog | null> {
    return await this.dogRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
