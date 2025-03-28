import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  // 구글 로그인
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    console.log('[Google Login] user:', user);
    return res.send(user);
  }

  // 카카오 로그인
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    console.log('[Kakao Login] user:', user);
    return res.send(user);
  }

  // 네이버 로그인
  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {}

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    console.log('[Naver Login] user:', user);
    return res.send(user);
  }
}
