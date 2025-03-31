// users.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me') // GET /users/me
  getProfile(@Req() req: Request) {
    console.log('요청한 사용자 정보:', req.user);
    return req.user;
  }
}
