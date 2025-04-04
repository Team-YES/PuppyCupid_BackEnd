// users.controller.ts
import {
  Body,
  Controller,
  Get,
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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
    private readonly notificationsService: NotificationsService,
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
    @Body() body: { nickname: string; phone: string },
  ) {
    const user = req.user as any;
    await this.usersService.updateProfile(user.id, {
      nickName: body.nickname,
      phone: body.phone,
    });
    return { ok: true, message: '정보 수정 완료' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  async getMypageData(@Req() req: Request) {
    const user = req.user as any;
    const userId = user.id;

    const [posts, liked, notifications] = await Promise.all([
      this.postsService.findPostsByUser(userId),
      this.interactionsService.findLikedPostsByUser(userId),
      this.notificationsService.findByUser(userId),
    ]);

    return {
      ok: true,
      posts,
      liked,
      notifications,
    };
  }
}
