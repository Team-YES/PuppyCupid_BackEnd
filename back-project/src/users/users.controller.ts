// users.controller.ts
import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  getProfile(@Req() req: Request) {
    return req.user;
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
}
