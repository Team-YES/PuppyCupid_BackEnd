import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/users/users.controller';
import { User } from 'src/users/users.entity';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  FollowUserDto,
  FollowStatusDto,
  ToggleFollowResponseDto,
} from './dto/follows.dto';

@ApiTags('팔로우')
@Controller('follows')
@UseGuards(AuthGuard('jwt'))
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // 팔로우 토글
  @Post(':targetUserId')
  @ApiOperation({ summary: '팔로우/언팔로우 토글' })
  @ApiParam({ name: 'targetUserId', type: Number, description: '상대 유저 ID' })
  @ApiOkResponse({
    description: '팔로우 or 언팔로우 처리 결과',
    type: ToggleFollowResponseDto,
  })
  async toggleFollow(
    @Param('targetUserId') targetUserId: string,
    @Req() req: AuthRequest,
  ): Promise<{ followed: boolean }> {
    const myId = req.user.id;
    return this.followsService.toggleFollow(myId, parseInt(targetUserId));
  }

  // 팔로워 목록
  @ApiOperation({ summary: '팔로워 목록 조회' })
  @ApiParam({ name: 'userId', type: Number, description: '대상 유저 ID' })
  @ApiOkResponse({
    description: '나를 팔로우한 유저 목록',
    type: FollowUserDto,
    isArray: true,
  })
  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: number): Promise<User[]> {
    return this.followsService.getFollowers(userId);
  }

  // 팔로잉 목록
  @Get('followings/:userId')
  @ApiOperation({ summary: '팔로잉 목록 조회' })
  @ApiParam({ name: 'userId', type: Number, description: '대상 유저 ID' })
  @ApiOkResponse({
    description: '내가 팔로우한 유저 목록',
    type: FollowUserDto,
    isArray: true,
  })
  async getFollowings(@Param('userId') userId: number) {
    const users = await this.followsService.getFollowings(userId);
    return { ok: true, users };
  }

  // 팔로우 상태 가져오기
  @Get('status/:targetUserId')
  @ApiOperation({
    summary: '팔로우 상태 확인',
    description:
      '내가 특정 유저를 팔로우 중인지, 상대가 나를 팔로우 중인지 여부를 확인합니다.',
  })
  @ApiParam({ name: 'targetUserId', type: Number, description: '상대 유저 ID' })
  @ApiOkResponse({
    description: '팔로우 상태 정보',
    type: FollowStatusDto,
  })
  async getStatus(
    @Param('targetUserId') targetUserId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const status = await this.followsService.followStatus(userId, targetUserId);
    return { ok: true, ...status };
  }
}
