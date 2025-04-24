import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { Gender, UserRole } from 'src/users/users.entity';

interface JwtUser {
  id: number;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  // 구글 로그인
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  // // 카카오 로그인
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.kakaoLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
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

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  // 임시토큰 확인
  @Post('/check-temp-token')
  @UseGuards(AuthGuard('jwt-temp'))
  async checkTempToken(@Req() req: Request) {
    const user = req.user as JwtUser;
    const foundUser = await this.usersService.findUserById(user.id);
    if (!foundUser) return { isLoggedIn: false };
    return { isLoggedIn: true, user: foundUser };
  }

  // 닉네임 중복 검사
  @Get('/nickName')
  @UseGuards(AuthGuard('jwt-temp'))
  async checkNickname(@Query('nickName') nickName: string) {
    if (!nickName) return { ok: false, error: '닉네임을 입력해주세요.' };
    const user = await this.usersService.findUserByNickname(nickName);
    return user
      ? { ok: false, message: '이미 사용 중인 닉네임입니다.' }
      : { ok: true, message: '사용 가능한 닉네임입니다.' };
  }

  // 전화번호
  @Post('/update-phone')
  @UseGuards(AuthGuard('jwt-temp'))
  async updatePhone(
    @Req() req: Request,
    @Body() body: { phone: string; gender: Gender; nickName: string },
  ) {
    const user = req.user as JwtUser;
    const userId = user?.id;
    if (!userId) return { ok: false, error: '유저 정보가 없습니다.' };

    const existing = await this.usersService.findUserByPhone(body.phone);
    if (existing && existing.id !== userId) {
      return {
        ok: false,
        error: `이미 ${existing.provider?.toUpperCase() || '다른'} 계정으로 가입된 전화번호입니다.`,
      };
    }

    await this.usersService.updatePhoneNumber(userId, body.phone);
    await this.usersService.setPhoneVerified(userId);
    await this.usersService.updateProfile(userId, body);

    const updatedUser = await this.usersService.findUserById(userId);
    if (!updatedUser) return { ok: false, error: '유저를 찾을 수 없습니다.' };

    const tokens = await this.authService.issueTokens(updatedUser);
    return { ok: true, message: '전화번호 등록 완료, 로그인 완료', ...tokens };
  }

  // 로그인 체크
  @Get('/check')
  async checkLogin(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return { isLoggedIn: false };
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;
      const user = await this.usersService.findUserById(payload.id);
      return user ? { isLoggedIn: true, user } : { isLoggedIn: false };
    } catch {
      return { isLoggedIn: false };
    }
  }

  // 관리자 로그인
  @Post('/adminLogin')
  async adminLogin(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.findUserByEmail(body.email);
    if (!user || user.role !== UserRole.ADMIN)
      return { ok: false, error: '관리자 계정을 찾을 수 없습니다.' };

    const valid = await bcrypt.compare(body.password, user.admin_password);
    if (!valid) return { ok: false, error: '비밀번호가 틀렸습니다.' };

    const tokens = await this.authService.issueTokens(user);
    return { ok: true, message: '관리자 로그인 성공', ...tokens };
  }

  // 관리자 로그인 확인
  @Get('/adminCheck')
  async checkAdminLogin(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return { isLoggedIn: false };
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;
      const user = await this.usersService.findUserById(payload.id);
      return user
        ? { isLoggedIn: true, user: { id: user.id, email: user.email } }
        : { isLoggedIn: false };
    } catch {
      return { isLoggedIn: false };
    }
  }

  @Get('/refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.headers['x-refresh-token'] as string;
    if (!refreshToken) return { ok: false, error: 'Refresh token이 없습니다.' };

    try {
      const decoded = jwt.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
      ) as any;
      const user = await this.usersService.findUserById(Number(decoded.aud));
      if (!user || user.eid_refresh_token !== refreshToken) {
        return { ok: false, error: '토큰이 만료되었거나 일치하지 않습니다.' };
      }
      const { accessToken } = await this.authService.issueTokens(user);
      return { ok: true, access_token: accessToken };
    } catch {
      return { ok: false, error: '토큰 검증 실패' };
    }
  }

  @Get('/logout')
  async logout() {
    return { ok: true, message: '로그아웃 성공' };
  }
}
