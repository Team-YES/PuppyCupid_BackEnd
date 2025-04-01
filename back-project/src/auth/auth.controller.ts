import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  // 구글 로그인
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req, res);

    if (!result.ok) {
      return res.redirect('http://localhost:3000/login-failed');
    }

    const { eid_access_token } = result;

    return res.redirect(`http://localhost:3000`);
  }

  // // 카카오 로그인
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.kakaoLogin(req, res);

    if (!result.ok) {
      return res.redirect('http://localhost:3000/login-failed');
    }

    return res.redirect(`http://localhost:3000`);
  }

  // 네이버 로그인
  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {
    console.log('[네이버 로그인 요청 도착]');
  }

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.naverLogin(req, res);

    if (!result.ok) {
      return res.redirect('http://localhost:3000/login-failed');
    }

    return res.redirect(`http://localhost:3000`);
  }

  @Get('/check')
  async checkLogin(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) return { isLoggedIn: false };

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      );
      return {
        isLoggedIn: true,
        user: payload,
      };
    } catch {
      return { isLoggedIn: false };
    }
  }

  @Get('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('eid_refresh_token');
    res.clearCookie('access_token');

    return res.status(200).json({
      ok: true,
      message: '로그아웃 성공',
    });
  }
}
