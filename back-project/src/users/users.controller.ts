import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from './users.service';
import { PostsService } from 'src/posts/posts.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { InteractionsService } from 'src/interactions/interactions.service';
import { UserRole } from './users.entity';
import { Gender } from './users.entity';
import { FollowsService } from 'src/follows/follows.service';
export interface AuthRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
    private readonly notificationsService: NotificationsService,
    private readonly followsService: FollowsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async findUserById(@Req() req: Request) {
    const user = req.user as any;
    const fullUser = await this.usersService.findUserById(user.id);

    if (!fullUser) {
      return {
        ok: false,
        error: '유저 정보를 찾을 수 없습니다.',
      };
    }

    return {
      ok: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        nickName: fullUser.nickName,
        phone: fullUser.phone,
      },
    };
  }

  @Get('/nickName')
  @UseGuards(AuthGuard('jwt'))
  async checkNickname(@Query('nickName') nickName: string) {
    if (!nickName) {
      return { ok: false, error: '닉네임을 입력해주세요.' };
    }

    const user = await this.usersService.findUserByNickname(nickName);

    if (user) {
      return { ok: false, message: '이미 사용 중인 닉네임입니다.' };
    }

    return { ok: true, message: '사용 가능한 닉네임입니다.' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update')
  async updateform(
    @Req() req: Request,
    @Body() body: { nickname: string; phone: string; gender: Gender },
  ) {
    const user = req.user as any;
    await this.usersService.updateProfile(user.id, {
      nickName: body.nickname,
      phone: body.phone,
      gender: body.gender,
    });
    return { ok: true, message: '정보 수정 완료' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  async getMypageData(
    @Req() req: Request,
    @Query() query: Record<string, string>,
  ) {
    const user = req.user as any;
    const userId = user.id;

    const limit = parseInt(query.limit ?? '9');

    const pageKey = Object.keys(query).find((key) => key.endsWith('Page'));

    if (!pageKey) {
      return {
        ok: false,
        error: '페이지 정보를 찾을 수 없습니다.',
      };
    }

    const type = pageKey.replace('Page', '');
    const page = parseInt(query[pageKey] ?? '1');

    try {
      const [postCount, followerCount, followingCount, followers, followings] =
        await Promise.all([
          this.postsService.countPostsByUser(userId),
          this.followsService.countFollowers(userId),
          this.followsService.countFollowings(userId),
          this.followsService.getFollowers(userId),
          this.followsService.getFollowings(userId),
        ]);

      const stats = {
        postCount,
        followerCount,
        followingCount,
        followers,
        followings,
      };

      if (type === 'posts') {
        const result = await this.postsService.findPostsByUser(
          userId,
          page,
          limit,
        );

        return {
          ok: true,
          posts: {
            items: result.items,
            totalCount: result.totalCount,
            hasMore: page * limit < result.totalCount,
          },
          ...stats,
        };
      } else if (type === 'liked') {
        const result = await this.interactionsService.findLikedPostsByUser(
          userId,
          page,
          limit,
        );
        return {
          ok: true,
          liked: {
            items: result.items,
            totalCount: result.totalCount,
            hasMore: page * limit < result.totalCount,
          },
          ...stats,
        };
      } else if (type === 'notifications') {
        const result = await this.notificationsService.findByUser(
          userId,
          page,
          limit,
        );
        return {
          ok: true,
          notifications: {
            items: result.items,
            totalCount: result.totalCount,
            hasMore: page * limit < result.totalCount,
          },
          ...stats,
        };
      } else {
        return {
          ok: false,
          error: `알 수 없는 타입입니다: ${type}`,
        };
      }
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error: '서버 오류 발생',
      };
    }
  }

  @Get('otherpage/:otherUserId')
  @UseGuards(AuthGuard('jwt'))
  async getOtherpageData(
    @Param('otherUserId') otherUserId: string,
    @Req() req: Request,
    @Query() query: Record<string, string>,
  ) {
    const targetUserId = parseInt(otherUserId);

    if (isNaN(targetUserId)) {
      return {
        ok: false,
        error: '올바른 userId가 필요합니다.',
      };
    }

    const limit = parseInt(query.limit ?? '9');
    const pageKey = Object.keys(query).find((key) => key.endsWith('Page'));

    if (!pageKey) {
      return {
        ok: false,
        error: '페이지 정보를 찾을 수 없습니다.',
      };
    }

    const type = pageKey.replace('Page', '');
    const page = parseInt(query[pageKey] ?? '1');

    try {
      const [
        postCount,
        followerCount,
        followingCount,
        followers,
        followings,
        targetUser,
      ] = await Promise.all([
        this.postsService.countPostsByUser(targetUserId),
        this.followsService.countFollowers(targetUserId),
        this.followsService.countFollowings(targetUserId),
        this.followsService.getFollowers(targetUserId),
        this.followsService.getFollowings(targetUserId),
        this.usersService.findUserWithDogs(targetUserId),
      ]);

      if (!targetUser) {
        return {
          ok: false,
          error: '대상 유저를 찾을 수 없습니다.',
        };
      }

      const stats = {
        postCount,
        followerCount,
        followingCount,
        followers,
        followings,
        dogs: targetUser?.dogs ?? [],
        nickName: targetUser.nickName ?? '알 수 없음',
      };

      if (type === 'posts') {
        const result = await this.postsService.findPostsByUser(
          targetUserId,
          page,
          limit,
        );
        return {
          ok: true,
          posts: {
            items: result.items,
            totalCount: result.totalCount,
            hasMore: page * limit < result.totalCount,
          },
          ...stats,
        };
      }

      return {
        ok: false,
        error: `알 수 없는 타입: ${type}`,
      };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error: '서버 오류 발생',
      };
    }
  }

  @Delete(':userId')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: AuthRequest,
  ) {
    const { id: requesterId, role } = req.user;

    return this.usersService.deleteUser({
      targetUserId: userId,
      requester: {
        id: requesterId,
        role,
      },
    });
  }
}
