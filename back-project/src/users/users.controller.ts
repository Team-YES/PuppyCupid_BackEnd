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
import { User, UserRole } from './users.entity';
import { FollowsService } from 'src/follows/follows.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import {
  NicknameCheckResponseDto,
  UpdateUserProfileDto,
  UserInfoDto,
} from './dto/users.dto';
import { PostCategory } from 'src/posts/posts.entity';
import { PostImage } from 'src/posts/post_images.entity';
import { Like } from 'src/interactions/likes.entity';

export interface AuthRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}
@ApiTags('유저')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
    private readonly notificationsService: NotificationsService,
    private readonly followsService: FollowsService,
  ) {}

  @Get('info')
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'JWT를 통해 로그인한 유저의 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: UserInfoDto })
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

  @Get('nickName')
  @ApiOperation({
    summary: '닉네임 중복 확인',
    description: '닉네임이 사용 가능한지 확인합니다.',
  })
  @ApiOkResponse({ type: NicknameCheckResponseDto })
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

  @Put('update')
  @ApiOperation({
    summary: '프로필 수정',
    description: '전화번호, 닉네임, 성별을 수정합니다.',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  async updateform(@Req() req: Request, @Body() body: UpdateUserProfileDto) {
    const user = req.user as any;
    await this.usersService.updateProfile(user.id, {
      nickName: body.nickname,
      phone: body.phone,
      gender: body.gender,
    });
    return { ok: true, message: '정보 수정 완료' };
  }

  @Get('mypage')
  @ApiOperation({
    summary: '마이페이지 조회',
    description: '로그인한 유저의 마이페이지 데이터를 조회합니다.',
  })
  @ApiQuery({ name: 'postsPage', required: false })
  @ApiQuery({ name: 'likedPage', required: false })
  @ApiQuery({ name: 'notificationsPage', required: false })
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
        const enrichedItems = await Promise.all(
          result.items.map(async (post) => {
            const commentCount =
              await this.interactionsService.countCommentsByPostId(post.id);
            return {
              ...post,
              commentCount,
              liked: true,
            };
          }),
        );

        return {
          ok: true,
          liked: {
            items: enrichedItems,
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
  @ApiOperation({
    summary: '다른 유저 마이페이지',
    description: '다른 유저의 마이페이지 정보를 조회합니다.',
  })
  @ApiParam({ name: 'otherUserId', type: Number, description: '다른 유저 ID' })
  @ApiQuery({ name: 'postsPage', required: false })
  async getOtherpageData(
    @Param('otherUserId') otherUserId: string,
    @Req() req: Request,
    @Query() query: Record<string, string>,
  ) {
    const targetUserId = parseInt(otherUserId);

    if (!targetUserId) {
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

        const enrichedItems = result.items.map((post) => {
          const dogImage = post.user?.dogs?.[0]?.dog_image || null;
          return {
            ...post,
            user: {
              ...post.user,
              dogs: post.user?.dogs || [],
              dogImage,
            },
          };
        });

        return {
          ok: true,
          posts: {
            items: enrichedItems,
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
  @ApiOperation({
    summary: '유저 삭제',
    description: '해당 유저를 삭제합니다. 관리자 또는 본인만 가능.',
  })
  @ApiParam({ name: 'userId', type: Number, description: '삭제할 유저 ID' })
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
