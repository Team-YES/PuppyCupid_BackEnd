import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';

interface JwtUser {
  id: number;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
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

  // 전화번호
  @Post('/update-phone')
  @UseGuards(AuthGuard('jwt'))
  async updatePhone(
    @Req() req: Request,
    @Body() body: { phone: string },
    @Res() res: Response,
  ) {
    const user = req.user as JwtUser;
    const userId = user.id;

    const existingByPhone = await this.userService.findUserByPhone(body.phone);
    if (existingByPhone && existingByPhone.id !== userId) {
      return res.status(409).json({
        ok: false,
        error: `이미 ${existingByPhone.provider?.toUpperCase() || '다른'} 계정으로 가입된 전화번호입니다.`,
      });
    }

    await this.userService.updatePhoneNumber(userId, body.phone);
    await this.userService.setPhoneVerified(userId);

    const updatedUser = await this.userService.findUserById(userId);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ ok: false, error: '유저를 찾을 수 없습니다.' });
    }

    const accessToken = jwt.sign(
      { id: updatedUser.id, role: updatedUser.role },
      this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({
      ok: true,
      message: '전화번호 등록 완료, 로그인 완료',
      access_token: accessToken,
    });
  }

  // 로그인 체크
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
