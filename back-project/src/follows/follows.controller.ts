import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/users/users.controller';

@Controller('follows')
@UseGuards(AuthGuard('jwt'))
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':targetUserId')
  async toggleFollow(
    @Param('targetUserId') targetUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const result = await this.followsService.toggleFollow(userId, targetUserId);
    return { ok: true, ...result };
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: number) {
    const users = await this.followsService.getFollowers(userId);
    return { ok: true, users };
  }

  @Get('followings/:userId')
  async getFollowings(@Param('userId') userId: number) {
    const users = await this.followsService.getFollowings(userId);
    return { ok: true, users };
  }

  // 팔로우 상태 가져오기
  @Get('status/:targetUserId')
  async getStatus(
    @Param('targetUserId') targetUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const status = await this.followsService.followStatus(userId, targetUserId);
    return { ok: true, ...status };
  }
}
