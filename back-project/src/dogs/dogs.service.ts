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
}

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
  ) {}

  // 강아지 정보 저장
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
      user: { id: userId } as User,
    });

    return await this.dogRepository.save(newDog);
  }

  // 강아지 정보 수정
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

    return await this.dogRepository.save(dog);
  }

  // 강아지 위치 저장
  async updateLocation(
    userId: number,
    dogId: number,
    latitude: number,
    longitude: number,
  ): Promise<{ ok: boolean }> {
    const dog = await this.dogRepository.findOne({
      where: { id: dogId, user: { id: userId } },
      relations: ['user'],
    });

    if (!dog) {
      throw new Error('해당 강아지를 찾을 수 없습니다');
    }

    dog.latitude = latitude;
    dog.longitude = longitude;

    await this.dogRepository.save(dog);

    return { ok: true };
  }

  // 3km 이내 강아지 조회
  async findNearbyDogs(dogId: number): Promise<Dog[]> {
    const myDog = await this.dogRepository.findOne({
      where: { id: dogId },
    });

    if (!myDog || myDog.latitude === null || myDog.longitude === null) {
      throw new Error('위치 정보가 없습니다.');
    }

    return this.dogRepository
      .createQueryBuilder('dog')
      .where('dog.id != :myDogId', { myDogId: dogId })
      .andWhere('dog.latitude IS NOT NULL AND dog.longitude IS NOT NULL')
      .andWhere(
        `ST_Distance_Sphere(
          point(dog.longitude, dog.latitude),
          point(:lng, :lat)
        ) <= :radius`,
        {
          lat: myDog.latitude,
          lng: myDog.longitude,
          radius: 3000, // 3km
        },
      )
      .getMany();
  }

  // 유저 프로필에 강아지 정보
  async findDogByUserID(userId: number): Promise<Dog | null> {
    return await this.dogRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
