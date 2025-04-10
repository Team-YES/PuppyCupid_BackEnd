import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follows.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 팔로우, 언팔로우
  async toggleFollow(
    FollowerId: number,
    followingId: number,
  ): Promise<{ followed: boolean }> {
    const existing = await this.followRepository.findOne({
      where: { follower: { id: followingId }, following: { id: followingId } },
    });

    if (existing) {
      await this.followRepository.remove(existing);
      return { followed: false };
    }

    const follow = this.followRepository.create({
      follower: { id: followingId } as User,
      following: { id: followingId } as User,
    });

    await this.followRepository.save(follow);
    return { followed: true };
  }

  // 팔로워 목록
  async getFollowers(userId: number): Promise<User[]> {
    const follows = await this.followRepository.find({
      where: { follower: { id: userId } },
      relations: ['follower'],
    });
    return follows.map((x) => x.follower);
  }

  // 팔로잉 목록
  async getFollowings(userId: number): Promise<User[]> {
    const follows = await this.followRepository.find({
      where: { follower: { id: userId } },
      relations: ['following'],
    });
    return follows.map((x) => x.following);
  }

  // 팔로우 팔로워 개수

  // 나를 팔로우한 사람들
  async countFollowers(userId: number): Promise<number> {
    return this.followRepository.count({
      where: { follower: { id: userId } },
    });
  }

  // 내가 팔로우한 사람들
  async countFollowings(userId: number): Promise<number> {
    return this.followRepository.count({
      where: { following: { id: userId } },
    });
  }
}
