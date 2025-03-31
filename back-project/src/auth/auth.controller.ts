import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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

    return res.redirect(
      `http://localhost:3000/social-login-success?token=${eid_access_token}`,
    );
  }

  // 카카오 로그인
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

    return res.redirect(
      `http://localhost:3000/social-login-success?token=${result.eid_access_token}`,
    );
  }

  // 네이버 로그인
  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {}

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.naverLogin(req, res);

    if (!result.ok) {
      return res.redirect('http://localhost:3000/login-failed');
    }

    return res.redirect(
      `http://localhost:3000/social-login-success?token=${result.eid_access_token}`,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/check')
  checkLogin(@Req() req: Request) {
    return {
      isLoggedIn: true,
      user: req.user,
    };
  }
}
