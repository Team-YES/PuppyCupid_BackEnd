import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follows.entity';
import { User } from '@/users/users.entity';
import { NotificationsService } from '@/notifications/notifications.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 팔로우, 언팔로우
  async toggleFollow(
    followerId: number,
    followingId: number,
  ): Promise<{ followed: boolean }> {
    const existing = await this.followRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });

    if (existing) {
      await this.followRepository.remove(existing);
      return { followed: false };
    }

    const follow = this.followRepository.create({
      follower: { id: followerId } as User,
      following: { id: followingId } as User,
    });

    await this.followRepository.save(follow);

    const followerUser = await this.usersService.findUserById(followerId);

    await this.notificationsService.createNotification(
      followingId,
      `${followerUser?.nickName || '누군가'}님이 회원님을 팔로우했습니다.`,
    );
    return { followed: true };
  }

  // 팔로우 상태 확인
  async followStatus(
    userId: number,
    targetUserId: number,
  ): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> {
    const isFollowing = await this.followRepository.findOne({
      where: { follower: { id: userId }, following: { id: targetUserId } },
    });

    const isFollowedBy = await this.followRepository.findOne({
      where: { follower: { id: targetUserId }, following: { id: userId } },
    });

    return {
      isFollowing: !!isFollowing,
      isFollowedBy: !!isFollowedBy,
    };
  }

  // 팔로워 목록
  async getFollowers(userId: number): Promise<any[]> {
    const follows = await this.followRepository.find({
      where: { following: { id: userId } }, // 내가 팔로우 당한 사람들 = 나를 팔로우한 사람들
      relations: ['follower', 'follower.dogs'],
    });

    return follows.map((follow) => {
      const follower = follow.follower;
      return {
        id: follower.id,
        nickName: follower.nickName,
        dogImage: follower.dogs?.[0]?.dog_image || null,
      };
    });
  }

  // 팔로잉 목록
  async getFollowings(userId: number): Promise<any[]> {
    const follows = await this.followRepository.find({
      where: { follower: { id: userId } }, // 내가 팔로우한 사람들
      relations: ['following', 'following.dogs'],
    });

    return follows.map((follow) => {
      const following = follow.following;
      return {
        id: following.id,
        nickName: following.nickName,
        dogImage: following.dogs?.[0]?.dog_image || null,
      };
    });
  }

  // 팔로우 팔로워 개수

  // 나를 팔로우한 사람들
  async countFollowers(userId: number): Promise<number> {
    return this.followRepository.count({
      where: { following: { id: userId } },
    });
  }

  // 내가 팔로우한 사람들
  async countFollowings(userId: number): Promise<number> {
    return this.followRepository.count({
      where: { follower: { id: userId } },
    });
  }
}
