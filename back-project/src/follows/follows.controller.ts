import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/users/users.controller';
import { User } from 'src/users/users.entity';

@Controller('follows')
@UseGuards(AuthGuard('jwt'))
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // 팔로우 토글
  @Post(':targetUserId')
  async toggleFollow(
    @Param('targetUserId') targetUserId: string,
    @Req() req: AuthRequest,
  ): Promise<{ followed: boolean }> {
    const myId = req.user.id;
    return this.followsService.toggleFollow(myId, parseInt(targetUserId));
  }

  // 팔로워 목록
  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: number): Promise<User[]> {
    return this.followsService.getFollowers(userId);
  }

  // 팔로잉 목록
  @Get('followings/:userId')
  async getFollowings(@Param('userId') userId: number) {
    const users = await this.followsService.getFollowings(userId);
    return { ok: true, users };
  }

  // 팔로우 상태 확인
  @Get('status/:targetUserId')
  async getFollowStatus(
    @Param('targetUserId') targetUserId: number,
    @Req() req: AuthRequest,
  ) {
    const myId = req.user.id;

    const result = await this.followsService.getFollowStatus(
      myId,
      targetUserId,
    );
    return { ok: true, ...result };
  }
}
